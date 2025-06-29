import {
    ErrorCommand, FinishedCommand,
    HighlightEdgeCommand,
    HighlightNodeCommand,
    LabelNodeCommand
} from "@/engine/commands/scenecommands";
import { Scene } from "@/engine/scene";
import { Graph } from "@/graph";

function* DFS_Graph_Traversal(scene: Scene, graph: Graph, start_node: string): Generator {
    const visited = new Set();
    const queue = Object.keys(graph);
    if (!start_node) {
        yield new ErrorCommand("Start node is not defined so using first node");
        start_node = Object.keys(graph)[0];
    }
    yield new HighlightNodeCommand(start_node);
    yield new LabelNodeCommand(start_node, "Visited");

    while (queue.length > 0) {

    }

    return new FinishedCommand();
}

function* BFS_Graph_Traversal(scene: Scene, graph: Graph, start_node: string, visited = new Set()): Generator {
    // if (!start_node) {
    //     yield new ErrorCommand("Start node is not defined so using first node");
    //     start_node = Object.keys(graph)[0];
    // }
    // yield new HighlightNodeCommand(start_node);
    // yield new LabelNodeCommand(start_node, "Visited");
    //
    // if (start_node && !graph.hasOwnProperty(start_node)) {
    //     visited.add(start_node);
    //     return new FinishedCommand();
    // }
    // for (const node of graph[start_node]) {
    //     if (!visited.has(node)) {
    //         visited.add(node);
    //         yield new HighlightEdgeCommand(start_node, node);
    //         yield* BFS_Graph_Traversal(scene,graph, node, visited);
    //     }
    // }
    // return new FinishedCommand();
}


// function getGenerator(
//     name: AlgorithmName,
//     ...args: Parameters<typeof AlgorithmRegistry[typeof name]["run"]>
// ): Generator<SceneCommand, SceneCommand | void, unknown> {
//     const algorithm = AlgorithmRegistry[name];
//     return algorithm.run(...args);
// }
