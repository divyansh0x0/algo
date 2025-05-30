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
const NATURAL_EDGE_LENGTH = 50;
const NODE_CHARGE = 1;
const k_repl = 10e6;
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
        /** @type {Node[]}*/
        this.nodes = [];
        /** @type {Edge[]}*/
        this.edges = [];
        this.accumulated_time = 0;
        this.show_fps = show_fps;
        this.last_animation_call_time = 0;
        this.is_running = false;
        this.fps = 0;
        this.k_attr = 100;
        this.k_repl = 10E6;
        this.drawable_selected = null;
        this.logger = new Logger();
        this.grid_size = {x: 100, y: 100};
        setupMouseInfoFor(this.ctx.canvas);
        this.debug = debug;
        this.force_quad_tree = null;
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
            const node = edges[id];
            node.render();
        }

        this.ctx.strokeStyle = ThemeManager.getColor("debug");
        this.ctx.fillStyle = ThemeManager.getTextColor("on-background");
        this.ctx.font = "1em Arial";

        for (const id in nodes) {
            const node = nodes[id];
            node.render();


            node.attr_force.x = 0;
            node.attr_force.y = 0;

            node.repln_force.x = 0;
            node.repln_force.y = 0;
        }

        if (!this.debug) {
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
                // if(region.has_sub_divisions && region.COM !== null)
                //     this.ctx.fillRect(region.COM.x, region.COM.y, 5,5)
            }
            // if(!this.mark)
            //     this.mark = true;

            this.ctx.closePath();
        }
        //drawing fps
        if (!this.show_fps)
            return;
        this.ctx.fillStyle = ThemeManager.getTextColor("on-background");
        this.ctx.textAlign = "left";    // Horizontal center
        this.ctx.font = "1em Arial";
        this.ctx.textBaseline = "top"; // Vertical center
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 10);
        this.ctx.fillText(`Accuracy: ${1 - ForceQuadTree.MAX_THRESHOLD_SQRD}`, 10, 30);
        if (this.bounds)
            this.ctx.fillText(`Bounds ${Math.round(this.bounds.width)}x${Math.round(this.bounds.height)}`, 10, 50);
        this.ctx.restore();
    }


    update(dt_ms) {
        const node_stack = [];
        this.bounds = this.ctx.canvas.getBoundingClientRect();
        this.force_quad_tree = new ForceQuadTree(AABB.fromRect(this.bounds.width / 2, this.bounds.height / 2, this.bounds.width / 2, this.bounds.height / 2));

        // Calculate forces
        for (const id in this.nodes) {
            const node = this.nodes[id];

            this.force_quad_tree.insert(node.position, node);

            if (!this.drawable_selected && node.containsPoint(MouseInfo.location) && MouseInfo.is_primary_btn_down) {
                this.drawable_selected = node;
            }




            // console.log("Force on ", node.id, "is", node.force)

            node_stack.push(id); //push ids of nodes whose repulsion has already been calculated to avoid duplicate calculation
        }
        // console.log(this.force_quad_tree)

        for (const id in this.edges) {
            const edge = this.edges[id];
            edge.update(dt_ms);
            const node1 = edge.start_node;
            const node2 = edge.end_node;

            const attr_force = computeAttraction(node1.position, node2.position, this.k_attr);

            node1.attr_force.x += attr_force.x;
            node1.attr_force.y += attr_force.y;

            node2.attr_force.x -= attr_force.x;
            node2.attr_force.y -= attr_force.y;
        }

        // Update nodes
        for (const id in this.nodes) {
            const node = this.nodes[id];
            if (this.force_quad_tree) {
                node.repln_force = this.force_quad_tree.getTotalForcesOnPoint(node.position, computeRepulsion);
            }
            node.update(dt_ms);


            node.position.x = clamp(node.position.x, node.radius, this.bounds.width - node.radius);
            node.position.y = clamp(node.position.y, node.radius, this.bounds.height - node.radius);

            if (isNaN(node.x)) {
                node.position.x = this.bounds.width * Math.random();
                node.position.y = this.bounds.height * Math.random();
            }
            // console.log(node.repln_force);

//             const node_el = document.getElementById(id);
//             node_el.innerHTML = `
// <div>${node.id}</div>
// <div> ${node.position}px </div>
// <div>${node.repln_force}</div>
// `;
        }

        if (this.drawable_selected) {
            this.drawable_selected.position.x = MouseInfo.location.x;
            this.drawable_selected.position.y = MouseInfo.location.y;
            if (!MouseInfo.is_primary_btn_down) {
                this.drawable_selected = null;
            }
        }
        Scene.animator.step(dt_ms);
    }
}

function computeRepulsion(vec1, vec2) {
    const distance_vec = vec1.sub(vec2);
    const dist_sq = distance_vec.length_sqrd();
    // if (dist_sq > NATURAL_EDGE_LENGTH_SQRD) {
    //     return ZERO_VEC;
    // }

    const angle = Math.atan2(distance_vec.y, distance_vec.x);
    const force = k_repl / (dist_sq + 1);
    return {
        x: Math.round(force * Math.cos(angle)), //horizontal component of force
        y: Math.round(force * Math.sin(angle)) //vertical component of force
    };
}

function computeAttraction(vec1, vec2, k) {
    const distance_vec = vec1.sub(vec2);
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

