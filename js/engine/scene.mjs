import { COMMAND_TYPES } from "./commands.mjs";

class Drawable {
    constructor(ctx) {
        this.ctx = ctx;
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
        this.ctx.beginPath();
        this.ctx.moveTo(from_x, from_y);
        this.ctx.lineTo(to_x, to_y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.stroke();
        this.ctx.strokeStyle = prev_fill_style_color;
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
    constructor(ctx,name,x, y, radius) {
        super(ctx)
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "#fff";
        this.text_color = "#000";
    }
    render(){
        this.drawCircle(this.radius, this.x,this.y, "#fff", true, "red", 10)
        this.drawText(this.name, this.x,this.y, "#000")
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

export class Scene {
    constructor(ctx,show_fps = false) {
        this.ctx = ctx;
        this.drawables = [
            new Node(ctx,"A",100,100,10)
        ];
        this.accumulated_time = 0;
        this.show_fps = show_fps;
        this.last_animation_call_time = 0;
        this.is_running = false;
        this.fps = 0;
    }

    handleCommand(command){
        console.log("Command: ", command)
        switch(command.type){
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

        for(let i = 0; i < this.drawables.length; i++){
            const drawable = this.drawables[i]
            drawable.render()
        }

        this.ctx.fillStyle = "#fff";
        this.ctx.font = "20px Arial";
         this.ctx.textAlign = "left";    // Horizontal center
         this.ctx.textBaseline = "top"; // Vertical center
        this.ctx.fillText(`FPS: ${this.fps}`, 0, 0);
    
        

    }

    update(dt_ms) {
        for(let i = 0; i < this.drawables.length; i++){
            const drawable = this.drawables[i]
            // drawable.x += 1
        }
    }
}