import MouseInfo, { setupMouseInfoFor } from "../utils/MouseInfo.mjs";
import { COMMAND_TYPES } from "./commands.mjs";

class Drawable {
    constructor(ctx) {
        this.ctx = ctx;
        this.color = "#fff";
    }
    update(){
        
    }
    render(){

    }
    drawCircle(radius, x, y, color, b_add_border = false, border_color, border_width = 1) {
        const prev_fill_style_color = this.ctx.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        if (b_add_border) {
            let prev_stroke_style_color = this.ctx.strokeStyle;
            this.ctx.lineWidth = border_width;
            this.ctx.strokeStyle = border_color;
            this.ctx.stroke();
            this.ctx.strokeStyle = prev_stroke_style_color;
        }
        this.ctx.fillStyle = prev_fill_style_color;
    }

    drawLine(from_x, from_y, to_x, to_y, thickness, color) {
        const prev_fill_style_color = this.ctx.fillStyle;
        const prev_line_cap = this.ctx.lineCap;
        this.ctx.beginPath();
        this.ctx.moveTo(from_x, from_y);
        this.ctx.lineTo(to_x, to_y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = "round";

        this.ctx.stroke();
        this.ctx.strokeStyle = prev_fill_style_color;
        this.ctx.lineCap = prev_line_cap;
    }
    drawText(text, x, y, color, font_size_em=1) {
        const prev_fill_style_color = this.ctx.fillStyle;
        const prev_font = this.ctx.font;
        const prev_text_align = this.ctx.textAlign;
        const prev_text_baseline = this.ctx.textBaseline;

        this.ctx.textAlign = "center";    // Horizontal center
        this.ctx.textBaseline = "middle"; // Vertical center
        this.ctx.font = `${font_size_em}em Arial`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x,y)

        //reset
        this.ctx.font = prev_font;
        this.ctx.fillStyle = prev_fill_style_color;
        this.ctx.textAlign = prev_text_align;
        this.ctx.textBaseline = prev_text_baseline;
    }
    toPixelPosition(x, y) {
        return {
            x: x * this.ctx.canvas.width,
            y: y * this.ctx.canvas.height
        }
    }

    toFractionPosition(x, y) {
        return {
            x: x / this.ctx.canvas.width,
            y: y / this.ctx.canvas.height
        }
    }
}

class Node extends Drawable{
    constructor(ctx,name,x, y, radius,text = "") {
        super(ctx)
        this.name = name;
        this.text = text;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "#fff";
        this.text_color = "#000";
        this.is_highlighted = false;
    }
    render(){
        this.drawCircle(this.radius, this.x,this.y, this.color, true, "red", 1)
        this.drawText(this.name, this.x,this.y, "#000")
        this.drawText(this.text, this.x,this.y + this.radius, "#fff")

    }
    getDistanceFromPoint(point) {
        // Calculate the distance from the center of the circle to the point
        const dist_sqrd = (this.x - point.x)**2  + (this.y - point.y)**2;
        return Math.sqrt(dist_sqrd);
    }

    //gives a vector from the center of the node to the point
    getPositionDifference(point) {
        return {
            x: point.x - this.x,
            y: point.y - this.y
        }
    }

    containsPoint(point) {
        // Check if the point is inside the circle using the distance formula
        const dist_sqrd = (this.x - point.x)**2  + (this.y - point.y)**2;
        return this.radius ** 2 > dist_sqrd;
    }

}

class Edge extends Drawable{
    constructor(ctx,start_node, end_node) {
        super(ctx)
        this.name = name;
        this.color = "#fff";
        this.text_color = "#000";
        this.start_node = start_node;
        this.end_node = end_node;
    }
    render(){
        const from_pos = {x: this.start_node.x, y: this.start_node.y}
        const to_pos = {x: this.end_node.x, y: this.end_node.y}
        this.drawLine(from_pos.x, from_pos.y, to_pos.x, to_pos.y, 10, "blue")
    }

}


export class Scene {
    constructor(ctx,show_fps = false) {
        this.ctx = ctx;
        this.drawable_categories = {
            nodes:{},
            edges:{}
        }
        this.accumulated_time = 0;
        this.show_fps = show_fps;
        this.last_animation_call_time = 0;
        this.is_running = false;
        this.fps = 0;
        this.drawable_selected = null;
        setupMouseInfoFor(this.ctx.canvas);

    }

    handleCommand(command){
        // console.log("Command: ", command)
        switch(command.type){
            case COMMAND_TYPES.ADD_NODE:
                const node = new Node(this.ctx, command.id, command.pos.x, command.pos.y, command.radius);
                this.drawable_categories.nodes[command.id] = node;
                break;
            case COMMAND_TYPES.ADD_EDGE:
                const from = this.drawable_categories.nodes[command.from];
                const to = this.drawable_categories.nodes[command.to];
                const edge = new Edge(this.ctx, from, to);
                this.drawable_categories.edges[command.from + command.to] = edge;
                break;
            case COMMAND_TYPES.HIGHLIGHT_NODE:
                const node_to_highlight = this.drawable_categories.nodes[command.id];
                if (node_to_highlight) {
                    node_to_highlight.is_highlighted = true;
                    node_to_highlight.color = "#0f0";            
                }
                else{
                    console.error("Node not found: ", command.id);
                }
                break;
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
                console.log("Finished")
                break;

            default:
                console.error("Unknown command: ", command);
                break;
        }
    }

    loop(curr_animation_call_time) {
        if (!this.is_running) return;

        const t1 = this.last_animation_call_time
        const dt_ms = curr_animation_call_time - this.last_animation_call_time;
        this.last_animation_call_time = curr_animation_call_time;
        
    
        this.update(dt_ms);
        this.render();

        const t2 = curr_animation_call_time
        const frame_time = t2-t1;


        this.accumulated_time += frame_time;
        if (this.show_fps) {
            if (this.accumulated_time >= 1000) {
                this.accumulated_time = 0;
                this.fps = this.fps_counter
                this.fps_counter = 0;
            }
            this.fps_counter += 1;
        }
        requestAnimationFrame((time) => {this.loop(time)});
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
    
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#000';

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
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "20px Arial";
         this.ctx.textAlign = "left";    // Horizontal center
         this.ctx.textBaseline = "top"; // Vertical center
        this.ctx.fillText(`FPS: ${this.fps}`, 0, 0);
    
        

    }


    update(dt_ms) {

        for (const id in this.drawable_categories.nodes) {
            const node = this.drawable_categories.nodes[id];
            if(!this.drawable_selected && node.containsPoint(MouseInfo.location) && MouseInfo.is_primary_btn_down) {
                node.color = "#f00";
                this.drawable_selected = node;
            }
        }
        for (const id in this.drawable_categories.edges) {
            const drawable = this.drawable_categories.edges[id];
            drawable.update(dt_ms);
        }

        if(this.drawable_selected){
            this.drawable_selected.x = MouseInfo.location.x;
            this.drawable_selected.y = MouseInfo.location.y; 
            if (!MouseInfo.is_primary_btn_down) {
                this.drawable_selected.color = "#fff";
                this.drawable_selected = null;
            }
        }
    }
}