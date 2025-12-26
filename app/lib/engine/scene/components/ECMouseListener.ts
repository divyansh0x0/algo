import {Vector2D} from "~/lib/engine/utils/Vector2D";
import {ECID, type EntityComponent} from "~/lib/engine/scene/components/EntityComponent";

export class ECMouseListener implements EntityComponent {
    readonly id: ECID = ECID.MouseListener as const;
    clicked: boolean = false;
    hovered: boolean = false;
    mousePosition: Vector2D = new Vector2D(0, 0);
    mouseDown: boolean = false;
}