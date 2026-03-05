import { Vector2D } from "../../../../../../../AirMess/frontend/src/engine/Vector2D";
import type EntityResource from "./EntityResource";

export class ERCamera implements EntityResource{
    position = new Vector2D(50,50);
    scale = 1;
    constructor(private ctx: CanvasRenderingContext2D){}

    canvasToWorld(x: number, y: number): [number, number] {
        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;

        // Move into centered coordinates
        let sx = x - originX;
        let sy = y - originY;

        // Undo Y flip
        sy = -sy;

        // Undo scale
        sx /= this.scale;
        sy /= this.scale;

        // Undo camera translation
        sx += this.position.x;
        sy += this.position.y;

        return [sx, sy];
    }

}