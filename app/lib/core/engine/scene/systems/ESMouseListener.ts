import {type EntitySystem, ESRequirements} from "./EntitySystem";
import type {Entity} from "../Entity";
import {ECID} from "../components/EntityComponent";
import {ECMouseListener} from "../components/ECMouseListener";
import {Vector2D} from "../../utils/Vector2D";
import {ECAxisAlignedBoundingBox} from "../components/ECAxisAlignedBoundingBox";
import {ECPosition} from "../components";
import type { World } from "../World";

// filepath: e:\Projects\Algo\app\lib\engine\scene\systems\ESMouseListener.ts

export class ESMouseListener implements EntitySystem {
    requirement = ESRequirements.from(ECID.MouseListener, ECID.Position, ECID.AABB);
    private readonly mousePosition = new Vector2D(0, 0);
    private mousePressed = false;
    private mouseClicked = false;

    constructor(private ctx: CanvasRenderingContext2D) {
    }

    start(): boolean {
        const canvas = this.ctx.canvas;


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
        })
        return true;
    }

    update(_: number,world: World): void {
        for (const entity of world.getEntities()) {
            const mouseListener = world.getComponent(entity,ECMouseListener);
            // Reset frame-specific states

            const aabb = world.getComponent(entity,ECAxisAlignedBoundingBox);
            const center = world.getComponent(entity,ECPosition);

            if(!aabb || !center || !mouseListener)
                continue;
            //check intersection
            const isIntersecting = aabb && center &&
                this.mousePosition.x >= center.x - aabb.halfWidth &&
                this.mousePosition.x <= center.x + aabb.halfWidth &&
                this.mousePosition.y >= center.y - aabb.halfHeight &&
                this.mousePosition.y <= center.y + aabb.halfHeight;

            mouseListener.hovered = isIntersecting || false;

            if (!mouseListener.mouseDown)
                mouseListener.mouseDown = (isIntersecting && this.mousePressed) ?? false;
            else {
                if (!this.mousePressed)
                    mouseListener.mouseDown = false;
            }
            mouseListener.clicked = this.mouseClicked;

            this.mouseClicked = false;
            mouseListener.mousePosition.set(this.mousePosition.x, this.mousePosition.y);
            // Update mouse position and interaction states
            // This would typically be connected to actual mouse events
            // For now, we set up the component for event handlers to update
        }
    }

    end(): void {
        // Cleanup if needed
    }
}