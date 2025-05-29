import MouseInfo, {setupMouseInfoFor} from "../utils/MouseInfo.mjs";
import {COMMAND_TYPES} from "./commands.mjs";
import {Animator, ColorAnimation} from "./animation.mjs";
import {ThemeManager} from "./theme.mjs";
import {Node} from "./components/node.mjs";
import {Edge} from "./components/edge.mjs";
import {Logger} from "./components/logger.mjs";
import {clamp} from "../utils/PMath.mjs";

const ZERO_VEC = Object.freeze({x: 0, y: 0});
const NATURAL_EDGE_LENGTH = 100;

const NATURAL_EDGE_LENGTH_SQRD = NATURAL_EDGE_LENGTH * NATURAL_EDGE_LENGTH;
const NODE_CHARGE = 1;

export class Scene {

    constructor(ctx, show_fps = false) {
        this.ctx = ctx;
        this.drawable_categories = {
            nodes: {},
            edges: {}
        };
        this.accumulated_time = 0;
        this.show_fps = show_fps;
        this.last_animation_call_time = 0;
        this.is_running = false;
        this.fps = 0;
        this.k_attr = 100;
        this.k_repl = 10E6;
        this.drawable_selected = null;
        this.animator = new Animator();
        this.logger = new Logger();
        this.grid_size = {x: 100, y: 100};
        setupMouseInfoFor(this.ctx.canvas);


    }

    handleCommand(command) {
        // console.log("Command: ", command)
        switch (command.type) {
            //Addition
            case COMMAND_TYPES.ADD_NODE:
                const node = new Node(this.ctx, command.id, command.pos.x, command.pos.y, command.radius);
                this.drawable_categories.nodes[node.id] = node;
                break;
            case COMMAND_TYPES.ADD_EDGE:
                const from = this.drawable_categories.nodes[command.from];
                const end = this.drawable_categories.nodes[command.end];
                const edge = new Edge(this.ctx, from, end);
                this.drawable_categories.edges[edge.id] = edge;
                break;

            //Highlight
            case COMMAND_TYPES.HIGHLIGHT_NODE:
                const node_to_highlight = this.drawable_categories.nodes[command.id];
                if (node_to_highlight)
                    this.highlight(node_to_highlight);
                else
                    console.error("[HIGHLIGHT] Node not found: ", command.id);
                break;
            case COMMAND_TYPES.HIGHLIGHT_EDGE:
                const id = Edge.getEdgeKey(command.from, command.end);
                const edge_to_highlight = this.drawable_categories.edges[id];
                if (edge_to_highlight)
                    this.highlight(edge_to_highlight);
                else
                    console.error("[HIGHLIGHT] Edge not found: ", id);
                break;
            //Modification
            case COMMAND_TYPES.LABEL_NODE:
                const node_to_label = this.drawable_categories.nodes[command.id];
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
                for (const id in this.drawable_categories.edges) {
                    const drawable = this.drawable_categories.edges[id];
                    drawable.reset();
                }
                for (const id in this.drawable_categories.nodes) {
                    const drawable = this.drawable_categories.nodes[id];
                    drawable.reset();
                }
                break;
            default:
                console.error("Unknown command: ", command);
                break;
        }
    }

    highlight(drawable) {
        this.animator.add(new ColorAnimation(drawable, drawable.color, ThemeManager.getBgColor(drawable.getName(), "highlighted")));
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
        this.is_running = true;
        this.last_animation_call_time = performance.now();
        this.accumulated_time = 0;
        this.loop(this.last_animation_call_time);
    }

    stop() {
        this.is_running = false;
    }


    render() {
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
        const edges = this.drawable_categories.edges;
        const nodes = this.drawable_categories.nodes;
        for (const id in edges) {
            const node = edges[id];
            node.render();
        }
        for (const id in nodes) {
            const node = nodes[id];
            node.render();
            node.attr_force.x = 0;
            node.attr_force.y = 0;

            node.repln_force.x = 0;
            node.repln_force.y = 0;
        }

        //drawing fps
        if (!this.show_fps)
            return;
        this.ctx.fillStyle = ThemeManager.getTextColor("on-background");
        this.ctx.textAlign = "left";    // Horizontal center
        this.ctx.font = "1em Arial";
        this.ctx.textBaseline = "top"; // Vertical center
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 10);
    }


    update(dt_ms) {
        const node_stack = [];
        for (const id in this.drawable_categories.nodes) {
            const node = this.drawable_categories.nodes[id];


            if (!this.drawable_selected && node.containsPoint(MouseInfo.location) && MouseInfo.is_primary_btn_down) {
                this.drawable_selected = node;
            }
            // node.force = {x:0, y:0}
            for (const other_id in this.drawable_categories.nodes) {
                if (other_id === id || other_id in node_stack)
                    continue;
                const other_node = this.drawable_categories.nodes[other_id];
                const repln_force = computeRepulsion(node.x, node.y, other_node.x, other_node.y, NODE_CHARGE, NODE_CHARGE, this.k_repl);
                node.repln_force.x += repln_force.x;
                node.repln_force.y += repln_force.y;

                other_node.repln_force.x -= repln_force.x;
                other_node.repln_force.y -= repln_force.y;
            }


            // console.log("Force on ", node.id, "is", node.force)

            node_stack.push(id); //push ids of nodes whose repulsion has already been calculated to avoid duplicate calculation
        }

        for (const id in this.drawable_categories.edges) {
            const edge = this.drawable_categories.edges[id];
            edge.update(dt_ms);
            const node1 = edge.start_node;
            const node2 = edge.end_node;

            const attr_force = computeAttraction(node1, node2, this.k_attr);

            node1.attr_force.x += attr_force.x;
            node1.attr_force.y += attr_force.y;

            node2.attr_force.x -= attr_force.x;
            node2.attr_force.y -= attr_force.y;
        }
        for (const id in this.drawable_categories.nodes) {
            const node = this.drawable_categories.nodes[id];
            node.update(dt_ms);

            const bounds = this.ctx.canvas.getBoundingClientRect();
            node.x = clamp(node.x, node.radius, bounds.width - node.radius);
            node.y = clamp(node.y, node.radius, bounds.height - node.radius);
            // console.log(node.repln_force);

        }
        if (this.drawable_selected) {
            this.drawable_selected.x = MouseInfo.location.x;
            this.drawable_selected.y = MouseInfo.location.y;
            if (!MouseInfo.is_primary_btn_down) {
                this.drawable_selected = null;
            }
        }
        this.animator.step(dt_ms);
    }

    log(...data) {
        this.logger.log(data.join(" "), Logger.INFO);
    };
}

function computeRepulsion(x1, y1, x2, y2, charge1, charge2, k) {
    const dx = x1 - x2;
    const dy = y1 - y2;

    const dist_sq = dx * dx + dy * dy;
    // if (dist_sq > NATURAL_EDGE_LENGTH_SQRD) {
    //     return ZERO_VEC;
    // }

    const angle = Math.atan2(dy, dx);
    const force = k * charge1 * charge2 / dist_sq;
    return {
        x: Math.round(force * Math.cos(angle)), //horizontal component of force
        y: Math.round(force * Math.sin(angle)) //vertical component of force
    };
}

function computeAttraction(node1, node2, k) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;

    const dist_sq = dx * dx + dy * dy;
    if (dist_sq < 0.01) {
        return ZERO_VEC;
    }
    const dist = Math.sqrt(dist_sq);

    const force = k * (dist - NATURAL_EDGE_LENGTH);

    return {
        x: -Math.round(dx / dist * force), //horizontal component of force
        y: -Math.round(dy / dist * force) //vertical component of force
    };
}

