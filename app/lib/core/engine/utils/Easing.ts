export type EasingFunction = (t: number) => number;

export const Easings = {
    linear: (t: number) => t,

    easeInSin: (t: number) => 1 - Math.cos(t * Math.PI / 2),
    easeOutSin: (t: number) => Math.sin(t * Math.PI / 2),
    easeInOutSin: (t: number) => (1 - Math.cos(t * Math.PI)) / 2,

    easeInCubic: (t: number) => t ** 3,
    easeOutCubic: (t: number) => 1 - (1 - t) ** 3,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t ** 3 : 1 - (1 - t) ** 3,

    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => 1 - (1 - t) ** 2,
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t ** 2 : 1 - (1 - t) ** 2,
};