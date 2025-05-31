import {getAlgorithm} from "../algorithms/Algorithms.mjs";
import {SceneCommands} from "./commands.mjs";

const RADIUS = 10;
function getGenerator(algorithm_name, ...args) {
    switch (algorithm_name) {
        case "DFS":
        case "DFS Graph Traversal":
            return getAlgorithm(algorithm_name)(...args);
        default:
            throw new Error(`Algorithm ${algorithm_name} not found`);
    }
}

function placeNodesRadially(graph, scene, radius = RADIUS) {
    const rect = scene.ctx.canvas.getBoundingClientRect();
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    let h = 0;
    let k = 0;
    let row_num = 0;
    let max_circles_in_curr_row = 1;
    let circles_in_row = 0;
    let angle_increment = 0;
    let curr_angle = 0;

    for (const node in graph) {

        let x = h * Math.cos(curr_angle) - k * Math.sin(curr_angle) + cx;
        let y = h * Math.sin(curr_angle) + k * Math.cos(curr_angle) + cy;
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

function placeNodesDiagonally(graph, scene, radius = RADIUS) {
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
            x =0;
        }
        x += Math.random() * 10;
        y += Math.random() * 10;

    }

}
export class Visualizer {
    constructor(scene, algorithm_name) {
        this.scene = scene;
        this.step_time_ms = 200;
        this.scene.start();

        this.algorithm_instance = getAlgorithm(algorithm_name);
        this.generator = null;
        this.playing = false;
        const btn = document.getElementById("start-btn");
        btn.addEventListener("click", () => {
            this.playing = !this.playing;
            btn.innerText = this.playing ? "Pause" : "Play";
        });
        // const interval = setInterval(() => {
        //     if(!is_ready ||)
        //         const obj = this.generator.next();
        //     if (obj.done) {
        //         clearInterval(interval);
        //         return;
        //     }
        //     this.scene.handleCommand(obj.value);
        //
        // }, this.step_time_ms);

        setInterval(() => {
            if (!this.generator || !this.playing)
                return;


            const obj = this.generator.next();
            if (obj.done) {
                this.finished = true;
            }

            this.scene.handleCommand(obj.value);
        }, this.step_time_ms);

    }

    load(...args) {
        const parent = document.getElementById("node-data");

        const default_graph = args[0];
        placeNodesDiagonally(default_graph, this.scene);

        for (const node in default_graph) {
            const el = document.createElement("div");
            el.id = node.toString();
            el.classList.add("node");
            parent.append(el);
            for (const neighbour of default_graph[node]) {
                this.scene.handleCommand(SceneCommands.addEdge(node, neighbour));
            }
        }
        this.generator = this.algorithm_instance(...args);
    }

    stop() {

    }

    reset() {
    }
}