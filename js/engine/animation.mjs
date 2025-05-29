import {roundedClamp} from "../utils/PMath.mjs";

function hexToRgba(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Validate hex length
    if (![3, 4, 6, 8].includes(hex.length)) {
        throw new Error('Invalid hex color code'+hex+'. Must be 3, 4, 6, or 8 digits.');
    }

    // Expand 3 or 4 digit hex to 6 or 8
    if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Parse hex values
    let r, g, b, a = 1;

    if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
    }

    // Round alpha to 2 decimal places
    a = Math.round(a * 100) / 100;

    return {
        r: r,
        g: g,
        b: b,
        a: a
    };
}
function rgbaToHex(rgba, forceRemoveAlpha = false) {
    rgba.a *= 255;
    const toHex = (num) => {
        const hex = roundedClamp(num,0,255).toString(16);
        return hex.length === 1? "0"+hex : hex;
    }

    return "#" + toHex(rgba.r) + toHex(rgba.g) + toHex(rgba.b) + toHex(rgba.a);
}

function isValidColor(color) {
    return (color.length >= 3 && color.startsWith("#"))
}

function transition(curr_val, to_val, t, easing) {
    if (curr_val === to_val)
        return to_val;
    return curr_val + (to_val - curr_val) * easing(t);
}

export const EasingFunctions = Object.freeze({
    LINEAR: t => t,
    EASE_IN_SIN: t => 1 - Math.cos(t * Math.PI / 2),
    EASE_OUT_SIN: t => Math.sin(t * Math.PI / 2),
    EASE_IN_OUT_SIN: t => (1 - Math.cos(t * Math.PI)) / 2, //its identity of sin(t* pi/2)^2
    EASE_IN_CUBIC: t => t ** 3,
    EASE_OUT_CUBIC: t => 1 - (1 - t) ** 3,
    EASE_IN_OUT_CUBIC: t => t < 0.5 ? 4 * t ** 3 : 1 - (1 - t) ** 3,
    EASE_IN_QUAD: t => t * t,
    EASE_OUT_QUAD: t => 1 - (1 - t) ** 2,
    EASE_IN_OUT_QUAD: t => t < 0.5 ? 2 * t ** 2 : 1 - (1 - t) ** 2
});

class Animation {
    constructor(drawable, total_duration_ms, easing) {
        this.total_duration_ms = total_duration_ms;
        this.duration_passed_ms = 0;
        this.easing = easing;
        this.drawable = drawable;
    }

    setNormalizedTime(t) {
        console.error("Undefined step")
    }

    finalize() {
        console.error("Animation unfinalized")
    }

    getId() {
        return this.constructor.name + this.drawable.id
    }
    stop(){};
}



export class ColorAnimation extends Animation {
    constructor(drawable, from_hex, to_hex, duration_ms = 250, easing = EasingFunctions.EASE_IN_OUT_SIN) {
        super(drawable, duration_ms, easing);
        if (!isValidColor(from_hex) || !isValidColor(to_hex)) {
            console.error("Invalid color provided for animation of " +drawable.id+ ".")
        }
        this.from_rgba = hexToRgba(from_hex);
        this.curr_rgba = hexToRgba(from_hex);
        this.to_rgba = hexToRgba(to_hex);
        if (!this.from_rgba || !this.to_rgba)
            console.error("Couldn't parse color for animation.");
        this.drawable.is_color_animating = true;
    }

    setNormalizedTime(t) {
        this.curr_rgba.r = roundedClamp(transition(this.from_rgba.r, this.to_rgba.r, t, this.easing), 0, 255);
        this.curr_rgba.g = roundedClamp(transition(this.from_rgba.g, this.to_rgba.g, t, this.easing), 0, 255);
        this.curr_rgba.b = roundedClamp(transition(this.from_rgba.b, this.to_rgba.b, t, this.easing), 0, 255);
        this.curr_rgba.a = roundedClamp(transition(this.from_rgba.a, this.to_rgba.a, t, this.easing), 0, 255);
        this.update_color();
    }

    finalize() {
        this.setNormalizedTime(1)
        this.curr_rgba = this.to_rgba;
        this.drawable.is_color_animating = false;
        this.interrupt();
    }
    interrupt(){
        this.drawable.color = rgbaToHex(this.curr_rgba);
        this.drawable.is_animating = false;
    }

    update_color() {
        this.drawable.color = `rgba(${this.curr_rgba.r}, ${this.curr_rgba.g}, ${this.curr_rgba.b}, ${this.curr_rgba.a})`
    }
}

export class Animator {
    constructor() {
        this.animations = {}

    }

    add(animation) {
        const animation_id = animation.getId();
        // console.log("Adding animation", animation_id)
        if(animation_id in this.animations)
            this.animations[animation_id].interrupt();
        this.animations[animation_id] = animation;
    }

    step(dt_ms) {
        for (const id in this.animations) {
            const animation = this.animations[id]
            animation.duration_passed_ms += dt_ms;

            if (animation.duration_passed_ms > animation.total_duration_ms) {
                animation.duration_passed_ms = animation.total_duration_ms;
                animation.finalize();
                delete this.animations[id];
                break
            }

            const t = animation.duration_passed_ms / animation.total_duration_ms;
            animation.setNormalizedTime(t)

        }
    }
}