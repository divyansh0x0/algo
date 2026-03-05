import { Easings, lerp, MathUtils, Vector2D } from "../../utils";
import { ERCamera, ERMouse } from "../resources";

import type { World } from "../World.ts";
import type { EntitySystem } from "./EntitySystem.ts";

export class ESCamera implements EntitySystem {
    private isDragging: boolean = false;
    private dragStart: Vector2D = new Vector2D(0, 0);
    private maxScale: number = 5;
    private minScale: number = 0.5;
    private ZOOM_STEP: number = 1.5;
    private scaleTransition = {
        end: 1,
        start: 1,
        t: 0,
        durationMs: 250
    };

    start(): boolean {
        return true;
    }

    update(dt_ms: number, world: World): void {
        const camera = world.getResource(ERCamera);
        const mouse = world.getResource(ERMouse);

        if (!camera || !mouse)
            return;

        const lastScrollDelta: number = mouse.lastScrollDelta;
        if (lastScrollDelta !== 0) {
            const factor = lastScrollDelta > 0 ? 1 / this.ZOOM_STEP : this.ZOOM_STEP;
            const oldScale = camera.scale;

            const newScale = MathUtils.clamp(
                oldScale * factor,
                this.minScale,
                this.maxScale
            );
            this.scaleTransition.t = 0;
            this.scaleTransition.start = oldScale;
            this.scaleTransition.end = newScale;
        }
        this.scaleTransition.t += dt_ms / this.scaleTransition.durationMs;
        if (this.scaleTransition.t < 1){
            const newScale = lerp(this.scaleTransition.start, this.scaleTransition.end, this.scaleTransition.t, Easings.linear);
            camera.setScale(newScale, mouse.position);
        }

        if (!mouse.pressed)
            this.isDragging = false;
        if (!this.isDragging) {
            if (mouse.pressed) {
                this.isDragging = true;
                this.dragStart.x = mouse.position.x;
                this.dragStart.y = mouse.position.y;
            }
        }
        if (this.isDragging) {
            const newPos = mouse.position;
            camera.position.x -= (newPos.x - this.dragStart.x) / camera.scale;
            camera.position.y += (newPos.y - this.dragStart.y) / camera.scale;
            this.dragStart.x = mouse.position.x;
            this.dragStart.y = mouse.position.y;

        }
    }

    end(): void {

    }

}