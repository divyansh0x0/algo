import type { World } from "~/lib/core/engine/scene/World";

export class Engine {
    private frame_id: number | null = null;
    private world: World | null = null;
    private is_running: boolean = false;

    attachScene(scene: World): void {
        this.world = scene;
    }

    detachScene(scene: World): void {
        this.world = scene;
    }

    start() {
        if (this.is_running || !this.world) {
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
        if (!this.is_running || !this.world) {
            return;
        }

        this.world.update(t2 - t1);
        this.frame_id = requestAnimationFrame((t) => this.loop(t2, t));
    }

}