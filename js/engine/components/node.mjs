import {Drawable} from "./drawable.mjs";
import {clamp} from "../../utils/PMath.mjs";
import {ThemeManager} from "../theme.mjs";
import {Vector} from "../../utils/Geometry.mjs";

export class Node extends Drawable {
    static max_force = 10000;
    constructor(ctx, id, x, y, radius, text = "") {
        super(ctx, id);
        this.position.set(x, y);
        this.text = text;
        this.velocity = new Vector(0, 0);
        this.radius = radius;
        this.force = new Vector(0, 0);
        this.max_velocity = 100;
        this.damping = 0.30;
        this.attr_force = new Vector(0, 0);
        this.repln_force = new Vector(0, 0);
        this.mass = 1;
    }

    update(dt_ms) {
        super.update(dt_ms);
        const dt_s = 0.02; //fixed dtms
        this.force.x = clamp(this.attr_force.x + this.repln_force.x, -Node.max_force, Node.max_force);
        this.force.y = clamp(this.attr_force.y + this.repln_force.y, -Node.max_force, Node.max_force);
        // if(isNaN(this.force.x)){
        //     this.force.x = Node.max_force;
        // }
        // if(isNaN(this.force.y)){
        //     this.force.y = Node.max_force;
        // }
        // console.log(this.id,this.force)
        const dvx = (clamp(this.force.x * dt_s, -this.max_velocity, this.max_velocity));
        const dvy = (clamp(this.force.y * dt_s, -this.max_velocity, this.max_velocity));

        this.velocity.x += dvx;
        this.velocity.y += dvy;


        this.velocity.x = (this.velocity.x);
        this.velocity.y = (this.velocity.y);
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        const dx = this.velocity.x * dt_s;
        const dy = this.velocity.y * dt_s;
        this.position.x += dx;
        this.position.y += dy;
    }

    render() {
        this.drawCircle(this.radius, this.position.x, this.position.y, this.color, true, ThemeManager.getBgColor(this.getName(), "border"), 1);
        this.drawText(this.id, this.position.x, this.position.y, ThemeManager.getTextColor("on-primary"));
        // this.drawText(this.text, this.x, this.y + this.radius + 10, ThemeManager.getTextColor("on-background"));


        // this.drawText(`loc: ${this.position}`, this.position.x, this.position.y - this.radius * 2, ThemeManager.getTextColor());
        // this.drawText(`a: ${this.attr_force.x}i + ${this.attr_force.y}j`, this.x, this.y + this.radius * 2,  ThemeManager.getTextColor())
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
        const dist_sqrd = (this.position.x - point.x) ** 2 + (this.position.y - point.y) ** 2;
        return this.radius ** 2 > dist_sqrd;
    }

}