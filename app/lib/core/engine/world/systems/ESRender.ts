import { ThemeManager, type ThemeStyle } from "../../theme";
import type { Color } from "../../utils";
import { Vector2D } from "../../utils";
import {
    ECBackgroundColor,
    ECBorderColor,
    ECCircle,
    ECDrawableStyle,
    ECPosition,
    ECRectangle,
    ECText,
    ECTextColor
} from "../components";
import type { Entity } from "../Entity";
import { ERCamera } from "../resources";
import type { ComponentClass, World } from "../World";
import type { EntitySystem } from "./EntitySystem";

type Renderer = (entity: Entity, pos: Vector2D, world: World) => void;

export class ESRender implements EntitySystem {

    private renderers = new Map<ComponentClass, Renderer>([
        [ ECRectangle, this.renderRectangle.bind(this) ],
        [ ECCircle, this.renderCircle.bind(this) ],
        [ ECText, this.renderText.bind(this) ]
    ]);
    private fpsTracker = {
        fps: 0,
        frameCount: 0,
        timePassed: 0,
    };

    constructor(private ctx: CanvasRenderingContext2D, private cellSize: number = 30) {
    }

    start(): boolean {
        return true;
    }

    update(dt_ms: number, world: World): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const camera = world.getResource(ERCamera);
        if (!camera) {
            console.error("Camera not found");
            return;
        }
        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;

        this.ctx.save();
        this.ctx.translate(originX, originY);
        this.ctx.scale(camera.scale, camera.scale);
        this.ctx.translate(-camera.position.x, camera.position.y);
        this.renderGrids(camera, this.ctx.canvas.width, this.ctx.canvas.height);
        for (const entity of world.getEntities()) {
            const pos = world.getComponent(entity, ECPosition);
            if (!pos) continue;

            const renderPos = new Vector2D(pos.x, pos.y);

            for (const [ component, renderer ] of this.renderers) {
                if (world.entityHas(entity, component)) {
                    renderer(entity, renderPos, world);
                }
            }
        }
        this.ctx.restore();
        this.renderInfo(world);
        this.updateFps(dt_ms);
    }

    end(): void {
    }

    private renderRectangle(entity: Entity, pos: Vector2D, world: World) {
        const rect = world.getComponent(entity, ECRectangle)!;

        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        if (rect.drawStyle === ECDrawableStyle.Fill) {
            const bg = world.getComponent(entity, ECBackgroundColor);
            this.applyFillColor(bg?.value, "primary");
            this.ctx.fillRect(-rect.width * 0.5, -rect.height * 0.5, rect.width, rect.height);
        } else {
            const border = world.getComponent(entity, ECBorderColor);
            this.applyStrokeColor(border?.value, "primary");
            this.ctx.strokeRect(-rect.width * 0.5, -rect.height * 0.5, rect.width, rect.height);
        }
        this.ctx.restore();

    }

    private renderCircle(entity: Entity, pos: Vector2D, world: World) {
        const circle = world.getComponent(entity, ECCircle)!;

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, circle.radius, 0, 2 * Math.PI);
        this.ctx.closePath();

        if (circle.drawStyle === ECDrawableStyle.Fill) {
            const bg = world.getComponent(entity, ECBackgroundColor);
            this.applyFillColor(bg?.value, "primary");
            this.ctx.fill();
        } else {
            const border = world.getComponent(entity, ECBorderColor);
            this.applyStrokeColor(border?.value, "primary");
            this.ctx.stroke();
        }
    }

    private renderText(entity: Entity, pos: Vector2D, world: World) {
        const text = world.getComponent(entity, ECText)!;
        const color = world.getComponent(entity, ECTextColor);
        this.ctx.save();
        this.applyFillColor(color?.value, "textPrimary");
        this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.translate(pos.x, pos.y);
        this.ctx.fillText(text.text, text.relX, text.relY);
        this.ctx.restore();
    }

    private applyStrokeColor<K extends keyof ThemeStyle>(color: Color | undefined, defaultColor: K) {
        this.ctx.strokeStyle = color?.hex ?? ThemeManager.color(defaultColor).hex;
    }

    private applyFillColor<K extends keyof ThemeStyle>(color: Color | undefined, defaultColor: K) {
        this.ctx.fillStyle = color?.hex ?? ThemeManager.color(defaultColor).hex;
    }

    private renderGrids(camera: ERCamera, width: number, height: number): void {
        this.ctx.save();
        const cellSize = this.cellSize;
        const halfRows = Math.floor(height / 2 / camera.scale / cellSize) + 1;
        const halfColumns = Math.floor(width / 2 / camera.scale / cellSize) + 1;
        console.log(halfColumns, halfRows);
        const halfGridWidth = halfColumns * cellSize;
        const halfGridHeight = halfRows * cellSize;
        const gridStartX = -camera.position.x % cellSize;
        const gridStartY = camera.position.y % cellSize;
        this.ctx.strokeStyle = ThemeManager.color("grid").hex;
        this.ctx.beginPath();
        // vertical lines
        for (let i = -halfColumns; i <= halfColumns; i++) {
            const x = gridStartX + cellSize * i + camera.position.x;
            this.ctx.moveTo(x, -halfGridHeight - camera.position.y);
            this.ctx.lineTo(x, halfGridHeight - camera.position.y);
        }
        // horizontal lines
        for (let i = -halfRows; i <= halfRows; i++) {
            const y = gridStartY + cellSize * i - camera.position.y;
            this.ctx.moveTo(-halfGridWidth + camera.position.x, y);
            this.ctx.lineTo(halfGridWidth + camera.position.x, y);

        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }

    private renderInfo(world: World): void {
        const camera = world.getResource(ERCamera);
        const x = 0;
        let y = 0;
        this.ctx.fillStyle = ThemeManager.color("textSecondary").hex;
        this.ctx.textAlign = "start";
        this.ctx.textBaseline = "top";
        this.ctx.font = `22px monospace`;
        if (camera) {
            this.ctx.fillText(`Camera:${camera.position.x.toFixed(2)},${camera.position.y.toFixed(2)}`, x, y);
            y += 30;
        }
        //FPS tracker
        this.ctx.fillText(`FPS:${this.fpsTracker.fps.toFixed(2)}`, x, y);

    }

    private updateFps(dt_ms: number): void {
        this.fpsTracker.frameCount += 1;
        this.fpsTracker.timePassed += dt_ms;
        if (this.fpsTracker.timePassed >= 1000) {
            this.fpsTracker.fps = this.fpsTracker.frameCount ;
            this.fpsTracker.timePassed = 0;
            this.fpsTracker.frameCount = 0;
        }
    }
}