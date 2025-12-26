export type EasingFunction = (t: number) => number;

export class Easings {
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