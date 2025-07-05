import { DFS_Graph_Traversal } from "@/algorithms/algorithms";
import { Scene } from "@/engine/scene";
import { Graph } from "@/graph";
import { Vector } from "@/utils/geometry";

const RADIUS = 20;


// function placeNodesWithForce(graph, scene, radius = RADIUS) {
//     const rect = scene.ctx.canvas.getBoundingClientRect();
//     const nodes_unique = {};
//     for (const node in graph) {
//         nodes_unique[node] = {
//             vel: new Vector(),
//             pos: new Vector(Math.random() * 0.9 * rect.width, Math.random() * 0.9 * rect.height)
//         };
//     }
//     const damp = 0.4;
//     const dt_s = 50 / 1000;
//     const node_data = { mass: 1 };
//     let quadtree;
//     const size = new Size(rect.width, rect.height);
//     const boundary = new AABB(new Vector(rect.width / 2, rect.height / 2), size);
//     for (let i = 0; i < 100; i++) {
//         quadtree = new ForceQuadTree(boundary);
//         for (const id in nodes_unique) {
//             quadtree.insert(nodes_unique[id], node_data);
//         }
//         let force;
//         for (const id in nodes_unique) {
//             const node = nodes_unique[id];
//             force = quadtree.getForceDueToRegions(node.pos, node_data, computeRepulsion);
//
//             for (const neighbour of graph[id]) {
//                 force.add_self(computeAttraction(node.pos, nodes_unique[neighbour].pos));
//             }
//             node.vel.add_self(force.scale_self(dt_s));
//             node.pos.add_self(node.vel.scale_self(dt_s));
//             node.vel.scale_self(damp);
//         }
//     }
//     console.log(nodes_unique, boundary);
//     for (const id in nodes_unique) {
//         const node = nodes_unique[id];
//         scene.handleCommand(SceneCommands.addNode(id, node.pos.x, node.pos.y, RADIUS));
//     }
//
// }

function placeNodesRadially(graph: Graph, scene: Scene, radius: number = RADIUS) {
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

    for (const node of graph.getNodes()) {

        let x = h * Math.cos(curr_angle) - k * Math.sin(curr_angle) + cx;
        let y = h * Math.sin(curr_angle) + k * Math.cos(curr_angle) + cy;
        console.log("ADDED", node, ":", scene.addNode(node, new Vector(x, y), RADIUS));
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

function placeNodesDiagonally(graph: Graph, scene: Scene, radius: number = RADIUS) {
    let x = radius;
    let y = radius;
    let diagonal_count = 0;
    for (const node in graph) {
        console.log(node, x, y);
        // scene.handleCommand(SceneCommands.addNode(node, x, y, radius));
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
    private step_time_ms: number;
    private scene: Scene;
    private algorithm_name: string;
    private algorithm_instance: any;
    private playing: boolean;
    private generator: Generator | null;
    private finished: boolean = false;

    constructor(scene: Scene, algorithm_name: string) {
        this.scene = scene;
        this.step_time_ms = 200;
        this.scene.start();

        this.algorithm_name = algorithm_name;
        // this.algorithm_instance = getAlgorithm(algorithm_name);
        this.generator = null;
        this.playing = true;



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

        // setInterval(() => {
        //     if (!this.generator || !this.playing)
        //         return;
        //
        //
        //     const obj = this.generator.next();
        //     if (obj.done) {
        //         this.finished = true;
        //     }
        //
        //     this.scene.handleCommand(obj.value);
        // }, this.step_time_ms);

    }

    load(graph: Graph) {
        this.scene.clear();


        const nodes_added = new Set<string>();
        console.log("loading", graph);
        const debug_data_panel = document.getElementById("debug-data");
        if (debug_data_panel)
            debug_data_panel.textContent = "";
        else console.error("Debugging panel not found");
        placeNodesRadially(graph, this.scene);
        for (const node of graph.getNodes()) {
            if (debug_data_panel) {
                const el = document.createElement("div");
                el.id = node.toString();
                el.classList.add("node");
                debug_data_panel.append(el);
            }
            for (const neighbour of graph.getNeighbors(node)) {
                console.log(node, "->", neighbour);
                this.scene.addEdge(node, neighbour);
                nodes_added.add(neighbour);
            }
            nodes_added.add(node);
        }

        const generator = DFS_Graph_Traversal(graph, graph.start_node);

        const algo_interval = setInterval(() => {
            const obj = generator.next();
            if (obj.done) {
                clearInterval(algo_interval);
                return;
            }
            obj.value.execute(this.scene);
        }, this.step_time_ms);
        // this.generator = getGenerator(this.algorithm_name, ...args);

        // const code_area = document.getElementById("code-area");
        // if (code_area)
        //     code_area.innerHTML = `<div class="code-block" contenteditable="">${ this.algorithm_instance.toString()
        // }</div>`;

    }

    stop(): void {

    }

    reset() {
    }

    start(): void {

    }
}
