import { ECGroupMember } from "~/lib/core/engine/scene/components/ECGroupMember";
import { ECID, ECMouseListener } from "../components";
import { ECDraggable } from "../components/ECDraggable";
import { ECPosition } from "../components/ECPosition";
import { Entity } from "../Entity";
import type { World } from "../World";
import { type EntitySystem, ESRequirements } from "./EntitySystem";

export class ESDragMoveSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Draggable, ECID.Position, ECID.AABB, ECID.MouseListener);

    start(): boolean {
        return true;
    }

    applyDrag(entity: Entity, world: World) {

        const drag = world.getComponent(entity, ECDraggable);
        if (!drag || !drag.isDragging) {
            return;
        }
        const pos = world.getComponent(entity, ECPosition);
        const mouse = world.getComponent(entity, ECMouseListener);

        if (!pos || !mouse)
            return;
        const newPos = mouse.mousePosition;
        pos.set(newPos.x - drag.offsetX, newPos.y - drag.offsetY);

    }

    update(_: number, world: World): void {
        for (const entity of world.getEntities()) {
            const groupMember = world.getComponent(entity, ECGroupMember);
            if (!groupMember) {
                this.applyDrag(entity, world);
            } else {

            }
        }
    }

    end(): void {
        throw new Error("Method not implemented.");
    }

}