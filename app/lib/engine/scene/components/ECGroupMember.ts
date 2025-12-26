import {ECID, type EntityComponent} from "~/lib/engine/scene/components/EntityComponent";

export class ECGroupMember implements EntityComponent {
    readonly id: ECID = ECID.GroupMember

    constructor(public index: number) {
    }
}