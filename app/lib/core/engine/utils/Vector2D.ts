export class Vector2D {
    public static unit_x = Object.freeze(new Vector2D(1, 0));
    public static unit_y = Object.freeze(new Vector2D(0, 1));
    public static ZERO = Object.freeze(new Vector2D(0, 0));
    x: number;
    y: number;


    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }


    copy(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    length_sqrd(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.length_sqrd());
    }

    /**
     * Sets the value of this vector
     */
    set(x: number, y: number): Vector2D {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Returns a new vector after performing addition operation
     */
    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     */
    addXY(x: number, y: number): Vector2D {
        return new Vector2D(this.x + x, this.y + y);
    }

    /**
     * Returns this vector after performing addition operation
     */
    add_self(other: Vector2D): this {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    add_selfXY(x: number, y: number): this {
        this.x += x;
        this.y += y;
        return this;
    }

    /**
     * Returns a new vector after performing subtraction operation
     */
    subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     */
    subXY(x: number, y: number): Vector2D {
        return new Vector2D(this.x - x, this.y - y);
    }

    /**
     * Returns this vector after performing subtraction operation
     */
    sub_self(other: Vector2D): this {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Returns a new vector after performing scaling operation
     * @param {number} scale scales both x and y if scale_y is undefined
     * @param {number} [scale_y]
     * @returns {Vector2D}
     */
    scale(scale: number, scale_y?: number) {
        if (!scale_y)
            scale_y = scale;
        return new Vector2D(this.x * scale, this.y * scale_y);
    }

    /**
     * Scale this vector and returns this vector
     * @param {number} scale scales both x and y if scale_y is undefined
     * @param {number} [scale_y]
     * @returns {Vector2D}
     */
    scale_self(scale: number, scale_y?: number): this {
        if (!scale_y)
            scale_y = scale;
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    /**
     * Takes dot product of this vector with provided vector

     */
    dot(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }

    toString() {
        return this.x + "i + " + this.y + "j";
    }
}