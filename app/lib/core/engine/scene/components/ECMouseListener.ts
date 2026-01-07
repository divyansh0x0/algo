import { ECID, type EntityComponent } from "~/lib/core/engine/scene/components/EntityComponent";
import { Vector2D } from "~/lib/core/engine/utils/Vector2D";

export class ECMouseListener implements EntityComponent {
    readonly id: ECID = ECID.MouseListener as const;
    clicked: boolean = false;
    hovered: boolean = false;
    mousePosition: Vector2D = new Vector2D(0, 0);
    mouseDown: boolean = false;
}