import { Vector } from "@/utils/geometry";

const isPASSIVE = false;
export enum MouseButton {
    Primary = 0,
    Auxiliary = 1,
    Secondary = 2
}

export class Mouse {
    location: Vector = new Vector();
    buttonsPressed: Set<number> = new Set();

    touches: Vector[] = [];
    isTouching = false;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;

        // Mouse events
        window.addEventListener("mousemove", this.onMouseMove as EventListener);
        window.addEventListener("mousedown", this.onMouseDown as EventListener);
        window.addEventListener("mouseup", this.onMouseUp as EventListener);

        // Touch events
        window.addEventListener("touchstart", this.onTouchStart as EventListener, { passive: isPASSIVE });
        window.addEventListener("touchmove", this.onTouchMove as EventListener, { passive: isPASSIVE });
        window.addEventListener("touchend", this.onTouchEnd as EventListener);
        window.addEventListener("touchcancel", this.onTouchEnd as EventListener);
    }

    private onMouseMove = (e: MouseEvent) => {
        const bounding_rect = this.element.getBoundingClientRect();
        this.location = new Vector(e.clientX - bounding_rect.x, e.clientY - bounding_rect.y);
    };

    private onMouseDown = (e: MouseEvent) => {
        if (e.target === this.element)
            this.buttonsPressed.add(e.button);
    };

    private onMouseUp = (e: MouseEvent) => {
        this.buttonsPressed.delete(e.button);
    };

    private onTouchStart = (e: TouchEvent) => {
        if (e.target !== this.element)
            return;
        const bounding_rect = this.element.getBoundingClientRect();
        this.isTouching = true;
        this.touches = Array.from(e.touches).map(t => (new Vector(t.clientX - bounding_rect.x, t.clientY - bounding_rect.y)));
        this.location = this.touches[0]; // First touch is treated as main
    };

    private onTouchMove = (e: TouchEvent) => {
        const bounding_rect = this.element.getBoundingClientRect();
        this.touches = Array.from(e.touches).map(t => (new Vector(t.clientX - bounding_rect.x, t.clientY - bounding_rect.y)));
        this.location = this.touches[0];
    };

    private onTouchEnd = (e: TouchEvent) => {
        const bounding_rect = this.element.getBoundingClientRect();
        this.touches = Array.from(e.touches).map(t => (new Vector(t.clientX - bounding_rect.x, t.clientY - bounding_rect.y)));
        this.isTouching = this.touches.length > 0;
        if (this.touches.length > 0) this.location = this.touches[0];
    };

    isButtonDown(button: MouseButton): boolean {
        return this.buttonsPressed.has(button);
    }

    dispose() {
        // Cleanup all listeners
        window.removeEventListener("mousemove", this.onMouseMove as EventListener);
        window.removeEventListener("mousedown", this.onMouseDown as EventListener);
        window.removeEventListener("mouseup", this.onMouseUp as EventListener);
        window.removeEventListener("touchstart", this.onTouchStart as EventListener);
        window.removeEventListener("touchmove", this.onTouchMove as EventListener);
        window.removeEventListener("touchend", this.onTouchEnd as EventListener);
        window.removeEventListener("touchcancel", this.onTouchEnd as EventListener);
    }
}
