import {type EntitySystem, ESRequirements} from "~/lib/core/engine/scene/systems/EntitySystem";
import type {Entity} from "~/lib/core/engine/scene/Entity";
import {ECID, ECPosition} from "~/lib/core/engine/scene/components";
import {ECStackLayout, ECStackLayoutDirection} from "~/lib/core/engine/scene/components/ECStackLayout";
import {ECAxisAlignedBoundingBox} from "~/lib/core/engine/scene/components/ECAxisAlignedBoundingBox";
import {Vector2D} from "~/lib/core/engine/utils";
import {ECGroupMember} from "~/lib/core/engine/scene/components/ECGroupMember";
import {ESMoveTo} from "~/lib/core/engine/scene/systems/ESMoveTo";
import {ECMoveTo} from "~/lib/core/engine/scene/components/ECMoveTo";
import type { World } from "../World";

export class ESStackLayout implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.StackLayout, ECID.Position);

    end(): void {
    }

    start(): boolean {
        return true;
    }

    layHorizontally(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[],world: World) {
        let stackHalfWidth = 0;
        for (const member of members) {
            const aabb = world.getComponent(member,ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfWidth += aabb.halfWidth;
        }
        stackHalfWidth += stackLayout.spacing * (members.length - 1) / 2

        let lastX = layoutCenter.x - stackHalfWidth;
        for (const member of members) {
            const aabb = world.getComponent(member,ECAxisAlignedBoundingBox);
            const pos = world.getComponent(member,ECPosition);
            if (!pos || !aabb) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastX += aabb.halfWidth;
            // if(pos.x !== lastX && pos.y !==  layoutCenter.y){
                if(!world.entityHas(member, ECMoveTo)){
                    world.addComponent(member, new ECMoveTo(new Vector2D(lastX,layoutCenter.y), 1000));

                }
                // pos.x = lastX;
                // pos.y = layoutCenter.y;
            // }
            lastX += aabb.halfWidth + stackLayout.spacing;
        }
    }

    layVertically(stackLayout: ECStackLayout, layoutCenter: Vector2D, members: Entity[],world: World) {
        let stackHalfHeight = 0;
        for (const member of members) {
            const aabb = world.getComponent(member, ECAxisAlignedBoundingBox);
            if (!aabb) {
                throw new Error("Axis Aligned Bounding Box must be defined for a member for a stack layout entity. Add ECAxisAlignedBoundingBox component to all layout members");
            }
            stackHalfHeight += aabb.halfHeight;
        }
        stackHalfHeight += stackLayout.spacing * (members.length - 1) / 2
        let lastY = layoutCenter.y - stackHalfHeight;
        for (const member of members) {
            const aabb = world.getComponent(member,ECAxisAlignedBoundingBox);
            const pos = world.getComponent(member,ECPosition);
            if (!pos || !aabb) {
                throw new Error("Position must be defined for a member for a stack layout entity. Add ECPosition component to all layout members");
            }

            lastY += aabb.halfHeight;
            pos.x = layoutCenter.x;
            pos.y = lastY;
            lastY += aabb.halfHeight + stackLayout.spacing;
        }
    }

    update(_: number,world: World): void {
        // console.log(entities)
        for (const entity of world.getEntities()) {
            const stackLayout = world.getComponent(entity,ECStackLayout);
            const layoutCenter = world.getComponent(entity,ECPosition);
            if(!stackLayout || !layoutCenter)
                continue;            
            // const layoutAABB = world.getComponent(entity,ECAxisAlignedBoundingBox);
            const members = stackLayout.members;

            const sortedMembers = members.sort((entA, entB)=>{
                const a =world.getComponent(entA,ECGroupMember);
                const b = world.getComponent(entB,ECGroupMember);
                if(a && b)
                    return a.index - b.index
                else
                    return 0;
            })
            let lastMemberIndex = 0;
            for (const member of members) {
                if (!world.entityHas(entity,ECGroupMember)) {
                    world.addComponent(entity, new ECGroupMember(lastMemberIndex));
                } else
                    lastMemberIndex++;
            }
            if (stackLayout.direction === ECStackLayoutDirection.Horizontal)
                this.layHorizontally(stackLayout, layoutCenter, sortedMembers, world);
            else
                this.layVertically(stackLayout, layoutCenter, sortedMembers, world);


        }
    }

}