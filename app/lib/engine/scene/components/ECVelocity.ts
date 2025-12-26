import {Vector2D} from "~/lib/engine/utils/Vector2D";
import {ECID, type EntityComponent} from "~/lib/engine/scene/components/EntityComponent";

export class ECVelocity extends Vector2D implements EntityComponent {
    readonly id: ECID = ECID.Velocity as const;

    constructor(x: number, y: number) {
        super(x, y);
    }
}