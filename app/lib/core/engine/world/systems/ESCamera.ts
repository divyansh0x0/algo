import { MathUtils, Vector2D } from "../../utils";
import { ERCamera, ERMouse } from "../resources";

import type { World } from "../World.ts";
import type { EntitySystem } from "./EntitySystem.ts";

export class ESCamera implements EntitySystem {
    private isDragging: boolean = false;
    private dragStart: Vector2D = new Vector2D(0, 0);
    private maxScale: number = 5;
    private minScale: number = 0.1;
    private SCALE_STEP: number = 0.2;

    start(): boolean {
        return true;
    }

    update(_: number, world: World): void {
        const camera = world.getResource(ERCamera);
        const mouse = world.getResource(ERMouse);

        if (!camera || !mouse)
            return;

        const lastScrollDelta: number = mouse.lastScrollDelta;
        if(lastScrollDelta !== 0){
            camera.scale = MathUtils.clamp(camera.scale - Math.sign(lastScrollDelta) * this.SCALE_STEP, this.minScale, this.maxScale);
            camera.zoomPivot = mouse.getWorldPosition(camera);
            console.log(lastScrollDelta, camera.scale);
        }

        if(!mouse.pressed)
            this.isDragging = false;
        if(!this.isDragging){
            if(mouse.pressed){
                this.isDragging = true;
                this.dragStart.x = mouse.position.x;
                this.dragStart.y = mouse.position.y;
            }
        }
        if(this.isDragging){
            const newPos = mouse.position;
            camera.position.x -= (newPos.x - this.dragStart.x)/camera.scale;
            camera.position.y -= (newPos.y - this.dragStart.y)/camera.scale;
            this.dragStart.x = mouse.position.x;
            this.dragStart.y = mouse.position.y;

        }
    }

    end(): void {

    }

}