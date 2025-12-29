import {type EntitySystem, ESRequirements} from "~/lib/core/engine/scene/systems/EntitySystem";
import {Entity} from "../Entity";
import {ECID} from "../components/EntityComponent";
import {ECPosition} from "../components/ECPosition";
import {ECCircle, ECDrawableStyle, ECRectangle} from "../components/ECDrawable";
import {ECBackgroundColor, ECBorderColor, ECTextColor} from "../components";
import {ECText} from "~/lib/core/engine/scene/components/ECText";
import {Vector2D} from "~/lib/core/engine/utils";

export class RenderSystem implements EntitySystem {
    private static defaultBG = "#0f0";
    requirement = ESRequirements.from(ECID.Drawable, ECID.Position);

    constructor(private ctx: CanvasRenderingContext2D) {
    }

    start(): boolean {
        return true;
    }

    update(_: number, entities: Entity[]): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const originX = this.ctx.canvas.width / 2;
        const originY = this.ctx.canvas.height / 2;
        // GRID
        // const columnWidth = 100;
        // const rowHeight = 100;
        //

        for (const entity of entities) {
            const pos = entity.get(ECPosition)!;
            const renderPos = new Vector2D(originX + pos.x, originY - pos.y)
            //rectangle
            if (entity.has(ECRectangle)) {
                const rect = entity.get(ECRectangle)!;
                if (rect.drawStyle === ECDrawableStyle.Fill) {
                    const backgroundColor = entity.get(ECBackgroundColor);
                    this.ctx.fillStyle = backgroundColor?.value.hex ?? RenderSystem.defaultBG;
                    this.ctx.fillRect(renderPos.x - rect.width * 0.5, renderPos.y - rect.height * 0.5, rect.width, rect.height);
                } else {
                    const borderColor = entity.get(ECBorderColor);
                    this.ctx.strokeStyle = borderColor?.value.hex ?? RenderSystem.defaultBG;
                    this.ctx.strokeRect(renderPos.x - rect.width * 0.5, renderPos.y - rect.height * 0.5, rect.width, rect.height);
                }

            }
            //circle
            if (entity.has(ECCircle)) {
                const circle = entity.get(ECCircle)!;
                this.ctx.beginPath();
                this.ctx.arc(renderPos.x, renderPos.y, circle.radius, 0, 2 * Math.PI);
                this.ctx.closePath();
                if (circle.drawStyle === ECDrawableStyle.Fill) {
                    const backgroundColor = entity.get(ECBackgroundColor);
                    this.ctx.fillStyle = backgroundColor?.value.hex ?? RenderSystem.defaultBG;
                    this.ctx.fill();
                } else {
                    const borderColor = entity.get(ECBorderColor);
                    this.ctx.strokeStyle = borderColor?.value.hex ?? RenderSystem.defaultBG;
                    this.ctx.stroke();
                }
            }

            // text

            if (entity.has(ECText)) {
                const textColor = entity.get(ECTextColor);
                this.ctx.fillStyle = textColor?.value.hex ?? RenderSystem.defaultBG;
                const text = entity.get(ECText)!;
                this.ctx.font = text.fontSize + "px" + " " + text.fontFamily;
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                const x = renderPos.x + text.relX;
                const y = renderPos.y - text.relY;
                this.ctx.fillText(text.text, x, y);
                // console.log("Rendering:",text.text, "at",renderPos)
            }
        }

    }

    end(): void {
    }

}