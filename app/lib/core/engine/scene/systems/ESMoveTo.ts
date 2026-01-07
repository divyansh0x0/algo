import { ECID, ECPosition } from "~/lib/core/engine/scene/components";
import { ECMoveTo } from "~/lib/core/engine/scene/components/ECMoveTo";
import { type EntitySystem, ESRequirements } from "~/lib/core/engine/scene/systems/EntitySystem";
import { lerp } from "~/lib/core/engine/utils/Lerp";
import { Easings } from "../../utils/Easing";
import type { World } from "../World";

export class ESMoveTo implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.Position, ECID.MoveTo);

    end(): void {
    }

    start(): boolean {
        return true;
    }

    update(dt: number, world: World): void {
        for (const entity of world.getEntities()) {
            const moveTo = world.getComponent(entity, ECMoveTo);
            if (!moveTo)
                continue;
            const pos = world.getComponent(entity, ECPosition);
            const t = Math.min(moveTo.elapsedTimeMs / moveTo.durationMs, 1);
            if (!pos)
                continue;
            if (t === 1) {
                world.removeComponent(entity, ECMoveTo);
                continue;
            }
            const newX = lerp(pos.x, moveTo.finalPos.x, t, Easings.easeInOutCubic);
            const newY = lerp(pos.y, moveTo.finalPos.y, t, Easings.easeInOutCubic);

            moveTo.elapsedTimeMs += dt;

            pos.set(newX, newY);
        }
    }

}