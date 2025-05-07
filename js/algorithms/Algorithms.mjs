/**
 * Graph = {
 *     "A": ["B", "C"],
 *     "B": ["D", "E"],
 *    "C": ["F"],
 * }
 */

import { SceneCommands } from "../engine/commands.mjs";


function* DFS_Graph_Traversal(graph, start_node){
    var visited = new Set();

    if (!graph.hasOwnProperty(start_node)){
        visited.add(start_node);
        yield SceneCommands.highlightNode(start_node);
        yield SceneCommands.labelNode(start_node, "Visited");
        return SceneCommands.noop();
    }
    for (const node of graph[start_node]){
        if (!visited.has(node)){
            visited.add(node);
            yield SceneCommands.highlightNode(node);
            yield SceneCommands.labelNode(node, "Visited");
            yield* DFS_Graph_Traversal(graph, node);
        }
    }
    return visited;
}

export function getAlgorithm(name){
    switch(name){
        case "DFS":
        case "DFS Graph Traversal":
            return DFS_Graph_Traversal;
        default:
            throw new Error(`Algorithm ${name} not found`);
    }
}

