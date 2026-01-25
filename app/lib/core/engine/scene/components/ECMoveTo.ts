import { ECID, type EntityComponent } from "~/lib/core/engine/scene/components/EntityComponent";
import type { Vector2D } from "~/lib/core/engine/utils";
import { type EasingFunction, Easings } from "~/lib/core/engine/utils/Easing";

export class ECMoveTo implements EntityComponent {
    id: ECID = ECID.MoveTo;
    elapsedTimeMs = 0;

    constructor(
                public initialPos: Vector2D,
                public finalPos: Vector2D,
                public durationMs: number = 250,
                public easingFunction: EasingFunction = Easings.linear) {
    }
}