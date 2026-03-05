import { Vector2D } from "../../utils";
import type { EntityResource } from "./EntityResource";

export class ERCamera implements EntityResource{
    position = new Vector2D(0,0);
    private _scale = 1;
    constructor(private ctx: CanvasRenderingContext2D){}

    get scale(): number {
        return this._scale;
    }

    setScale(newScale: number, pivot: Vector2D) {
        const initialPivot = this.getWorldCoordinate(pivot);
        this._scale = newScale;
        const finalPivot = this.getWorldCoordinate(pivot);
        this.position.x -= finalPivot.x - initialPivot.x;
        this.position.y -= finalPivot.y - initialPivot.y;
    }
    getWorldCoordinate(point:Vector2D):Vector2D{
        const viewportCenterX = this.ctx.canvas.width / 2;
        const viewportCenterY = this.ctx.canvas.height / 2;

        return new Vector2D(this.position.x + (point.x - viewportCenterX)/this.scale, this.position.y - (point.y - viewportCenterY)/this.scale);
    }

}