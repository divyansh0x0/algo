import type {  EntityComponent } from "./EntityComponent";

export enum ECDrawableStyle {
    Fill,
    Stroke,
}

export class ECCircle implements EntityComponent {
    constructor(public radius: number, public drawStyle: ECDrawableStyle = ECDrawableStyle.Fill) {
    }
}

export class ECRectangle implements EntityComponent {
    

    constructor(public width: number, public height: number, public drawStyle: ECDrawableStyle = ECDrawableStyle.Fill) {

    }
}

export class ECLine implements EntityComponent {
    
}