export const MathUtils = {
    roundedClamp(val: number, min: number, max: number) {
        return MathUtils.clamp(Math.round(val), min, max);
    },

    clamp(val: number, min: number, max: number) {
        return Math.max(Math.min(val, max), min);
    },

    equateFloats(a: number, b: number, error = 0.1) {
        return Math.abs(a - b) < error;
    },

    round(val: number, accuracy: number) {
        const factor = 10 ** accuracy;
        return Math.round(val * factor) / factor;
    }
} as const;