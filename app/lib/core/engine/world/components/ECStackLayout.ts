import type {  EntityComponent } from "./EntityComponent";
import type { Entity } from "../Entity";
import { ECLayoutGroup } from "./ECLayoutGroup";

export enum ECStackLayoutDirection {
    Horizontal, Vertical
}

export class ECStackLayout implements EntityComponent {

    private group: ECLayoutGroup = new ECLayoutGroup();

    constructor(
        public name: string,
        public direction: ECStackLayoutDirection = ECStackLayoutDirection.Horizontal,
        public spacing: number = 0) {

    }

    get isDirty() {
        return this.group.changed;
    }

    set isDirty(b: boolean) {
        this.group.changed = b;
    }

    getMembers() {
        return this.group.allMembers;
    }

    add(elEntity: Entity) {
        this.group.add(elEntity);
    }

    swap(i1: number, i2: number) {
        this.group.swap(i1, i2);
    }
}