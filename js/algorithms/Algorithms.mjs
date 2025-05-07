/**
 * Graph = {
 *     "A": ["B", "C"],
 *     "B": ["D", "E"],
 *    "C": ["F"],
 * }
 */

import { SceneCommands } from "../engine/commands.mjs";


function* DFS_Graph_Traversal(graph, start_node, visited=new Set()){
    if (!start_node)
        return SceneCommands.error("Start node is not defined");
    yield SceneCommands.highlightNode(start_node);
    yield SceneCommands.labelNode(start_node, "Visited");
   
    if (!graph.hasOwnProperty(start_node) && start_node){
        visited.add(start_node);
        return SceneCommands.finished();
    }
    for (const node of graph[start_node]){
        if (!visited.has(node)){
            visited.add(node);
            yield* DFS_Graph_Traversal(graph, node, visited);
        }
    }
    return SceneCommands.finished();
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

