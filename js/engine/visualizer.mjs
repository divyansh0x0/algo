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
        this.step_time_ms = 1000;
        this.scene.start();

        this.algorithm_instance = getAlgorithm(algorithm_name);
    }
    start(...args) {
        const default_graph = args[0];
        let x = this.scene.ctx.canvas.width / 2; // Initial X (consider better layout)
        let y_start = 30; // Initial Y
        const radius = 20;
        const node_spacing_y = radius * 2 + 20; // Increased spacing
        const node_spacing_x = radius * 2 + 50; // Spacing for X if you try a grid
        let current_x = x;
        let current_y = y_start;
        let nodes_in_row = 0;
        const max_nodes_per_row = 5; // Example: for a simple grid layout

        const node_positions = new Map(); // To store calculated positions
        const all_node_ids = new Set();

        // 1. Collect all unique node IDs
        for (const node_id in default_graph) {
            all_node_ids.add(node_id);
            const neighbours = default_graph[node_id];
            for (const neighbour_id of neighbours) {
                all_node_ids.add(neighbour_id);
            }
        }

        console.log("All unique node IDs: ", all_node_ids);

        // 2. Add all unique nodes with calculated positions
        let node_count = 0;
        for (const node_id of all_node_ids) {
            // Simple Grid Layout Example (replace with a better algorithm if needed)
            current_x = (this.scene.ctx.canvas.width / (Math.min(all_node_ids.size, max_nodes_per_row) + 1)) * ((node_count % max_nodes_per_row) + 1);
            current_y = y_start + Math.floor(node_count / max_nodes_per_row) * node_spacing_y;

            // Fallback to simpler vertical layout if you prefer to debug one thing at a time:
            // current_x = x;
            // current_y = y_start + node_count * node_spacing_y;


            node_positions.set(node_id, { x: current_x, y: current_y });
            this.scene.handleCommand(SceneCommands.addNode(node_id, { x: current_x, y: current_y }, radius));
            console.log("Adding Node: ", node_id, "at", { x: current_x, y: current_y });
            node_count++;
        }
        // 3. Add edges (your existing logic for this is likely fine if all nodes exist)
        for (const from_node in default_graph) {
            const neighbours = default_graph[from_node];
            if (neighbours) { // Ensure neighbours array exists
                for (const to_node of neighbours) {
                    // Check if both nodes were actually added, though the previous step should ensure this.
                    if (all_node_ids.has(from_node) && all_node_ids.has(to_node)) {
                        this.scene.handleCommand(SceneCommands.addEdge(from_node, to_node));
                        console.log("Adding Edge: from", from_node, "to", to_node);
                    } else {
                        console.warn("Skipping edge due to missing node:", from_node, "or", to_node);
                    }
                }
            }
        }

        // for (const command of this.algorithm_instance(default_graph, "A")){ 
        //     this.scene.handleCommand(command);
        // }
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