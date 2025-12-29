import {Vector2D} from "~/lib/core/engine/utils/Vector2D";
import {ECID, type EntityComponent} from "~/lib/core/engine/scene/components/EntityComponent";

export class ECVelocity extends Vector2D implements EntityComponent {
    readonly id: ECID = ECID.Velocity as const;

    constructor(x: number, y: number) {
        super(x, y);
    }
}