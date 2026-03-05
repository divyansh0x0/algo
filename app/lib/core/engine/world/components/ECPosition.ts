import { Vector2D } from "../../utils";
import type { EntityComponent } from "./EntityComponent";

export class ECPosition extends Vector2D implements EntityComponent {
    

    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}