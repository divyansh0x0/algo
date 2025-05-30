import {ThemeManager} from "../theme.mjs";
import {ColorAnimation} from "../animation.mjs";
import {Scene} from "../scene.mjs";
import {Vector} from "../../utils/Geometry.mjs";

const COLOR_STATES = Object.freeze({
    DEFAULT:"default",
    HIGHLIGHTED:"highlighted",
    SELECTED:"selected",
    HOVER: "hover"
})
export class Drawable {
    constructor(ctx, id) {
        this.ctx = ctx;
        this.id = id;
        this.x = 0;
        this.position = new Vector(0, 0);
        this.is_color_animating = false;
        this.color_state = COLOR_STATES.DEFAULT;
        this.color = ThemeManager.getBgColor(this.getName(), this.color_state);
    }
    highlight(){
        Scene.animator.add(new ColorAnimation(this, this.color, ThemeManager.getBgColor(this.getName(), "highlighted")));
        this.color_state = COLOR_STATES.HIGHLIGHTED;
    }

    getName() {
        return this.constructor.name.toLowerCase();
    }

    update(dt_ms) {
        if(!this.is_color_animating){
            this.color = ThemeManager.getBgColor(this.getName(), this.color_state);
        }

    }

    render() {

    }

    drawPointVec(vec_obj, color = "green") {
        const length_attr = Math.sqrt(vec_obj.x ** 2 + vec_obj.y ** 2);
        if (length_attr > 1)
            this.drawArrow(100 * vec_obj.x / length_attr, 100 * vec_obj.y / length_attr, color);


    }

    drawArrow(length_x, length_y, color = "green") {
        if (length_x === 0 && length_y === 0)
            return;
        this.ctx.save();
        // this.drawLine(this.x, this.y, this.x + length_x, this.y + length_y, 10, color)
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(this.x, this.y);
        let x = this.x + length_x;
        let y = this.y + length_y;
        this.ctx.lineTo(x, y);
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

    drawCircle(radius, x, y, color, b_add_border = false, border_color, border_width = 1) {
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

    drawLine(from_x, from_y, to_x, to_y, thickness, color) {
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

    drawText(text, x, y, color, font_size_em = 1) {
        this.ctx.save();

        this.ctx.textAlign = "center";    // Horizontal center
        this.ctx.textBaseline = "middle"; // Vertical center
        this.ctx.font = `${font_size_em}em Arial`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    drawRect(x, y, width, height, bg_color = "#000", border_color, border_width = 0, border_radius) {
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

    toPixelPosition(x, y) {
        return {
            x: x * this.ctx.canvas.width,
            y: y * this.ctx.canvas.height
        };
    }

    toFractionPosition(x, y) {
        return {
            x: x / this.ctx.canvas.width,
            y: y / this.ctx.canvas.height
        };
    }
}