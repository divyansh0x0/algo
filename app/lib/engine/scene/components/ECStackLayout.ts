import {ECID, type EntityComponent} from "~/lib/engine/scene/components/EntityComponent";
import type {Entity} from "~/lib/engine/scene/Entity";

export enum ECStackLayoutDirection {
    Horizontal, Vertical
}

export class ECStackLayout implements EntityComponent {
    readonly id: ECID = ECID.StackLayout;
    members: Entity[] = [];

    constructor(
        public name: string,
        public direction: ECStackLayoutDirection = ECStackLayoutDirection.Horizontal,
        public spacing: number = 0) {

    }

}