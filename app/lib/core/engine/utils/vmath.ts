export function roundedClamp(val: number, min: number, max: number) {
    return clamp(Math.round(val), min, max);
}

export function clamp(val: number, min: number, max: number) {

    return Math.max(Math.min(val, max), min);

}

export function equateFloats(a: number, b: number, error = 0.1) {
    return Math.abs(a - b) < error;
}

export function round(val: number, accuracy: number) {
    return Math.round(val * 10 ** (accuracy)) / (10 ** (accuracy));
}


