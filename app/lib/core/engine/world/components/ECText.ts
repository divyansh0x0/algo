import type {  EntityComponent } from "./EntityComponent";

export class ECText implements EntityComponent {

    

    constructor(
        public text: string,
        public fontSize: number = 20,
        public fontFamily: string = "serif",
        public relX = 0,
        public relY = 0) {
    }
}