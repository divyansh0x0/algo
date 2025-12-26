import {ECID, type EntityComponent} from "~/lib/engine/scene/components/EntityComponent";
import {Vector2D} from "~/lib/engine/utils";
import {type EasingFunction, Easings} from "~/lib/engine/utils/Easing";

export class ECMoveTo implements EntityComponent {
    id: ECID = ECID.MoveTo;
    elapsedTimeMs = 0;

    constructor(public finalPos: Vector2D, public durationMs: number, public easingFunction: EasingFunction = Easings.linear) {
    }
}