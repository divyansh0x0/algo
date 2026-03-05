import type {  EntityComponent } from "./EntityComponent";

export class ECDraggable implements EntityComponent {
    isDragging: boolean = false;
    offsetX: number = 0;
    offsetY: number = 0;
   
}