import MouseInfo, {setupMouseInfoFor} from "../utils/MouseInfo.mjs";
import {COMMAND_TYPES} from "./commands.mjs";
import {Animator, ColorAnimation} from "./animation.mjs";
import {clamp, roundedClamp} from "../utils/PMath.js";
import {ThemeManager} from "./theme.mjs";

const ZERO_VEC = {x: 0, y: 0};
const MIN_EDGE_LENGTH_SQRD = 200 ** 2;

function getEdgeKey(nodeId1, nodeId2) {
    return [nodeId1, nodeId2].sort().join();
}

class Drawable {
    constructor(ctx, id) {
        this.ctx = ctx;
        this.id = id;
        this.color = ThemeManager.getBgColor(this.getName());
    }

    getName() {
        return this.constructor.name.toLowerCase();
    }

    update(dt_ms) {

    }

    render() {

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
        this.ctx.closePath()
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

class Node extends Drawable {
    constructor(ctx, id, x, y, radius, text = "") {
        super(ctx, id);
        this.text = text;
        this.x = x;
        this.y = y;
        this.velocity = {x: 0, y: 0};
        this.radius = radius;
        this.force = {x: 0, y: 0};
        this.max_velocity = 100;
        this.damping = 0.9;
    }

    update(dt_ms) {
        dt_ms = 20; //fixed dtms
        // console.log(this.id,this.force)
        const dvx = (clamp(this.force.x * dt_ms / 1000, -this.max_velocity, this.max_velocity));
        const dvy = (clamp(this.force.y * dt_ms / 1000, -this.max_velocity, this.max_velocity));

        this.velocity.x += dvx;
        this.velocity.y += dvy;

        const dx = this.velocity.x * dt_ms / 1000;
        const dy = this.velocity.y * dt_ms / 1000;
        this.x += dx;
        this.y += dy;

        this.x = roundedClamp(this.x, this.radius, this.ctx.canvas.width - this.radius);
        this.y = roundedClamp(this.y, this.radius, this.ctx.canvas.height - this.radius);

        this.force.x = 0;
        this.force.y = 0;

        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
    }

    render() {
        this.drawCircle(this.radius, this.x, this.y, this.color, true, ThemeManager.getBgColor(this.getName(), "border"), 1);
        this.drawText(this.id, this.x, this.y, ThemeManager.getTextColor("on-primary"));
        this.drawText(this.text, this.x, this.y + this.radius + 10, ThemeManager.getTextColor("on-background"));

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

class Edge extends Drawable {
    constructor(ctx, start_node, end_node) {
        super(ctx, getEdgeKey(start_node.id, end_node.id));
        this.text_color = "#000";
        this.start_node = start_node;
        this.end_node = end_node;
    }

    render() {
        // const color = this.is_highlighted ? "blue" : this.color;
        const from_pos = {x: this.start_node.x, y: this.start_node.y};
        const to_pos = {x: this.end_node.x, y: this.end_node.y};
        this.drawLine(from_pos.x, from_pos.y, to_pos.x, to_pos.y, 10, this.color);
    }

}

class Logger {
    static INFO = 0;
    static WARN = 1;
    static ERROR = 2;
    static SUCCESS = 3;
    static LOG_COLORS = {
        0: "#5b88fa",
        1: "#e4bb16",
        2: "#fd6e6e",
        3: "#70ff70"
    };

    /**
     *
     * @param ctx canvas context 2d
     * @param available_area An array of format [x,y,width,height] which defines the available area for logs
     */
    constructor() {
        this.storage_map = new Map();
        this.border_radius = [10, 10, 10, 10];
        this.color = "#000";
        this.text_color = "#fff";
    }

    log(msg, type, duration_ms = 1000) {
        const key = performance.now().toFixed(0);
        const log_data = {msg: msg, type: type};
        this.storage_map.set(key, log_data);

        if (!isNaN(duration_ms)) {
            setTimeout(() => {
                this.storage_map.delete(key);
            }, duration_ms);
        }
    }

    getLogSuffix(type) {
        switch (type) {
            case 0:
                return "INFO";
            case 1:
                return "WARN";
            case 2:
                return "ERROR";
            case 3:
                return "SUCCESS";

        }
    }
}

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
        this.k = 1000;
        this.drawable_selected = null;
        this.animator = new Animator();
        this.logger = new Logger();
        this.grid_size = {x:100,y:100};
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
                const id = getEdgeKey(command.from, command.end);
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
            const drawable = edges[id];
            drawable.render();
        }
        for (const id in nodes) {
            const drawable = nodes[id];
            drawable.render();
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
                const repln_force = computeRepulsion(node, other_node, this.k);
                node.force.x += repln_force.x;
                node.force.y += repln_force.y;

                other_node.force.x -= repln_force.x;
                other_node.force.y -= repln_force.y;
            }

            // console.log("Force on ", node.id, "is", node.force)

            node_stack.push(id); //push ids of nodes whose repulsion has already been calculated to avoid duplicate calculation
            node.update(dt_ms);
        }
        for (const id in this.drawable_categories.edges) {
            const edge = this.drawable_categories.edges[id];
            edge.update(dt_ms);
            const node1 = edge.start_node;
            const node2 = edge.end_node;

            const attr_force = computeAttraction(node1, node2, this.k);

            node1.force.x += attr_force.x;
            node1.force.y += attr_force.y;

            node2.force.x -= attr_force.x;
            node2.force.y -= attr_force.y;
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

function computeRepulsion(node1, node2, k) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;

    const dist_sq = dx * dx + dy * dy + 0.001;
    if (dist_sq > MIN_EDGE_LENGTH_SQRD) {
        return ZERO_VEC;
    }

    const dist = Math.sqrt(dist_sq);
    const force = Math.pow(2, k / dist);

    return {
        x: (dx / dist * force), //horizontal component of force
        y: (dy / dist * force) //vertical component of force
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

    const force = dist;

    return {
        x: -(dx / dist * force), //horizontal component of force
        y: -(dy / dist * force) //vertical component of force
    };
}

