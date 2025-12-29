import type {Scene} from "~/lib/core/engine/scene/Scene";

export class Engine {
    private frame_id: number | null = null
    private scene: Scene | null = null;
    private is_running: boolean = false;

    constructor() {

    }

    attachScene(scene: Scene): void {
        this.scene = scene;
    }

    detachScene(scene: Scene): void {
        this.scene = scene;
    }

    start() {
        if (this.is_running || !this.scene) {
            return;
        }
        this.is_running = true;

        this.loop(performance.now(), performance.now());
    }

    stop() {
        this.is_running = false;
        if (this.frame_id !== null) {
            cancelAnimationFrame(this.frame_id);
            this.frame_id = null;
        }
    }

    private loop(t1: number, t2: number) {
        if (!this.is_running || !this.scene) {
            return;
        }

        this.scene.update(t2 - t1);
        this.frame_id = requestAnimationFrame((t) => this.loop(t2, t));
    }

}