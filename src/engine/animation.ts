import { Color } from "@/engine/color";
import { Drawable } from "@/engine/components/drawable";
import { Vmath } from "@/utils/vmath";


function transition(curr_val: number, to_val: number, t: number, easing: (t: number) => number) {
    if (curr_val === to_val)
        return to_val;
    return curr_val + (to_val - curr_val) * easing(t);
}

export class EasingFunctions {
    static linear(t: number): number {
        return t;
    }

    static easeInSin(t: number): number {
        return 1 - Math.cos(t * Math.PI / 2);
    }

    static easeOutSin(t: number): number {
        return Math.sin(t * Math.PI / 2);
    }

    static easeInOutSin(t: number): number {
        return (1 - Math.cos(t * Math.PI)) / 2;
    }

    static easeInCubic(t: number): number {
        return t ** 3;
    }

    static easeOutCubic(t: number): number {
        return 1 - (1 - t) ** 3;
    }

    static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t ** 3 : 1 - (1 - t) ** 3;
    }

    static easeInQuad(t: number): number {
        return t * t;
    }

    static easeOutQuad(t: number): number {
        return 1 - (1 - t) ** 2;
    }

    static easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t ** 2 : 1 - (1 - t) ** 2;
    }
}


abstract class Animation {
    public total_duration_ms: number;
    public duration_passed_ms: number;
    public drawable: Drawable;
    protected easing: (t: number) => number;

    protected constructor(drawable: Drawable, total_duration_ms: number, easing_function: ((t: number) => number)) {
        this.total_duration_ms = total_duration_ms;
        this.duration_passed_ms = 0;
        this.easing = easing_function;
        this.drawable = drawable;
    }

    abstract setNormalizedTime(t: number): void ;

    abstract finalize(): void;

    getId() {
        return this.constructor.name + this.drawable.id;
    }

    abstract interrupt(): void;
}


export class ColorAnimation extends Animation {
    private from: Color;
    private readonly to: Color;

    constructor(drawable: Drawable, from: Color, to: Color, duration_ms = 250, easing_function: ((t: number) => number) = EasingFunctions.easeInSin) {
        super(drawable, duration_ms, easing_function);
        this.from = from;
        this.to = to;
        this.drawable.is_color_animating = true;
    }

    setNormalizedTime(t: number) {
        const r = Vmath.roundedClamp(transition(this.from.r, this.to.r, t, this.easing), 0, 255);
        const g = Vmath.roundedClamp(transition(this.from.g, this.to.g, t, this.easing), 0, 255);
        const b = Vmath.roundedClamp(transition(this.from.b, this.to.b, t, this.easing), 0, 255);
        const a = Vmath.roundedClamp(transition(this.from.a, this.to.a, t, this.easing), 0, 255);
        this.drawable.color = new Color(r, g, b, a);
        // console.log()
    }

    finalize() {
        this.setNormalizedTime(1);
        this.drawable.is_color_animating = false;
        this.drawable.color = this.to;
        this.interrupt();
    }

    interrupt() {
        this.drawable.is_color_animating = false;
    }


}

export class Animator {
    private animations_map: Map<string, Animation> = new Map();

    add(animation: Animation) {
        const animation_id = animation.getId();
        // console.log("Adding animation", animation_id)
        if (this.animations_map.has(animation_id))
            this.animations_map.get(animation_id)?.interrupt();
        this.animations_map.set(animation_id, animation);
    }

    step(dt_ms: number) {
        for (const [ id, animation ] of this.animations_map) {
            animation.duration_passed_ms += dt_ms;

            if (animation.duration_passed_ms > animation.total_duration_ms) {
                animation.duration_passed_ms = animation.total_duration_ms;
                animation.finalize();
                this.animations_map.delete(id);
                break;
            }

            const t = animation.duration_passed_ms / animation.total_duration_ms;
            animation.setNormalizedTime(t);

        }
    }
}
