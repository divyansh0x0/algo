import { Vector2D } from "../../utils";
import { ERCamera, ERMouse } from "../resources";

import type { World } from "../World.ts";
import type { EntitySystem } from "./EntitySystem.ts";

export class ESCamera implements EntitySystem {
    private isDragging: boolean = false;
    private dragStart: Vector2D = new Vector2D(0, 0);
    private MAX_SCALE: number = 5;
    private MIN_SCALE: number = 0.1;
    private SCALE_STEP: number = 0.2;

    start(): boolean {
        return true;
    }

    update(_: number, world: World): void {
        const camera = world.getResource(ERCamera);
        const mouse = world.getResource(ERMouse);

        if (!camera || !mouse)
            return;


    }

    end(): void {

    }

}