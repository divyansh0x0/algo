import {ECID} from "../components/EntityComponent";
import type {Entity} from "../Entity";
import {type EntitySystem, ESRequirements} from "./EntitySystem";
import {ECColorTransition, ECColorTransitionType} from "../components/ECTransition";
import {ECBackgroundColor, ECBorderColor, ECTextColor} from "../components/ECColor";
import {lerpColor} from "~/lib/core/engine/utils/Lerp";
import {Color} from "~/lib/core/engine/utils/Color";

export class TransitionSystem implements EntitySystem {
    requirement = ESRequirements.from(ECID.Color, ECID.ColorTransition);

    start(): boolean {
        return true;
    }

    update(dt: number, entities: Entity[]): void {
        for (const entity of entities) {
            const transition = entity.get(ECColorTransition)!;
            let colorComponent: Color | undefined;
            // Determine which color to transition
            switch (transition?.target) {
                case ECColorTransitionType.Fill:
                    colorComponent = entity.get(ECBackgroundColor)?.value;
                    break;
                case ECColorTransitionType.Border:
                    colorComponent = entity.get(ECBorderColor)?.value;
                    break;
                case ECColorTransitionType.Text:
                    colorComponent = entity.get(ECTextColor)?.value;
                    break;
            }
            if (!colorComponent) continue;

            // Transition logic
            const t = Math.min(transition.elaspedTimeMs / transition.durationMs, 1);
            const easedT = transition.easing(t);
            lerpColor(colorComponent, transition.startColor, transition.endColor, easedT);
            transition.elaspedTimeMs += dt;
        }
    }

    end(): void {
        throw new Error("Method not implemented.");
    }

}