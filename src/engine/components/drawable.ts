import { ColorAnimation } from "@/engine/animation";
import { Color } from "@/engine/color";
import { Scene } from "@/engine/scene";
import { ColorStates, ThemeManager } from "@/engine/theme";
import { Vector } from "@/utils/geometry";


export abstract class Drawable {
    private ctx: CanvasRenderingContext2D;
    private color_state: ColorStates;


    pos = new Vector(0, 0);
    is_color_animating = false;
    color: Color = new Color("#f00");

    readonly id: string;


    protected constructor(ctx: CanvasRenderingContext2D, id: string, private class_name: string) {
        this.ctx = ctx;
        this.id = id;
        this.color_state = ColorStates.DEFAULT;
    }

    public highlight() {
        Scene.animator.add(new ColorAnimation(this, this.color, ThemeManager.getBgColor(this.getName(), ColorStates.HIGHLIGHTED)));
        this.color_state = ColorStates.HIGHLIGHTED;
    }

    public getName() {
        return this.class_name.toLowerCase();
    }

    public update(dt_ms: number) {
        if (!this.is_color_animating) {
            this.color = ThemeManager.getBgColor(this.getName(), this.color_state);
        }
    }

    public abstract render(): void;

    drawPointVec(vec_obj: Vector, color = "green") {
        const length_attr = Math.sqrt(vec_obj.x ** 2 + vec_obj.y ** 2);
        if (length_attr > 1)
            this.drawArrow(100 * vec_obj.x / length_attr, 100 * vec_obj.y / length_attr, color);


    }

    drawArrow(length_x: number, length_y: number, color = "green") {
        if (length_x === 0 && length_y === 0)
            return;
        this.ctx.save();
        // this.drawLine(this.x, this.y, this.x + length_x, this.y + length_y, 10, color)
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(this.pos.x, this.pos.y);
        const end_point = this.pos.add(new Vector(length_x, length_y));
        this.ctx.lineTo(end_point.x, end_point.y);
        this.ctx.closePath();
        this.ctx.stroke();
        //
        // // Arrow head
        //
        // this.ctx.lineWidth = 1;
        // this.ctx.rotate(Math.atan2(length_y,length_x));
        // // this.ctx.translate(x,y);
        // this.ctx.beginPath();
        //
        // this.ctx.moveTo(0,0);
        // this.ctx.lineTo(0,10);
        // this.ctx.lineTo(10,0);
        // this.ctx.lineTo(0,-10);
        // this.ctx.closePath();
        // this.ctx.fill();
        this.ctx.restore();
    }

    drawCircle(radius: number, x: number, y: number, color: string, b_add_border: boolean = false, border_color: string, border_width = 1) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        if (b_add_border) {
            let prev_stroke_style_color = this.ctx.strokeStyle;
            this.ctx.lineWidth = border_width;
            this.ctx.strokeStyle = border_color;
            this.ctx.strokeStyle = prev_stroke_style_color;
            this.ctx.stroke();
        }
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    reset() {
        console.error("Reset not implemented for", this.constructor.name);
    }

    public drawLine(from_x: number, from_y: number, to_x: number, to_y: number, thickness: number, color: string): void {
        this.ctx.save();

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = "round";

        this.ctx.beginPath();
        this.ctx.moveTo(from_x, from_y);
        this.ctx.lineTo(to_x, to_y);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawText(text: string, x: number, y: number, color: string, font_size_em = 1) {
        this.ctx.save();

        this.ctx.textAlign = "center";    // Horizontal center
        this.ctx.textBaseline = "middle"; // Vertical center
        this.ctx.font = `${ font_size_em }em Arial`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    drawRect(x: number, y: number, width: number, height: number, bg_color = "#000", border_color: string, border_width = 0, border_radius: number) {
        this.ctx.save();
        this.ctx.fillStyle = bg_color;
        if (border_width > 0) {
            this.ctx.strokeStyle = border_color;

        }
        this.ctx.beginPath();
        this.ctx.roundRect(300, 5, 200, 100, border_radius);
        this.ctx.closePath();
        this.ctx.restore();
    }
}
