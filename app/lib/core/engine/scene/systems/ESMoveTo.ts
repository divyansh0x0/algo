import {type EntitySystem, ESRequirements} from "~/lib/core/engine/scene/systems/EntitySystem";
import type {Entity} from "~/lib/core/engine/scene/Entity";
import {ECID, ECPosition} from "~/lib/core/engine/scene/components";
import {ECMoveTo} from "~/lib/core/engine/scene/components/ECMoveTo";
import {lerp} from "~/lib/core/engine/utils/Lerp";

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
            console.log("Moving to:", moveTo.finalPos);
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