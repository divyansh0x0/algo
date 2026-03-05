import { Vector2D } from "../../utils";
import type { EntityResource } from "./EntityResource";
import type { ERCamera } from "./ERCamera";

export class ERMouse implements EntityResource{

    private mousePosition: Vector2D = new Vector2D(0, 0);
    private mousePressed: boolean = false;
    private mouseClicked: boolean = false;
    private scrollDelta: number = 0;
    private buttonsConsumed = false;
    constructor(private ctx: CanvasRenderingContext2D){
        const canvas = ctx.canvas;


        window.addEventListener("mouseup", (e) => {
            const canvas = this.ctx.canvas;
            const x = e.clientX - canvas.clientLeft;
            const y = e.clientY - canvas.clientTop;
            this.mousePressed = false;
            this.mousePosition.set(x, y);
        });
        window.addEventListener("mousemove", (e) => {
            const canvas = this.ctx.canvas;
            const x = e.clientX - canvas.clientLeft;
            const y = e.clientY - canvas.clientTop;
            this.mousePosition.set(x, y);
        });
        canvas.addEventListener("mousedown", (e) => {
            this.mousePosition.set(e.clientX, e.clientY);
            this.mousePressed = true;
        });
        canvas.addEventListener("click", (e) => {
            this.mousePosition.set(e.clientX, e.clientY);
            this.mouseClicked = true;
        });
        canvas.addEventListener("wheel", (e) => {
            this.scrollDelta = Math.sign(e.deltaY);
        })
    }

    setCursorType(name: "default" |"move" | "pointer"){
        switch(name){
            case "move":
                this.ctx.canvas.style.cursor = "move";
                break;
            case "default":
                this.ctx.canvas.style.cursor = "default";
                break;
            case "pointer":
                this.ctx.canvas.style.cursor = "pointer";
                break;
            default:
                this.ctx.canvas.style.cursor = "default";
                break;
        }
    }

    isConsumed():boolean {
        return this.buttonsConsumed;
    }

    consumeButtons():void{
        this.buttonsConsumed = true;
    }
    getWorldPosition(camera:ERCamera): Vector2D {
        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;
        return new Vector2D(camera.position.x + (this.mousePosition.x - originX)/camera.scale, camera.position.y + (this.mousePosition.y - originY)/camera.scale);
    }
    /**
     * Returns the vertical mouse scroll delta. The last delta is cleared once this is called
     */
    get lastScrollDelta(): number {
        const lastScrollDelta = this.scrollDelta;
        this.scrollDelta = 0;
        return lastScrollDelta;
    }

    get position(){
        return this.mousePosition;
    }
    get clicked(){
        return this.mouseClicked;
    }

    get pressed(){
        return this.mousePressed;
    }
    releaseButtons() {
        this.buttonsConsumed=false; 
    }
}