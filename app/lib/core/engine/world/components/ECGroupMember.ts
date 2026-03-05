import type {  EntityComponent } from "./EntityComponent";

export class ECGroupMember implements EntityComponent {
    constructor(public index: number) {
    }
}