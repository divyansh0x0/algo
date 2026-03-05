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

    constructor(private ctx: CanvasRenderingContext2D, private cellSize: number = 30) {
    }

    start(): boolean {
        return true;
    }

    update(_: number, world: World): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const camera = world.getResource(ERCamera);
        if (!camera) {
            console.error("Camera not found");
            return;
        }
        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;
        const zoomPoint = camera.zoomPivot;

        this.ctx.fillStyle = ThemeManager.color("textSecondary").hex;
        this.ctx.textAlign = "start";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(`Camera:${camera.position.x},${camera.position.y}`, 0, 0);
        this.renderGrids(camera, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        this.ctx.translate(originX, originY);
        this.ctx.translate(zoomPoint.x, zoomPoint.y);
        this.ctx.scale(camera.scale, camera.scale);
        this.ctx.translate(-zoomPoint.x, -zoomPoint.y);
        this.ctx.translate(-camera.position.x, -camera.position.y);
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
        const cellSize = this.cellSize*camera.scale;
        const rows = Math.floor(height / cellSize) + 1;
        const columns = Math.floor(width / cellSize) + 1;
        const halfGridWidth = columns * cellSize;
        const halfGridHeight = rows * cellSize;
        const gridStartX = -camera.position.x*camera.scale % cellSize;
        const gridStartY = -camera.position.y*camera.scale % cellSize;
        this.ctx.strokeStyle = ThemeManager.color("grid").hex;
        this.ctx.beginPath();
        // vertical lines
        for (let i = 0; i <= columns; i++) {
            const x = gridStartX + cellSize * i;
            this.ctx.moveTo(x, -halfGridHeight);
            this.ctx.lineTo(x, halfGridHeight);
        }
        // horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = gridStartY + cellSize * i;
            this.ctx.moveTo(-halfGridWidth, y);
            this.ctx.lineTo(halfGridWidth, y);

        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
}