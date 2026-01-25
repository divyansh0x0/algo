import { ECID, ECPosition } from "~/lib/core/engine/scene/components";
import { ECMoveTo } from "~/lib/core/engine/scene/components/ECMoveTo";
import { type EntitySystem, ESRequirements } from "~/lib/core/engine/scene/systems/EntitySystem";
import { lerp } from "~/lib/core/engine/utils/Lerp";
import { Easings } from "../../utils/Easing";
import type { World } from "../World";

export class ESMoveTo implements EntitySystem {
    requirement: ESRequirements = ESRequirements.from(ECID.Position, ECID.MoveTo);

    constructor() {
        console.log("ESMoveTo CREATED");

    }

    end(): void {
    }

    start(): boolean {
        return true;
    }

    update(dt_ms: number, world: World): void {
        for (const entity of world.getEntities()) {
            const moveTo = world.getComponent(entity, ECMoveTo);
            const pos = world.getComponent(entity, ECPosition);
            if (!moveTo || !pos)
                continue;
            moveTo.elapsedTimeMs += dt_ms;
            const t = Math.min(moveTo.elapsedTimeMs / moveTo.durationMs, 1);
            // console.log(moveTo.initialPos,moveTo.finalPos,moveTo.elapsedTimeMs,dt_ms);
            if (t >= 1) {
                console.log("Removed");
                world.removeComponent(entity, ECMoveTo);
                continue;
            }
            const newX = lerp(moveTo.initialPos.x, moveTo.finalPos.x, t, Easings.easeInOutSin);
            const newY = lerp(moveTo.initialPos.y, moveTo.finalPos.y, t, Easings.linear);
            // console.log(moveTo.initialPos, moveTo.finalPos);

            pos.set(newX, newY);
        }
    }

}