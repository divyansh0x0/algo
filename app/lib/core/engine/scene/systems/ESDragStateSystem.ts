import {Entity} from "../Entity";
import {ECPosition} from "../components/ECPosition";
import {ECDraggable} from "../components/ECDraggable";
import {type EntitySystem, ESRequirements} from "./EntitySystem";
import {ECID, ECMouseListener} from "../components";
import {ECAxisAlignedBoundingBox} from "../components/ECAxisAlignedBoundingBox";
import type { World } from "../World";

export class ESDragStateSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Draggable, ECID.Position, ECID.AABB, ECID.MouseListener);

    start(): boolean {
        return true;
    }

    update(_: number, world: World) {
        for (const entity of world.getEntities() ) {

            const drag = world.getComponent(entity,ECDraggable);
            const mouse = world.getComponent(entity,ECMouseListener);
            const pos = world.getComponent(entity,ECPosition);
            const aabb = world.getComponent(entity,ECAxisAlignedBoundingBox);
            
            if(!drag || !mouse|| !pos || !aabb)
                continue;
            if (!mouse.mouseDown) {
                drag.offsetX = 0;
                drag.offsetY = 0;
                drag.isDragging = false;
            }
            if (drag.isDragging) continue;

            if (mouse.mouseDown && ECAxisAlignedBoundingBox.containsPoint(pos, aabb, mouse.mousePosition)) {
                drag.offsetX = mouse.mousePosition.x - pos.x;
                drag.offsetY = mouse.mousePosition.y - pos.y;
                drag.isDragging = true;
            }


        }
    }

    end(): void {
        throw new Error('Method not implemented.');
    }

}