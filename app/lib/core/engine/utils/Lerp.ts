import type {Color} from "./Color";
import { Easings, type EasingFunction } from "./Easing";

export function lerp(start: number, end: number, t: number, easing:EasingFunction = Easings.linear): number {
    return start + (end - start) * easing(t);
}

export function lerpColor(
    out: Color,
    from: Color,
    to: Color,
    t: number
) {
    out.r = lerp(from.r, to.r, t);
    out.g = lerp(from.g, to.g, t);
    out.b = lerp(from.b, to.b, t);
    out.a = lerp(from.a, to.a, t);
}