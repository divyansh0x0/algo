import { Vector2D } from "../../utils";
import {
    ECBackgroundColor,
    ECBorderColor,
    ECCircle,
    ECDrawableStyle,
    ECPosition,
    ECRectangle,
    ECTextColor
} from "../components";
import { ECText } from "../components/ECText";
import type { Entity } from "../Entity";
import type { ComponentClass, World } from "../World";
import type { EntitySystem } from "./EntitySystem";

type Renderer = (entity: Entity, pos: Vector2D, world: World) => void;

export class RenderSystem implements EntitySystem {
    private static defaultBG = "#0f0";

    private renderers = new Map<ComponentClass, Renderer>([
        [ECRectangle, this.renderRectangle.bind(this)],
        [ECCircle, this.renderCircle.bind(this)],
        [ECText, this.renderText.bind(this)]
    ]);

    constructor(private ctx: CanvasRenderingContext2D) {}

    start(): boolean {
        return true;
    }

    update(_: number, world: World): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;

        for (const entity of world.getEntities()) {
            const pos = world.getComponent(entity, ECPosition);
            if (!pos) continue;

            const renderPos = new Vector2D(originX + pos.x, originY - pos.y);

            for (const [component, renderer] of this.renderers) {
                if (world.entityHas(entity, component)) {
                    renderer(entity, renderPos, world);
                }
            }
        }
    }

    private renderRectangle(entity: Entity, pos: Vector2D, world: World) {
        const rect = world.getComponent(entity, ECRectangle)!;

        if (rect.drawStyle === ECDrawableStyle.Fill) {
            const bg = world.getComponent(entity, ECBackgroundColor);
            this.ctx.fillStyle = bg?.value.hex ?? RenderSystem.defaultBG;
            this.ctx.fillRect(pos.x - rect.width * 0.5, pos.y - rect.height * 0.5, rect.width, rect.height);
        } else {
            const border = world.getComponent(entity, ECBorderColor);
            this.ctx.strokeStyle = border?.value.hex ?? RenderSystem.defaultBG;
            this.ctx.strokeRect(pos.x - rect.width * 0.5, pos.y - rect.height * 0.5, rect.width, rect.height);
        }
    }

    private renderCircle(entity: Entity, pos: Vector2D, world: World) {
        const circle = world.getComponent(entity, ECCircle)!;

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, circle.radius, 0, 2 * Math.PI);
        this.ctx.closePath();

        if (circle.drawStyle === ECDrawableStyle.Fill) {
            const bg = world.getComponent(entity, ECBackgroundColor);
            this.ctx.fillStyle = bg?.value.hex ?? RenderSystem.defaultBG;
            this.ctx.fill();
        } else {
            const border = world.getComponent(entity, ECBorderColor);
            this.ctx.strokeStyle = border?.value.hex ?? RenderSystem.defaultBG;
            this.ctx.stroke();
        }
    }

    private renderText(entity: Entity, pos: Vector2D, world: World) {
        const text = world.getComponent(entity, ECText)!;
        const color = world.getComponent(entity, ECTextColor);

        this.ctx.fillStyle = color?.value.hex ?? RenderSystem.defaultBG;
        this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        const x = pos.x + text.relX;
        const y = pos.y - text.relY;

        this.ctx.fillText(text.text, x, y);
    }

    end(): void {}
}