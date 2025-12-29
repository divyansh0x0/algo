import type { Entity } from "../Entity";

export class ECSLayoutGroup {
    private nextMemberIndex = 0;
    private members: Array<Entity> = [];
    
    changed: boolean = false;
    add(entity: Entity) {
        if (this.members.includes(entity))
            return;
        this.members.push(entity);
        this.changed = true;
    }
    remove(entity: Entity) {
        const i = this.members.indexOf(entity);
        if (i === -1) return;
        this.members.splice(i, 1);
        this.changed = true;
    }
    swap(index1: number, index2: number){
        const entity1  = this.members[index1];
        const entity2 = this.members[index2];

        if(!entity1 || !entity2)
            return;

        this.members[index1] = entity2;
        this.members[index2] = entity1;

        this.changed = true;
    }
    get allMembers() {
        return this.members;
    }
}