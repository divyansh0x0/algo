import {ECID, type EntityComponent} from "~/lib/core/engine/scene/components/EntityComponent";
import type {Entity} from "~/lib/core/engine/scene/Entity";
import { ECSLayoutGroup } from "./ECSLayoutGroup";

export enum ECStackLayoutDirection {
    Horizontal, Vertical
}

export class ECStackLayout implements EntityComponent {

    readonly id: ECID = ECID.StackLayout;
    private group: ECSLayoutGroup = new ECSLayoutGroup();
    constructor(
        public name: string,
        public direction: ECStackLayoutDirection = ECStackLayoutDirection.Horizontal,
        public spacing: number = 0) {

    }
    getMembers(){
        return this.group.allMembers;
    }
    get isDirty(){
        return this.group.changed;
    }    
    add(elEntity: Entity) {
        this.group.add(elEntity);
    }
    swap(i1:number,i2:number){
        this.group.swap(i1,i2);
    }
    set isDirty(b:boolean){
        this.group.changed = b;
    }
}