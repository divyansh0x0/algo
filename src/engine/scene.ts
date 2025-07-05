import { Animator } from "@/engine/animation";
import { Drawable } from "@/engine/components/drawable";
import { Edge } from "@/engine/components/edge";
import { Logger } from "@/engine/components/logger";
import { Node } from "@/engine/components/node";
import { ThemeManager } from "@/engine/theme";
import { Size, Vector } from "@/utils/geometry";
import { Mouse, MouseButton } from "@/utils/mouse";
import { AABB, ForceQuadTree, QuadTreeNode } from "@/utils/quadtree";
import { Vmath } from "@/utils/vmath";

const ZERO_VEC = Object.freeze({ x: 0, y: 0 });
const PAUSE_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M14 19V5h4v14zm-8 0V5h4v14z\"/></svg>";
const PLAY_ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712\"/></svg>";
export const SceneLogger = new Logger("scene-logger");
export class Scene {
    static animator = new Animator();
    static LOCATION_ERROR = 5;//5px


    private readonly is_everything_bounded = true;
    private nodes: Map<string, Node> = new Map;
    private edges: Map<string, Edge> = new Map;
    private accumulated_frame_time = 0;
    private fps = 0;
    private last_animation_call_time = 0;
    private drawable_selected: null | Drawable = null;
    private grid_size: Size = new Size(100, 100);
    private prev_mouse_pos: Vector = new Vector();

    private is_running: boolean;
    private debug_box_el: HTMLInputElement | null;
    private force_quad_tree: undefined | ForceQuadTree;
    private fps_counter: number = 0;
    private bounds: DOMRect | undefined;
    private readonly mouse_info: Mouse;
    private accumulated_alpha: number = 1;
    private offset: Vector = new Vector(0);
    private readonly start_btn: HTMLButtonElement;

    constructor(public ctx: CanvasRenderingContext2D, private readonly show_fps: boolean = false) {
        this.show_fps = show_fps;
        this.is_running = false;
        this.debug_box_el = document.getElementById("debug-box") as HTMLInputElement;


        this.mouse_info = new Mouse(this.ctx.canvas);


        const resize_observer = new ResizeObserver(() => {
            for (const [ id, node ] of this.nodes) {
                node.alpha = 0.5;
            }
        });


        this.start_btn = document.getElementById("start-btn") as HTMLButtonElement;
        if (this.start_btn) {
            this.start_btn.addEventListener("click", () => {
                if (this.is_running)
                    this.stop();
                else
                    this.start();


            });
        }
        resize_observer.observe(this.ctx.canvas);

    }


    async loop(curr_animation_call_time: number) {

        const t1 = this.last_animation_call_time;
        const dt_ms = curr_animation_call_time - this.last_animation_call_time;
        this.last_animation_call_time = curr_animation_call_time;


        this.update(dt_ms);
        this.render();

        const frame_time = curr_animation_call_time - t1;


        this.accumulated_frame_time += frame_time;
        if (this.show_fps) {
            if (this.accumulated_frame_time >= 1000) {
                // console.log("counter reset", this.accumulated_frame_time)
                this.accumulated_frame_time = 0;
                this.fps = this.fps_counter;
                this.fps_counter = 0;
            } else
                this.fps_counter += 1;
        }
        requestAnimationFrame((time) => {
            this.loop(time);
        });
    }

    start() {
        if (this.is_running)
            return;
        this.is_running = true;
        this.last_animation_call_time = performance.now();
        this.accumulated_frame_time = 0;

        this.prev_mouse_pos = this.mouse_info.location;
        this.loop(this.last_animation_call_time);
        this.start_btn.innerHTML = PAUSE_ICON_SVG;

    }

    stop() {
        this.is_running = false;
        this.start_btn.innerHTML = PLAY_ICON_SVG;
    }


