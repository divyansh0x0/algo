import { type EasingFunction, type Vector2D, Easings } from "../../utils";
import type {  EntityComponent } from "./EntityComponent";
export class ECMoveTo implements EntityComponent {
    elapsedTimeMs: number = 0;
    constructor(
                public initialPos: Vector2D,
                public finalPos: Vector2D,
                public durationMs: number = 250,
                public easingFunction: EasingFunction = Easings.linear) {
    }
}