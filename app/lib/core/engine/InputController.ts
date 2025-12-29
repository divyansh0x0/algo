import type {World} from "~/lib/core/engine/scene/World";

enum PointerType {
    Mouse, Touch
}

interface Pointer {
    id: number,
    x: number,
    y: number,
    type: PointerType
}

class InputController {
    constructor(private scene: World) {
    }

    attach(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousedown", this.onMouseDown)
        canvas.addEventListener("wheel", this.onWheel, {passive: false})
        canvas.addEventListener("touchstart", this.onTouchStart, {passive: false})
    }

    detach(canvas: HTMLCanvasElement) {
        canvas.removeEventListener("mousedown", this.onMouseDown)
        canvas.removeEventListener("wheel", this.onWheel)
        canvas.removeEventListener("touchstart", this.onTouchStart)
    }

    private onMouseDown = (e: MouseEvent) => {

    }

    private onWheel = (e: WheelEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            this.scene.zoomAt(e.clientX, e.clientY, e.deltaY < 0)
        }
    }

    private onTouchStart = (e: TouchEvent) => {
        // translate touch → pointer events
    }

    private handleMouseMove(e: TouchEvent) {

    }
}
