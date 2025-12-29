import {Entity} from "../Entity";
import {ECPosition} from "../components/ECPosition";
import {ECDraggable} from "../components/ECDraggable";
import {type EntitySystem, ESRequirements} from "./EntitySystem";
import {ECID, ECMouseListener} from "../components";
import {ECGroupMember} from "~/lib/core/engine/scene/components/ECGroupMember";

export class ESDragMoveSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Draggable, ECID.Position, ECID.AABB, ECID.MouseListener);

    start(): boolean {
        return true;
    }

    applyDrag(entity: Entity) {

        const drag = entity.get(ECDraggable)!;
        if (!drag.isDragging) {
            return;
        }
        const pos = entity.get(ECPosition)!;
        const mouse = entity.get(ECMouseListener)!;

        const newPos = mouse.mousePosition;
        pos.set(newPos.x - drag.offsetX, newPos.y - drag.offsetY);

    }

    update(_: number, entities: Entity[]): void {
        for (const entity of entities) {
            const groupMember = entity.get(ECGroupMember);
            if (!groupMember) {
                this.applyDrag(entity);
            } else {

            }
        }
    }

    end(): void {
        throw new Error('Method not implemented.');
    }

}