import {type EntitySystem, ESRequirements} from "~/lib/engine/scene/systems/EntitySystem";
import type {Entity} from "~/lib/engine/scene/Entity";
import {ECID, ECPosition} from "~/lib/engine/scene/components";
import {ECMoveTo} from "~/lib/engine/scene/components/ECMoveTo";
import {lerp} from "~/lib/engine/utils/Lerp";

export class ESMoveTo implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.Position, ECID.MoveTo);

    end(): void {
    }

    start(): boolean {
        return true;
    }

    update(dt: number, entities: Entity[]): void {
        for (const entity of entities) {
            const moveTo = entity.get(ECMoveTo)!;
            const pos = entity.get(ECPosition)!;
            const t = Math.min(moveTo.elapsedTimeMs / moveTo.durationMs, 1)
            if (t === 1) {
                entity.markForRemoval(ECMoveTo);
                continue;
            }
            const newX = lerp(pos.x, moveTo.finalPos.x, t);
            const newY = lerp(pos.y, moveTo.finalPos.y, t);

            moveTo.elapsedTimeMs += dt;

            pos.set(newX, newY);
        }
    }

}