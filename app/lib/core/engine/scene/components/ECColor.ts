import type { Color } from "../../utils/Color";
import { ECID, type EntityComponent } from "./EntityComponent";


export class ECBackgroundColor implements EntityComponent {
    id: ECID = ECID.Color as const;

    constructor(public value: Color) {
    }
}

export class ECTextColor implements EntityComponent {
    id: ECID = ECID.Color as const;

    constructor(public value: Color) {
    }
}

export class ECBorderColor implements EntityComponent {
    id: ECID = ECID.Color as const;

    constructor(public value: Color) {
    }
}