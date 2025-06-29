export class Vmath {
    static roundedClamp(val: number, min: number, max: number) {
        return Vmath.clamp(Math.round(val), min, max);
    }

    static clamp(val: number, min: number, max: number) {

        return Math.max(Math.min(val, max), min);

    }
}

