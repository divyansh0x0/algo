import {Size} from "./Size";
import {Vector2D} from "./Vector2D";

export class AABB {
    public center: Vector2D;
    public half_dimension: Size;

    constructor(center: Vector2D, half_dimension: Size) {
        this.center = center;
        this.half_dimension = half_dimension;
    }

    static fromRect(x: number, y: number, w: number, h: number) {
        return new AABB(new Vector2D(x + w / 2, y + h / 2), new Size(w / 2, h / 2));
    }

    update(center: Vector2D, half_dimension: Size): void {
        this.center = center;
        this.half_dimension = half_dimension;
    }

    updateRect(x: number, y: number, w: number, h: number) {
        this.center.set(x + w / 2, y + h / 2);
        this.half_dimension.set(w / 2, h / 2);
    }

    /**
     * Checks if point is inside this rectangle
     * @param {Vector} vec
     */
    containsPoint(vec: Vector2D): boolean {
        return Math.abs(vec.x - this.center.x) <= this.half_dimension.width
            && Math.abs(vec.y - this.center.y) <= this.half_dimension.height;

    }

    intersectsAABB(other: AABB): boolean {
        return this.center.x - other.center.x <= this.half_dimension.width + other.half_dimension.width
            && this.center.y - other.center.y <= this.half_dimension.height + other.half_dimension.height;
    }

    toString() {
        return `${this.center} ${this.half_dimension}`;
    }

    copy(): AABB {
        return new AABB(this.center.copy(), this.half_dimension.copy());
    }
}
