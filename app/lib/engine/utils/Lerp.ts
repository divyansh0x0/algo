import type {Color} from "./Color";

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
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