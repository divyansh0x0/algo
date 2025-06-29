export class Graph {
    private adjacency_mapping: Map<string, Set<string>> = new Map();

    constructor(public start_node: string, private bidirectional: boolean = true) {
        this.addNode(start_node);
    }

    addNode(node: string): this {
        if (!this.adjacency_mapping.has(node))
            this.adjacency_mapping.set(node, new Set());
        return this;
    }

    attach(parent_node: string, toList: string[]) {
        this.addNode(parent_node);
        let neighbours_set = this.adjacency_mapping.get(parent_node);
        for (const to of toList) {
            this.addNode(to);

            neighbours_set?.add(to);

            if (this.bidirectional)
                this.adjacency_mapping.get(to)?.add(parent_node);

        }
        return this;
    }

    getNeighbors(node: string): string[] {
        return Array.from(this.adjacency_mapping.get(node) ?? []);
    }

    getNodes(): string[] {
        return Array.from(this.adjacency_mapping.keys());
    }

    toString(): string {
        let str = "";
        for (const [ node, neighbors ] of this.adjacency_mapping.entries()) {
            str += `${ node } → ${ [ ...neighbors ].join(", ") }`;
        }
        return str;
    }

}


export const simple_graph =
    new Graph("A")
    .attach("A", [ "B", "C", "D" ])
    .attach("B", [ "E", "F" ]);
export const clustered_graph =
    new Graph("Cluster1")
    .attach("Cluster1", [ "C1A", "C1B", "C1C" ])
    .attach("C1A", [ "C1B", "C1C" ])
    .attach("C1B", [ "C1C" ])
    .attach("Cluster2", [ "C2A", "C2B", "C2C" ])
    .attach("C2A", [ "C2B", "C2C" ])
    .attach("C2B", [ "C2C" ])
    .attach("Cluster3", [ "C3A", "C3B", "C3C" ])
    .attach("C3A", [ "C3B", "C3C" ])
    .attach("C3B", [ "C3C" ])
    .attach("Cluster1", [ "Cluster2" ])
    .attach("Cluster2", [ "Cluster3" ]);
export const spider_web_graph =
    new Graph("Center")
    .attach("Center", [ "N1", "N2", "N3", "N4", "N5", "N6" ])
    .attach("N1", [ "N2", "N6" ])
    .attach("N2", [ "N1", "N3" ])
    .attach("N3", [ "N2", "N4" ])
    .attach("N4", [ "N3", "N5" ])
    .attach("N5", [ "N4", "N6" ])
    .attach("N6", [ "N5", "N1" ]);

export const large_graph =
    new Graph("C1N1")
    // Cluster 1
    .attach("C1N1", [ "C1N2", "C1N3", "C1N4" ])
    .attach("C1N2", [ "C1N5", "C1N6" ])
    .attach("C1N3", [ "C1N7", "C1N8" ])
    .attach("C1N4", [ "C1N9", "C1N10" ])
    // Cluster 2
    .attach("C2N1", [ "C2N2", "C2N3", "C2N4" ])
    .attach("C2N2", [ "C2N5", "C2N6" ])
    .attach("C2N3", [ "C2N7", "C2N8" ])
    .attach("C2N4", [ "C2N9", "C2N10" ])
    // Cluster 3
    .attach("C3N1", [ "C3N2", "C3N3", "C3N4" ])
    .attach("C3N2", [ "C3N5", "C3N6" ])
    .attach("C3N3", [ "C3N7", "C3N8" ])
    .attach("C3N4", [ "C3N9", "C3N10" ])
    // Cluster 4
    .attach("C4N1", [ "C4N2", "C4N3", "C4N4" ])
    .attach("C4N2", [ "C4N5", "C4N6" ])
    .attach("C4N3", [ "C4N7", "C4N8" ])
    .attach("C4N4", [ "C4N9", "C4N10" ])
    // Cluster 5
    .attach("C5N1", [ "C5N2", "C5N3", "C5N4" ])
    .attach("C5N2", [ "C5N5", "C5N6" ])
    .attach("C5N3", [ "C5N7", "C5N8" ])
    .attach("C5N4", [ "C5N9", "C5N10" ])
    // Cluster 6
    .attach("C6N1", [ "C6N2", "C6N3", "C6N4" ])
    .attach("C6N2", [ "C6N5", "C6N6" ])
    .attach("C6N3", [ "C6N7", "C6N8" ])
    .attach("C6N4", [ "C6N9", "C6N10" ])
    // Cluster 7
    .attach("C7N1", [ "C7N2", "C7N3", "C7N4" ])
    .attach("C7N2", [ "C7N5", "C7N6" ])
    .attach("C7N3", [ "C7N7", "C7N8" ])
    .attach("C7N4", [ "C7N9", "C7N10" ])
    // Cluster 8
    .attach("C8N1", [ "C8N2", "C8N3", "C8N4" ])
    .attach("C8N2", [ "C8N5", "C8N6" ])
    .attach("C8N3", [ "C8N7", "C8N8" ])
    .attach("C8N4", [ "C8N9", "C8N10" ])
    // Cluster 9
    .attach("C9N1", [ "C9N2", "C9N3", "C9N4" ])
    .attach("C9N2", [ "C9N5", "C9N6" ])
    .attach("C9N3", [ "C9N7", "C9N8" ])
    .attach("C9N4", [ "C9N9", "C9N10" ])
    // Cluster 10
    .attach("C10N1", [ "C10N2", "C10N3", "C10N4" ])
    .attach("C10N2", [ "C10N5", "C10N6" ])
    .attach("C10N3", [ "C10N7", "C10N8" ])
    .attach("C10N4", [ "C10N9", "C10N10" ])
    // Inter-cluster connections
    .attach("C1N1", [ "C2N1" ])
    .attach("C2N1", [ "C3N1" ])
    .attach("C3N1", [ "C4N1" ])
    .attach("C4N1", [ "C5N1" ])
    .attach("C5N1", [ "C6N1" ])
    .attach("C6N1", [ "C7N1" ])
    .attach("C7N1", [ "C8N1" ])
    .attach("C8N1", [ "C9N1" ])
    .attach("C9N1", [ "C10N1" ]);
