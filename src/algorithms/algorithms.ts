import {
    FinishedCommand,
    HighlightEdgeCommand,
    HighlightNodeCommand,
    SceneCommand
} from "@/engine/commands/scenecommands";
import { Scene } from "@/engine/scene";
import { Graph } from "@/graph";

export function* DFS_Graph_Traversal(graph: Graph, start_node: string): Generator<SceneCommand> {
    const visited: string[] = [];

    //stores tuples (parent_node, curr_node)
    const stack: [ string | null, string | null ][] = [ [ null, start_node ] ];

    while (stack.length > 0) {
        const last_el = stack.pop()!;
        const parent = last_el[0]!;
        const curr = last_el[1]!;
        if (!visited.includes(curr)) {
            console.log(last_el);
            yield new HighlightEdgeCommand(parent, curr);
            yield new HighlightNodeCommand(curr);


            visited.push(curr);

            for (const neigbour of graph.getNeighbors(curr)) {
                if (!visited.includes(neigbour)) {
                    stack.push([ curr, neigbour ]);
                }
            }
        }
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
