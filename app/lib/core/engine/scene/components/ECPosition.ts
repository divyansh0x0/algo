import {Vector2D} from "~/lib/core/engine/utils/Vector2D";
import {ECID, type EntityComponent} from "~/lib/core/engine/scene/components/EntityComponent";

export class ECPosition extends Vector2D implements EntityComponent {
    readonly id: ECID = ECID.Position as const;

    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}