function* DFS_Graph_Traversal(Graph,){

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

