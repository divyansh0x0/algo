import type { World } from "../World";

export interface EntitySystem {
    start(): boolean;

    update(dt: number, world: World): void;

    end(): void;
}