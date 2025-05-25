const default_config = {
    "DFS Graph Traversal": {
        nodes: {
            "A": { x: 0.3, y: 0.3, radius: 20 },
            "B": { x: 0.1, y: 0.5, radius: 20 },
            "C": { x: 0.4, y: 0.7, radius: 20 },
            "D": { x: 0.6, y: 0.8, radius: 20 },
        },
        edges: [
            {from: "A", end: "B"},
            {from: "A", end: "C"},
            {from: "B", end: "D"},
        ]
    }
}

export default default_config;