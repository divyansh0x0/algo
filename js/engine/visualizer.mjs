import {getAlgorithm} from "../algorithms/Algorithms.mjs";
import {SceneCommands} from "./commands.mjs";
import {AABB, ForceQuadTree} from "../utils/QuadTree.mjs";
import {Size, Vector} from "../utils/Geometry.mjs";
import {computeAttraction, computeRepulsion} from "./scene.mjs";
import {detectKeywords} from "../editor/editor.mjs";

const RADIUS = 10;

function labelPropagation(graph, max_iter = 100) {
    const labels = {};
    const nodes = Object.keys(graph);
    // Store name of each node as its label
    nodes.forEach(node => labels[node] = node);

    let labels_changed = false;
    for (let i = 0; i < max_iter; i++) {
        labels_changed = false;

        // Shuffle the nodes to avoid bias
        nodes.sort(() => Math.sort() - 0.5);


    }


}

function getGenerator(algorithm_name, ...args) {
    switch (algorithm_name) {
        case "DFS":
        case "DFS Graph Traversal":
            return getAlgorithm(algorithm_name)(...args);
        default:
            throw new Error(`Algorithm ${algorithm_name} not found`);
    }
}

function placeNodesWithForce(graph, scene, radius = RADIUS) {
    const rect = scene.ctx.canvas.getBoundingClientRect();
    const nodes_unique = {};
    for (const node in graph) {
        nodes_unique[node] = {
            vel: new Vector(),
            pos: new Vector(Math.random() * 0.9 * rect.width, Math.random() * 0.9 * rect.height)
        };
    }
    const damp = 0.4;
    const dt_s = 50 / 1000;
    const node_data = {mass: 1};
    let quadtree;
    const size = new Size(rect.width, rect.height);
    const boundary = new AABB(new Vector(rect.width / 2, rect.height / 2), size);
    for (let i = 0; i < 100; i++) {
        quadtree = new ForceQuadTree(boundary);
        for (const id in nodes_unique) {
            quadtree.insert(nodes_unique[id], node_data);
        }
        let force;
        for (const id in nodes_unique) {
            const node = nodes_unique[id];
            force = quadtree.getForceDueToRegions(node.pos, node_data, computeRepulsion);

            for (const neighbour of graph[id]) {
                force.add_self(computeAttraction(node.pos, nodes_unique[neighbour].pos));
            }
            node.vel.add_self(force.scale_self(dt_s));
            node.pos.add_self(node.vel.scale_self(dt_s));
            node.vel.scale_self(damp);
        }
    }
    console.log(nodes_unique, boundary);
    for (const id in nodes_unique) {
        const node = nodes_unique[id];
        scene.handleCommand(SceneCommands.addNode(id, node.pos.x, node.pos.y, RADIUS));
    }

}

function placeNodesInGrid(graph, scene, radius = RADIUS) {

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
            x = 0;
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
        this.scene.handleCommand(SceneCommands.clear());
        console.log("loading", args);
        const parent = document.getElementById("debug-data");
        parent.textContent = "";
        const default_graph = args[0];
        placeNodesRadially(default_graph, this.scene);

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

        const code_area = document.getElementById("code-area");
        code_area.innerHTML = `<div class="code-block" >${detectKeywords(this.algorithm_instance.toString())}</div>`;


    }

    stop() {

    }

    reset() {
    }
}