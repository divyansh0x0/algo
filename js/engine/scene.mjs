import MouseInfo, {setupMouseInfoFor} from "../utils/MouseInfo.mjs";
import {COMMAND_TYPES} from "./commands.mjs";
import {Animator} from "./animation.mjs";
import {ThemeManager} from "./theme.mjs";
import {Node} from "./components/node.mjs";
import {Edge} from "./components/edge.mjs";
import {Logger} from "./components/logger.mjs";
import {clamp} from "../utils/PMath.mjs";
import {AABB, ForceQuadTree} from "../utils/QuadTree.mjs";

const ZERO_VEC = Object.freeze({x: 0, y: 0});
const NATURAL_EDGE_LENGTH = 20;
const NODE_CHARGE = 1;
export const k_repl = 10e6;
export const k_attr = 150;

export class Scene {
    static animator = new Animator();

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} show_fps
     * @param {boolean} debug
     */
    constructor(ctx, show_fps = false, debug = true) {
        this.ctx = ctx;
        /** @type {string:Node | {}} */
        this.nodes = {};
        /** @type {string:Edge | {}}*/
        this.edges = {};
        this.accumulated_time = 0;
        this.show_fps = show_fps;
        this.last_animation_call_time = 0;
        this.is_running = false;
        this.fps = 0;
        this.k_repl = 10E6;
        this.drawable_selected = null;
        this.logger = new Logger();
        this.grid_size = {x: 100, y: 100};
        setupMouseInfoFor(this.ctx.canvas);
        this.debug_box = document.getElementById("debug-box");
        this.force_quad_tree = null;
        this.is_everything_bounded = true;
        this.last_total_energy = null;
    }

    handleCommand(command) {
        // console.log("Command: ", command)
        switch (command.type) {
            //Addition
            case COMMAND_TYPES.ADD_NODE:
                const node = new Node(this.ctx, command.id, command.pos.x, command.pos.y, command.radius);
                this.nodes[node.id] = node;
                break;
            case COMMAND_TYPES.ADD_EDGE:
                const from = this.nodes[command.from];
                const end = this.nodes[command.end];
                const edge = new Edge(this.ctx, from, end);
                this.edges[edge.id] = edge;
                break;

            //Highlight
            case COMMAND_TYPES.HIGHLIGHT_NODE:
                const node_to_highlight = this.nodes[command.id];
                if (node_to_highlight)
                    this.highlight(node_to_highlight);
                else
                    console.error("[HIGHLIGHT] Node not found: ", command.id);
                break;
            case COMMAND_TYPES.HIGHLIGHT_EDGE:
                const id = Edge.getEdgeKey(command.from, command.end);
                const edge_to_highlight = this.edges[id];
                if (edge_to_highlight)
                    this.highlight(edge_to_highlight);
                else
                    console.error("[HIGHLIGHT] Edge not found: ", id);
                break;
            //Modification
            case COMMAND_TYPES.LABEL_NODE:
                const node_to_label = this.nodes[command.id];
                if (node_to_label) {
                    node_to_label.text = command.label;
                } else {
                    console.error("Node not found: ", command.id);
                }
                break;
            case COMMAND_TYPES.NOOP:
                // Do nothing
                break;
            case COMMAND_TYPES.FINISHED:
                this.logger.log("Finished", Logger.SUCCESS);
                break;
            case COMMAND_TYPES.RESET:
                for (const id in this.edges) {
                    const drawable = this.edges[id];
                    drawable.reset();
                }
                for (const id in this.nodes) {
                    const drawable = this.nodes[id];
                    drawable.reset();
                }
                break;
            case COMMAND_TYPES.CLEAR:
                delete this.edges;
                delete this.nodes;
                this.edges = {};
                this.nodes = {};
                break;
            default:
                console.error("Unknown command: ", command);
                break;
        }
    }

    highlight(drawable) {
        drawable.highlight();
    }

    loop(curr_animation_call_time) {
        if (!this.is_running) return;
        const t1 = this.last_animation_call_time;
        const dt_ms = curr_animation_call_time - this.last_animation_call_time;
        this.last_animation_call_time = curr_animation_call_time;


        this.update(dt_ms);
        this.render();

        const frame_time = curr_animation_call_time - t1;


        this.accumulated_time += frame_time;
        if (this.show_fps) {
            if (this.accumulated_time >= 1000) {
                this.accumulated_time = 0;
                this.fps = this.fps_counter;
                this.fps_counter = 0;
            }
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
        this.accumulated_time = 0;
        this.loop(this.last_animation_call_time);
    }

    stop() {
        this.is_running = false;
    }


    render() {
        this.ctx.save();
        //Background of canvas
        const rect = this.ctx.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.ctx.fillStyle = ThemeManager.getBgColor("canvas");
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        //Gridlines
        this.ctx.save();
        this.ctx.strokeStyle = ThemeManager.getColor("grid");
        for (let x = 0; x < rect.width; x += this.grid_size.x) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
        }
        for (let y = 0; y < rect.height; y += this.grid_size.y) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
        }
        this.ctx.stroke();
        this.ctx.restore();

        //Drawing drawables
        const edges = this.edges;
        const nodes = this.nodes;
        for (const id in edges) {
            const edge = edges[id];
            edge.render();

        }

        this.ctx.fillStyle = ThemeManager.getTextColor("on-background");
        this.ctx.font = "1em Arial";
        this.ctx.strokeStyle = "#0f0";
        this.ctx.setLineDash([2, 3]);
        for (const id in nodes) {
            const node = nodes[id];
            node.render();

            if (this.debug_box.checked) {
                this.ctx.beginPath();
                this.ctx.arc(node.position.x, node.position.y, ForceQuadTree.FULL_ACCURACY_CIRCLE_RADIUS, 0, 2 * Math.PI);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            node.attr_force.x = 0;
            node.attr_force.y = 0;

            node.repln_force.x = 0;
            node.repln_force.y = 0;
        }
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = ThemeManager.getColor("debug");

        //drawing fps
        if (this.show_fps) {
            this.ctx.fillStyle = ThemeManager.getTextColor("on-background");
            this.ctx.textAlign = "left";    // Horizontal center
            this.ctx.font = "1em Arial";
            this.ctx.textBaseline = "top"; // Vertical center
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 10);
            this.ctx.fillText(`Accuracy: ${Math.round((1 - ForceQuadTree.MIN_THRESHOLD) * 10000) / 100}%`, 10, 30);
            if (this.bounds)
                this.ctx.fillText(`Bounds ${Math.round(this.bounds.width)}x${Math.round(this.bounds.height)}`, 10, 50);
            this.ctx.fillText(`Nodes: ${Object.keys(this.nodes).length}`, 10, 70);
            this.ctx.fillText(`Edges: ${Object.keys(this.edges).length}`, 10, 90);
            this.ctx.fillText(`Energy: ${this.last_total_energy}`, 10, 110);
        }

        if (!this.debug_box.checked) {
            this.ctx.restore();
            return;
        }
        //Quad tree debug
        if (this.force_quad_tree) {
            this.ctx.beginPath();

            let b = null;
            let cy = 0;
            for (const region of this.force_quad_tree.getAllRegions()) {
                b = region.boundary;

                this.ctx.strokeRect(b.center.x - b.half_dimension.width, b.center.y - b.half_dimension.height, b.half_dimension.width * 2, b.half_dimension.height * 2);
                // if(region.COM !== null)
                //     this.ctx.fillRect(region.COM.x, region.COM.y, 5,5)
            }
            // if(!this.mark)
            //     this.mark = true;

            this.ctx.closePath();


        }


        this.ctx.restore();

    }


    update(dt_ms) {
        let curr_total_energy = 0;
        // const node_stack = [];
        this.bounds = this.ctx.canvas.getBoundingClientRect();
        // let requires_force_calc = curr_total_energy === this.last_total_energy;

        this.force_quad_tree = new ForceQuadTree(AABB.fromRect(0, 0, this.bounds.width, this.bounds.height));


        // this.is_everything_bounded = window.innerWidth > 740;
        // Calculate forces
        for (const id in this.nodes) {
            const node = this.nodes[id];

            this.force_quad_tree.insert(node.position, node);

        }
        // console.log(this.force_quad_tree)

        for (const id in this.edges) {
            const edge = this.edges[id];
            edge.update(dt_ms);
            const node1 = edge.start_node;
            const node2 = edge.end_node;

            const attr_force = computeAttraction(node1.position, node2.position, k_attr);

            node1.attr_force.x += attr_force.x;
            node1.attr_force.y += attr_force.y;

            node2.attr_force.x -= attr_force.x;
            node2.attr_force.y -= attr_force.y;

            curr_total_energy += 1 / edge.start_node.position.subtract(edge.end_node.position).length_sqrd();
        }
        curr_total_energy *= k_attr;

        // Update nodes
        for (const id in this.nodes) {
            const node = this.nodes[id];
            if (!this.drawable_selected && node.containsPoint(MouseInfo.location) && MouseInfo.is_primary_btn_down) {
                this.drawable_selected = node;
            }
            if (this.force_quad_tree) {
                node.repln_force = this.force_quad_tree.getTotalForcesOnPoint(node.position, node, computeRepulsion);
            }
            node.update(dt_ms);
            curr_total_energy += node.velocity.length_sqrd();



            if (this.is_everything_bounded) {
                node.position.x = clamp(node.position.x, node.radius, this.bounds.width - node.radius);
                node.position.y = clamp(node.position.y, node.radius, this.bounds.height - node.radius);
            }

            if (isNaN(node.x)) {
                node.position.x = this.bounds.width * Math.random();
                node.position.y = this.bounds.height * Math.random();
            }
            // console.log(node.repln_force);

            if (this.accumulated_time === 0) {
                const node_el = document.getElementById(id);
                node_el.innerHTML = `<div>${node.id}</div><div> ${Math.round(node.position.x)}i + ${Math.round(node.position.y)}j </div><div>${Math.round(node.velocity.x * 1000) / 1000}i + ${Math.round(node.velocity.y * 1000) / 1000}</div>`;
            }

        }
        curr_total_energy *= k_repl;

        if (this.drawable_selected) {
            this.drawable_selected.position.x = MouseInfo.location.x;
            this.drawable_selected.position.y = MouseInfo.location.y;
            if (!MouseInfo.is_primary_btn_down) {
                this.drawable_selected = null;
            }
        }
        Scene.animator.step(dt_ms);

        if (this.accumulated_time === 0)
            this.last_total_energy = curr_total_energy;
    }
}

