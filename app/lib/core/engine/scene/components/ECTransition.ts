import type { Color } from "../../utils/Color";
import { type EasingFunction, Easings } from "../../utils/Easing";
import { ECID, type EntityComponent } from "./EntityComponent";

export enum ECColorTransitionType {
    Fill,
    Border,
    Text
}

export class ECColorTransition implements EntityComponent {
    public elaspedTimeMs: number = 0;
    id: ECID = ECID.ColorTransition as const;

    constructor(
        public startColor: Color,
        public endColor: Color,
        public durationMs: number,
        public target: ECColorTransitionType,
        public easing: EasingFunction = Easings.linear
    ) {
    };
}