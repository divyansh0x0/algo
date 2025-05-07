import { getAlgorithm } from "../algorithms/Algorithms.mjs";
import { SceneCommands } from "./commands.mjs";

function getGenerator(algorithm_name, ...args) {
    switch (algorithm_name) {
        case "DFS":
        case "DFS Graph Traversal":
            return getAlgorithm(algorithm_name)(...args);
        default:
            throw new Error(`Algorithm ${algorithm_name} not found`);
    }
}
export class Visualizer {
    constructor(scene, algorithm_name) {
        this.scene = scene;
        this.step_time_ms = 300;
        this.scene.start();

        console.log(this.algorithm_instance);
        
        this.algorithm_instance = getAlgorithm(algorithm_name);
    }
    start() {
        const default_graph = {
            "A": ["B", "C"],
            "B": ["D", "E"],
            "C": ["F"],
        };

        for (const id in default_graph) {
            this.scene.handleCommand(SceneCommands.addNode(id, 100 + Math.random() * 200, 100 + Math.random() * 200, 10));
        }
        for(const command of this.algorithm_instance(default_graph, "A")){
            this.scene.handleCommand(command);
        }
    }

    stop() {
    }

    reset() {
        this.algorithmInstance.reset();
    }
}