const softening_factor = 10 ** 2;

/**
 *
 * @param vec1 {Vector}
 * @param vec2 {Vector}
 * @param mass {number}
 * @returns {{x: number, y: number}}
 */
export function computeRepulsion(vec1, vec2, mass = 1) {
    const distance_vec = vec1.subtract(vec2);
    const dist_sq = distance_vec.length_sqrd();

    const angle = Math.atan2(distance_vec.y, distance_vec.x);

    const force = k_repl / (dist_sq + softening_factor) * mass;
    return {
        x: Math.round(force * Math.cos(angle)), //horizontal component of force
        y: Math.round(force * Math.sin(angle)) //vertical component of force
    };
}

/**
 *
 * @param vec1 {Vector}
 * @param vec2 {Vector}
 * @param k
 * @returns {Readonly<{x: number, y: number}>|{x: number, y: number}}
 */
export function computeAttraction(vec1, vec2, k = k_attr) {
    const distance_vec = vec1.subtract(vec2);
    const dist_sq = distance_vec.length_sqrd();

    if (dist_sq < 0.01) {
        return ZERO_VEC;
    }
    const dist = Math.sqrt(dist_sq);

    const force = k * (dist - NATURAL_EDGE_LENGTH);

    return {
        x: -Math.round(distance_vec.x / dist * force), //horizontal component of force
        y: -Math.round(distance_vec.y / dist * force) //vertical component of force
    };
}

