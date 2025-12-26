import {Entity} from '../Entity';
import {ECPosition} from '../components/ECPosition';
import {ECDraggable} from '../components/ECDraggable';
import {type EntitySystem, ESRequirements} from './EntitySystem';
import {ECID, ECMouseListener} from '../components';
import {ECAxisAlignedBoundingBox} from '../components/ECAxisAlignedBoundingBox';

export class ESDragStateSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Draggable, ECID.Position, ECID.AABB, ECID.MouseListener);

    start(): boolean {
        return true;
    }

    update(_: number, entities: Entity[]): void {
        for (const entity of entities) {

            const drag = entity.get(ECDraggable)!;
            const mouse = entity.get(ECMouseListener)!;
            if (!mouse.mouseDown) {
                drag.offsetX = 0;
                drag.offsetY = 0;
                drag.isDragging = false;
            }
            if (drag.isDragging) continue;
            const pos = entity.get(ECPosition)!;
            const aabb = entity.get(ECAxisAlignedBoundingBox)!;
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