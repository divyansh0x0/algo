import { Drawable } from "@/engine/components/drawable";
import { Scene } from "@/engine/scene";
import { ColorStates, ThemeManager } from "@/engine/theme";
import { Vector } from "@/utils/geometry";
import { QuadTreeNode } from "@/utils/quadtree";
import { Vmath } from "@/utils/vmath";


export class Node extends Drawable {
    static readonly alphaDecay = 0.0016;

    mass: number;
    quad_tree_node: QuadTreeNode;

    attr_force: Vector = new Vector(0);
    repln_force: Vector = new Vector(0);
    alpha = 1;
    public readonly position_change = new Vector(0, 0);




    private text: string;
    readonly velocity: Vector = new Vector(0);
    readonly radius: number;
    public readonly force: Vector = new Vector(0);
    private readonly max_velocity: number = 100;
    private readonly velocity_decay: number = 0.5;
    private readonly min_velocity = 1;

    constructor(scene: Scene, id: string, pos: Vector, radius: number, text: string = "") {
        super(scene, id, "node");
        this.pos.set(pos.x, pos.y);
        this.text = text;
        this.radius = radius;
        this.mass = 1;
        this.quad_tree_node = new QuadTreeNode(id, this.pos, 100);
    }


    update(dt_ms: number) {
        dt_ms = 20;
        super.update(dt_ms);
        const dt_s = dt_ms / 1000; //fixed dtms
        this.force.x = this.attr_force.x + this.repln_force.x;
        this.force.y = this.attr_force.y + this.repln_force.y;

        this.force.scale_self(this.alpha);


        let dvx = (Vmath.clamp(this.force.x * dt_s, -this.max_velocity, this.max_velocity));
        let dvy = (Vmath.clamp(this.force.y * dt_s, -this.max_velocity, this.max_velocity));


        // //console.log(dvx, dvy);

        this.velocity.x += dvx;
        this.velocity.y += dvy;


        this.velocity.scale_self(1 - this.velocity_decay);

        if (Math.abs(this.velocity.x) < this.min_velocity)
            this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < this.min_velocity)
            this.velocity.y = 0;

        const dx = this.velocity.x * dt_s;
        const dy = this.velocity.y * dt_s;
        this.pos.x += dx;
        this.pos.y += dy;

        this.position_change.set(dx, dy);

        this.alpha -= this.alpha * Node.alphaDecay;
        if (this.alpha < 1e-3)
            this.alpha = 0;
        this.repln_force.set(0, 0);
        this.attr_force.set(0, 0);
    }

    render() {
        this.drawCircle(this.radius, this.pos.x, this.pos.y, this.color.hex, true, ThemeManager.getBgColor(this.getName(), ColorStates.BORDER).hex, 1);
        this.drawText(this.id, this.pos.x, this.pos.y, ThemeManager.getTextColor(ColorStates.ON_PRIMARY).hex);
        // this.drawText(this.text, this.x, this.y + this.radius + 10, ThemeManager.getTextColor("on-background"));

        // this.drawCircle(ForceQuadTree.FULL_ACCURACY_CIRCLE_RADIUS, this.position.x, this.position.y, null, true,
        // "#0f0", 1);

        // this.drawText(`loc: ${this.position}`, this.position.x, this.position.y - this.radius * 2,
        // ThemeManager.getTextColor()); z this.drawText(`a: ${this.attr_force.x}i + ${this.attr_force.y}j`, this.x,
        // this.y + this.radius * 2,  ThemeManager.getTextColor()) this.drawText(`v: ${this.velocity.x}i +
        // ${this.velocity.y}j`, this.x, this.y - this.radius * 3,  ThemeManager.getTextColor())

        // this.drawPointVec(this.repln_force, "green")
        // this.drawPointVec(this.attr_force, "red")

    }

    getDistanceFromPoint(point: Vector) {
        // Calculate the distance from the center of the circle to the point
        const dist_sqrd = this.pos.subtract(point).length_sqrd();
        return Math.sqrt(dist_sqrd);
    }


    containsPoint(x: number, y: number) {
        const p1 = this.pos;
        const p2 = new Vector(x, y);
        // Check if the point is inside the circle using the distance formula
        const dist_sqrd = p2.sub_self(p1).length_sqrd();
        return this.radius ** 2 > dist_sqrd;
    }

}
