import {Drawable} from "./drawable.mjs";
import {clamp} from "../../utils/PMath.mjs";
import {ThemeManager} from "../theme.mjs";

export class Node extends Drawable {
    constructor(ctx, id, x, y, radius, text = "") {
        super(ctx, id);
        this.text = text;
        this.x = x;
        this.y = y;
        this.velocity = {x: 0, y: 0};
        this.radius = radius;
        this.force = {x: 0, y: 0};
        this.max_velocity = 100;
        this.damping = 0.85;
        this.attr_force = {x: 0, y: 0};
        this.repln_force = {x: 0, y: 0};
    }

    update() {
        const dt_ms = 20; //fixed dtms
        this.force.x = this.attr_force.x + this.repln_force.x;
        this.force.y = this.attr_force.y + this.repln_force.y;
        // console.log(this.id,this.force)
        const dvx = (clamp(this.force.x * dt_ms / 1000, -this.max_velocity, this.max_velocity));
        const dvy = (clamp(this.force.y * dt_ms / 1000, -this.max_velocity, this.max_velocity));

        this.velocity.x += dvx;
        this.velocity.y += dvy;


        this.velocity.x = (this.velocity.x);
        this.velocity.y = (this.velocity.y);
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        const dx = this.velocity.x * dt_ms / 1000;
        const dy = this.velocity.y * dt_ms / 1000;
        this.x += dx;
        this.y += dy;
    }

    render() {
        this.drawCircle(this.radius, this.x, this.y, this.color, true, ThemeManager.getBgColor(this.getName(), "border"), 1);
        this.drawText(this.id, this.x, this.y, ThemeManager.getTextColor("on-primary"));
        // this.drawText(this.text, this.x, this.y + this.radius + 10, ThemeManager.getTextColor("on-background"));


        // this.drawText(`a: ${this.attr_force.x}i + ${this.attr_force.y}j`, this.x, this.y + this.radius * 2,  ThemeManager.getTextColor())
        // this.drawText(`loc: ${this.x}i + ${this.y}j`, this.x, this.y - this.radius * 2, ThemeManager.getTextColor());
        // this.drawText(`v: ${this.velocity.x}i + ${this.velocity.y}j`, this.x, this.y - this.radius * 3,  ThemeManager.getTextColor())

        // this.drawPointVec(this.repln_force, "green")
        // this.drawPointVec(this.attr_force, "red")

    }

    getDistanceFromPoint(point) {
        // Calculate the distance from the center of the circle to the point
        const dist_sqrd = (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
        return Math.sqrt(dist_sqrd);
    }

    //gives a vector from the center of the node to the point
    getPositionDifference(point) {
        return {
            x: point.x - this.x,
            y: point.y - this.y
        };
    }

    containsPoint(point) {
        // Check if the point is inside the circle using the distance formula
        const dist_sqrd = (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
        return this.radius ** 2 > dist_sqrd;
    }

}