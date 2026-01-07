import { ECID, type EntityComponent } from "~/lib/core/engine/scene/components/EntityComponent";

export enum ECDrawableStyle {
    Fill,
    Stroke,
}

export class ECCircle implements EntityComponent {
    readonly id: ECID = ECID.Drawable as const;

    constructor(public radius: number, public drawStyle: ECDrawableStyle = ECDrawableStyle.Fill) {
    }
}

export class ECRectangle implements EntityComponent {
    readonly id: ECID = ECID.Drawable as const;

    constructor(public width: number, public height: number, public drawStyle: ECDrawableStyle = ECDrawableStyle.Fill) {

    }
}

export class ECLine implements EntityComponent {
    readonly id: ECID = ECID.Drawable as const;
}