import {getAlgorithm} from "../algorithms/Algorithms.mjs";
import {SceneCommands} from "./commands.mjs";

function getGenerator(algorithm_name, ...args) {
    switch (algorithm_name) {
        case "DFS":
        case "DFS Graph Traversal":
            return getAlgorithm(algorithm_name)(...args);
        default:
            throw new Error(`Algorithm ${algorithm_name} not found`);
    }
}

function placeNodesRadially(graph, scene, radius = 20) {
    let cx = scene.ctx.canvas.width / 2;
    let cy = scene.ctx.canvas.height / 2;
    let h = 0;
    let k = 0;
    let row_num = 0;
    let max_circles_in_curr_row = 1;
    let circles_in_row = 0;
    let angle_increment = 0;
    let curr_angle = 0;

    for (const node in graph) {

        const x = h * Math.cos(curr_angle) - k * Math.sin(curr_angle) + cx;
        const y = h * Math.sin(curr_angle) + k * Math.cos(curr_angle) + cy;
        scene.handleCommand(SceneCommands.addNode(node, x, y, radius));
        circles_in_row++;
        curr_angle += angle_increment;
        if (circles_in_row === max_circles_in_curr_row) {
            row_num++;
            h = 2 * radius * row_num;
            // k = 2*radius*row_num
            curr_angle = 0;
            circles_in_row = 0;
            angle_increment = Math.acos(1 - 1 / (2 * row_num * row_num));
            max_circles_in_curr_row = Math.round(2 * Math.PI / angle_increment);
        }


    }
}

function placeDiagonally(graph, scene, radius = 20) {
    let x = radius;
    let y = radius;
    let diagonal_count = 0;
    for (const node in graph) {
        console.log(node, x, y);
        scene.handleCommand(SceneCommands.addNode(node, x, y, radius));
        y += radius * 2 + 10;
        x += radius * 2 + 10;
        if (y > scene.ctx.canvas.height || x > scene.ctx.canvas.width) {
            diagonal_count += 1;
            y = diagonal_count * radius * 3 + 10;
            x = 0;
        }
    }

}
export class Visualizer {
    constructor(scene, algorithm_name) {
        this.scene = scene;
        this.step_time_ms = 200;
        this.scene.start();

        this.algorithm_instance = getAlgorithm(algorithm_name);
    }
    start(...args) {
        const parent = document.getElementById("node-data");

        const default_graph = args[0];
        placeDiagonally(default_graph, this.scene);

        for (const node in default_graph) {
            const el = document.createElement("div");
            el.id = node;
            el.classList.add("node");
            parent.append(el);
            for (const neighbour of default_graph[node]) {
                this.scene.handleCommand(SceneCommands.addEdge(node, neighbour));
            }
        }
        const generator = this.algorithm_instance(...args);

        const interval = setInterval(() => {
            const obj = generator.next();
            if (obj.done) {
                clearInterval(interval);
                return;
            }
            this.scene.handleCommand(obj.value);

        }, this.step_time_ms);
    }

    stop() {

    }

    reset() {
        this.algorithmInstance.reset();
    }
}