    render() {
        //Background of canvas
        const rect = this.ctx.canvas.getBoundingClientRect();
        this.ctx.fillStyle = ThemeManager.getBgColor("canvas").hex;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        //Gridlines
        this.ctx.strokeStyle = ThemeManager.getColor("grid").hex;
        for (let x = 0; x < rect.width; x += this.grid_size.width) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
        }
        for (let y = 0; y < rect.height; y += this.grid_size.height) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
        }
        this.ctx.stroke();

        this.ctx.save();
        //Drawing drawables
        const edges = this.edges;
        const nodes = this.nodes;
        for (const [ id, edge ] of edges) {
            edge.render();

        }


        for (const [ id, node ] of nodes) {
            if (!node)
                continue;
            node.render();

        }


        //Quad tree debug
        if (this.force_quad_tree && this.debug_box_el?.checked) {
            this.ctx.beginPath();
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = ThemeManager.getColor("debug").hex;

            let b = null;
            let cy = 0;
            for (const region of this.force_quad_tree.getAllRegions()) {
                b = region.boundary;

                this.ctx.strokeRect(b.center.x - b.half_dimension.width, b.center.y - b.half_dimension.height, b.half_dimension.width * 2, b.half_dimension.height * 2);
                if (region.COM)
                    this.ctx.fillText(`${ region.mass }`, region.COM.x, region.COM.y);
            }
            // if(!this.mark)
            //     this.mark = true;

            this.ctx.closePath();


        }
        this.ctx.restore();
    }


    update(dt_ms: number) {
        if (!this.is_running)
            return;
        SceneLogger.getReactiveLog("FPS").set(this.fps.toString());
        SceneLogger.getReactiveLog("Accuracy").set(Vmath.round(ForceQuadTree.ACCURACY, 2).toString());
        SceneLogger.getReactiveLog("OFFSET").set(`x: ${ Vmath.round(this.offset.x, 2) }, y: ${ Vmath.round(this.offset.y, 2) }`);
        SceneLogger.getReactiveLog("Nodes").set(this.nodes.size.toString());
        SceneLogger.getReactiveLog("Edges").set(this.edges.size.toString());

        this.bounds = this.ctx.canvas.getBoundingClientRect();
        SceneLogger.getReactiveLog("Bounds").set(`${ Vmath.round(this.bounds.width, 2) }x${ Vmath.round(this.bounds.height, 2) }`);

        if (this.accumulated_alpha !== 0) {
            this.force_quad_tree = new ForceQuadTree(AABB.fromRect(0, 0, this.bounds.width, this.bounds.height));

            //Building QUADTREE
            for (const [ id, node ] of this.nodes) {
                this.force_quad_tree.insert(node.quad_tree_node);
            }
        }


        for (const [ id, edge ] of this.edges) {
            edge.update(dt_ms);
            const node1 = edge.start_node;
            const node2 = edge.end_node;

            const attr_force = computeAttraction(node1.pos, node2.pos);

            node1.attr_force.x += attr_force.x;
            node1.attr_force.y += attr_force.y;

            node2.attr_force.x -= attr_force.x;
            node2.attr_force.y -= attr_force.y;
        }
        this.accumulated_alpha = 0;
        // Update nodes
        for (const [ id, node ] of this.nodes) {
            if (!this.drawable_selected && node.containsPoint(this.mouse_info.location.subtract(this.offset))
                && (this.mouse_info.isButtonDown(MouseButton.Primary) || this.mouse_info.isTouching)) {
                this.drawable_selected = node;
            }
            if (this.force_quad_tree) {
                node.repln_force = this.force_quad_tree.getTotalForcesOnPoint(node.quad_tree_node, computeRepulsion);
            }
            node.update(dt_ms);

            if (this.is_everything_bounded) {
                node.pos.x = Vmath.clamp(node.pos.x, node.radius, this.bounds.width - node.radius);
                node.pos.y = Vmath.clamp(node.pos.y, node.radius, this.bounds.height - node.radius);
            }

            if (this.accumulated_frame_time === 0) {
                const node_el = document.getElementById(id);
                if (node_el)
                    node_el.innerHTML =
                        `<div>id: ${ node.id }</div>` +
                        `<div>alpha: ${ node.alpha }</div>` +
                        `<div> pos: ${ Math.round(node.pos.x) }i + ${ Math.round(node.pos.y) }j </div>` +
                        `<div>vel: ${ Math.round(node.velocity.x * 1000) / 1000 }i + ${ Math.round(node.velocity.y * 1000) / 1000 }</div>` +
                        `<div>force: ${ Math.round(node.force.x * 1000) / 1000 }i + ${ Math.round(node.force.y * 1000) / 1000 }</div>`;
            }
            this.accumulated_alpha += node.alpha;

        }

        if (this.drawable_selected) {
            this.ctx.canvas.style.cursor = "pointer";
            this.drawable_selected.pos.x = this.mouse_info.location.x;
            this.drawable_selected.pos.y = this.mouse_info.location.y;
            for (const [ id, node ] of this.nodes) {
                node.alpha = 0.5;
            }
            if (!(this.mouse_info.isButtonDown(MouseButton.Primary) || this.mouse_info.isTouching)) {
                this.ctx.canvas.style.cursor = "default";
                this.drawable_selected = null;
            }
        }
        // } else {
        //     if (this.mouse_info.location.x < this.bounds.width && this.mouse_info.location.y < this.bounds.height
        //         && this.mouse_info.location.x > 0 && this.mouse_info.location.y > 0
        //         && (this.mouse_info.isButtonDown(MouseButton.Primary) || this.mouse_info.isTouching)) {
        //         this.ctx.canvas.style.cursor = "move";
        //         this.offset.add_self(this.mouse_info.location.subtract(this.prev_mouse_pos));
        //     } else {
        //         this.ctx.canvas.style.cursor = "default";
        //     }
        // }
        //

        this.prev_mouse_pos = this.mouse_info.location;
        Scene.animator.step(dt_ms);
    }

    /*******************************************************************************************************************
     ***************************************** SCENE COMMANDS ********************************************************
     *******************************************************************************************************************/
    addNode(id: string, pos: Vector, radius: number): boolean {
        if (this.nodes.has(id))
            return false;
        this.nodes.set(id, new Node(this.ctx, id, pos, radius));
        return true;
    }

    removeNode(id: string): boolean {
        return this.nodes.delete(id);
    }

    highlightNode(id: string): boolean {
        const node = this.nodes.get(id);
        if (!node)
            return false;
        node.highlight();
        return true;
    }

    unhighlightNode(id: string): boolean {
        return false;

    }

    moveNode(id: string, from_pos: Vector, to_pos: Vector): boolean {
        return false;
    }

    labelNode(id: string, label: string): boolean {
        return false;

    }

    addEdge(from_id: string, to_id: string): boolean {
        const node1 = this.nodes.get(from_id);
        const node2 = this.nodes.get(to_id);
        if (!node1 || !node2)
            return false;
        this.edges.set(Edge.getEdgeKey(from_id, to_id), new Edge(this.ctx, node1, node2));
        return true;

    }

    removeEdge(from_id: string, to_id: string): boolean {
        return this.edges.delete(Edge.getEdgeKey(from_id, to_id));
    }

    highlightEdge(from_id: string, to_id: string): boolean {
        const edge = this.edges.get(Edge.getEdgeKey(from_id, to_id));
        if (!edge)
            return false;
        console.log("EDGE KEY", Edge.getEdgeKey(from_id, to_id));
        edge.highlight();
        return true;

    }

    unhighlightEdge(from_id: string, to_id: string): boolean {
        return false;

    }

    labelEdge(from_id: string, to_id: string, label: string): boolean {
        return false;

    }

    noop(): boolean {
        return true;
    }

    finished(): boolean {
        return false;

    }

    error(message: string): boolean {
        return false;

    }

    reset(): boolean {
        return false;

    }

    clear(): boolean {
        this.nodes.clear();
        this.edges.clear();
        return true;
    }
}

const softening_factor = 10 ** 2;


export const k_repl = 1e3;
export const k_attr = 1000;
const NATURAL_EDGE_LENGTH = 50;

export function computeRepulsion(node1: QuadTreeNode, node2: QuadTreeNode): Vector {
    const distance_vec = node1.point.subtract(node2.point);
    const dist_sq = distance_vec.length_sqrd();

    const angle = Math.atan2(distance_vec.y, distance_vec.x);

    const force = k_repl / (dist_sq + softening_factor) * node2.mass * node1.mass;
    return new Vector(
        Math.round(force * Math.cos(angle)), //horizontal component of force
        Math.round(force * Math.sin(angle)) //vertical component of force
    );
}


export function computeAttraction(vec1: Vector, vec2: Vector) {
    const distance_vec = vec1.subtract(vec2);
    const dist_sq = distance_vec.length_sqrd();

    if (dist_sq < 0.01) {
        return ZERO_VEC;
    }
    const dist = Math.sqrt(dist_sq);

    const force = k_attr * (dist - NATURAL_EDGE_LENGTH);

    return {
        x: -Math.round(distance_vec.x / dist * force), //horizontal component of force
        y: -Math.round(distance_vec.y / dist * force) //vertical component of force
    };
}

