import {type EntitySystem, ESRequirements} from "~/lib/engine/scene/systems/EntitySystem";
import type {Entity} from "~/lib/engine/scene/Entity";
import {ECID, ECPosition} from "~/lib/engine/scene/components";
import {ECStackLayout, ECStackLayoutDirection} from "~/lib/engine/scene/components/ECStackLayout";
import {ECAxisAlignedBoundingBox} from "~/lib/engine/scene/components/ECAxisAlignedBoundingBox";
import {Vector2D} from "~/lib/engine/utils";

export class ESStackLayout implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.StackLayout, ECID.Position);

    end(): void {
    }

    start(): boolean {
        return true;
    }

    layHorizontally(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[]) {
        let stackHalfWidth = 0;
        for (const member of members) {
            const aabb = member.get(ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfWidth += aabb.halfWidth;
        }
        stackHalfWidth += stackLayout.spacing * (members.length - 1) / 2

        let lastX = layoutCenter.x - stackHalfWidth;
        for (const member of members) {
            const aabb = member.get(ECAxisAlignedBoundingBox)!;
            const pos = member.get(ECPosition);
            if (!pos) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastX += aabb.halfWidth;
            pos.x = lastX;
            pos.y = layoutCenter.y;
            lastX += aabb.halfWidth + stackLayout.spacing;
        }
    }

    layVertically(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[]) {
        let stackHalfHeight = 0;
        for (const member of members) {
            const aabb = member.get(ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfHeight += aabb.halfHeight;
        }
        stackHalfHeight += stackLayout.spacing * (members.length - 1) / 2
        let lastY = layoutCenter.y - stackHalfHeight;
        for (const member of members) {
            const aabb = member.get(ECAxisAlignedBoundingBox)!;
            const pos = member.get(ECPosition);
            if (!pos) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastY += aabb.halfHeight;
            pos.x = layoutCenter.x;
            pos.y = lastY;
            lastY += aabb.halfHeight + stackLayout.spacing;
        }
    }

    update(_: number, entities: Entity[]): void {
        // console.log(entities)
        for (const entity of entities) {
            const layoutCenter = entity.get(ECPosition)!;
            // const layoutAABB = entity.get(ECAxisAlignedBoundingBox);
            const stackLayout = entity.get(ECStackLayout)!;
            const members = stackLayout.members;
            if (stackLayout.direction === ECStackLayoutDirection.Horizontal)
                this.layHorizontally(stackLayout, layoutCenter, members);
            else
                this.layVertically(stackLayout, layoutCenter, members);


        }
    }

}