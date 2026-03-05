import type { Color } from "../../utils/Color";
import type {  EntityComponent } from "./EntityComponent";


export class ECBackgroundColor implements EntityComponent {
   

    constructor(public value: Color) {
    }
}

export class ECTextColor implements EntityComponent {
   

    constructor(public value: Color) {
    }
}

export class ECBorderColor implements EntityComponent {
   

    constructor(public value: Color) {
    }
}