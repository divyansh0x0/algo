import type {ECRectangle} from "./ECDrawable";
import {ECID, type EntityComponent} from "./EntityComponent";
import {Vector2D} from "~/lib/engine/utils";
import type {ECPosition} from "~/lib/engine/scene/components/ECPosition";

export class ECAxisAlignedBoundingBox implements EntityComponent {
    id: ECID = ECID.AABB;

    /**
     * @param halfWidth
     * @param halfHeight
     * @param relX Shifts AABB in x direction from the center of entity
     * @param relY Shifts AABB in y direction from the center of entity
     */
    constructor(public halfWidth: number, public halfHeight: number, public relX: number = 0, public relY: number = 0) {
    };

    static fromRectangle(width: number, height: number, relX: number = 0, relY: number = 0) {
        return new ECAxisAlignedBoundingBox(width / 2, height / 2, relX, relY)
    }

    static fromECRectangle(rect: ECRectangle, relX: number = 0, relY: number = 0) {
        return new ECAxisAlignedBoundingBox(rect.width / 2, rect.height / 2, relX, relY)
    }

    static containsPoint(pos: ECPosition, rect: ECAxisAlignedBoundingBox, point: Vector2D) {
        return point.x < pos.x + rect.halfWidth + rect.relX &&
            point.x > pos.x - rect.halfWidth + rect.relX &&
            point.y < pos.y + rect.halfHeight + rect.relY &&
            point.y > pos.y - rect.halfHeight + rect.relY;
    }
}