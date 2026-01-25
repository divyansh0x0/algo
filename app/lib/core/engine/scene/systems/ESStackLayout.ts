import { ECID, ECPosition } from "~/lib/core/engine/scene/components";
import { ECAxisAlignedBoundingBox } from "~/lib/core/engine/scene/components/ECAxisAlignedBoundingBox";
import { ECMoveTo } from "~/lib/core/engine/scene/components/ECMoveTo";
import { ECStackLayout, ECStackLayoutDirection } from "~/lib/core/engine/scene/components/ECStackLayout";
import type { Entity } from "~/lib/core/engine/scene/Entity";
import { type EntitySystem, ESRequirements } from "~/lib/core/engine/scene/systems/EntitySystem";
import { Vector2D, equateFloats } from "~/lib/core/engine/utils";
import type { World } from "../World";
export class ESStackLayout implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.StackLayout, ECID.Position);

    end(): void {
    }

    start(): boolean {
        return true;
    }

    layHorizontally(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[], world: World) {
        let stackHalfWidth = 0;
        for (const member of members) {
            const aabb = world.getComponent(member, ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfWidth += aabb.halfWidth;
        }
        stackHalfWidth += stackLayout.spacing * (members.length - 1) / 2;

        let lastX = layoutCenter.x - stackHalfWidth;
        for (const member of members) {
            const aabb = world.getComponent(member, ECAxisAlignedBoundingBox);
            const oldPos = world.getComponent(member, ECPosition);
            if (!oldPos || !aabb) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastX += aabb.halfWidth;
            const newX = lastX;
            const newY = layoutCenter.y;

            if (!world.entityHas(member, ECMoveTo) && (!equateFloats(oldPos.x, newX) || !equateFloats(oldPos.y, newY))) {
                const newPos = new Vector2D(newX,newY);
                world.addComponent(member, new ECMoveTo(oldPos.copy(),newPos));

            } else {
                // console.log("Reusing moveTo");
                // const moveTo = world.getComponent(member, ECMoveTo)!;
                // // target changed → restart animation
                // if (
                //     moveTo.finalPos.x !== newX ||
                //     moveTo.finalPos.y !== newY
                // ) {
                //     moveTo.initialPos = oldPos.copy();
                //     moveTo.finalPos.x = newX;
                //     moveTo.finalPos.y = newY;
                //     moveTo.elapsedTimeMs = 0;
                // }
            }

            lastX += aabb.halfWidth + stackLayout.spacing;
        }
    }

    layVertically(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[], world: World) {
        let stackHalfHeight = 0;
        for (const member of members) {
            const aabb = world.getComponent(member, ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfHeight += aabb.halfHeight;
        }
        stackHalfHeight += stackLayout.spacing * (members.length - 1) / 2;
        let lastY = layoutCenter.y - stackHalfHeight;
        for (const member of members) {
            const aabb = world.getComponent(member, ECAxisAlignedBoundingBox);
            const pos = world.getComponent(member, ECPosition);
            if (!pos || !aabb) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastY += aabb.halfHeight;
            pos.x = layoutCenter.x;
            pos.y = lastY;
            lastY += aabb.halfHeight + stackLayout.spacing;
        }
    }

    update(_: number, world: World): void {
        for (const entity of world.getEntities()) {
            const stackLayout = world.getComponent(entity, ECStackLayout);
            const layoutCenter = world.getComponent(entity, ECPosition);
            if (!stackLayout || !layoutCenter)
                continue;

            if (!stackLayout.isDirty)
                continue;
            // const layoutAABB = world.getComponent(entity,ECAxisAlignedBoundingBox);
            const members = stackLayout.getMembers();
            if (stackLayout.direction === ECStackLayoutDirection.Horizontal)
                this.layHorizontally(stackLayout, layoutCenter, members, world);
            else
                this.layVertically(stackLayout, layoutCenter, members, world);

            stackLayout.isDirty = false;
        }
    }

}