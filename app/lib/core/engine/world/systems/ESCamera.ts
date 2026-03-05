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

        // Note: -1 * mouse.lastScrollDelta is required because without it the zoom in and out will be inverted
        const zoomDelta = -1 * mouse.lastScrollDelta;
        if (zoomDelta) {
            const [ beforeX, beforeY ] =
                camera.canvasToWorld(mouse.position.x, mouse.position.y);

            camera.scale += this.SCALE_STEP * zoomDelta;
            camera.scale = Math.max(
                Math.min(this.MAX_SCALE, camera.scale),
                this.MIN_SCALE
            );

            const [ afterX, afterY ] =
                camera.canvasToWorld(mouse.position.x, mouse.position.y);

            camera.position.x -= (afterX - beforeX);
            camera.position.y -= (afterY - beforeY);

            return;
        }


        console.log(camera.position.x, camera.position.y);
        if (mouse.isConsumed())
            return;
        // Detect drag start
        if (mouse.pressed && !this.isDragging) {
            this.isDragging = true;
            this.dragStart.x = mouse.position.x;
            this.dragStart.y = mouse.position.y;
        }
        // Detect drag end
        if (!mouse.pressed) {
            this.isDragging = false;
            mouse.setCursorType("default");
            return;
        }
        if (!this.isDragging)
            mouse.setCursorType("default");

        mouse.setCursorType("move");


        const dx = mouse.position.x - this.dragStart.x;
        const dy = mouse.position.y - this.dragStart.y;

        this.dragStart.x = mouse.position.x;
        this.dragStart.y = mouse.position.y;

        camera.position.x -= dx / camera.scale;
        camera.position.y += dy / camera.scale;

        console.log(camera.scale, dx, dy);


    }

    end(): void {

    }

}