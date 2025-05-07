export class Visualizer {
    constructor(scene, algorithm) {
        this.scene = scene;
        this.algorithm = algorithm;
    }

    start() {
        this.scene.start();
    }

    stop() {
        this.scene.stop();
    }

    reset() {
        this.algorithmInstance.reset();
    }
}