import { Drawable } from "@/engine/components/drawable";
import { Node } from "@/engine/components/node";
import { Scene } from "@/engine/scene";


export class Edge extends Drawable {
    static thickness = 3;
    readonly start_node: Node;
    readonly end_node: Node;

    constructor(scene: Scene, start_node: Node, end_node: Node) {
        super(scene, Edge.getEdgeKey(start_node.id, end_node.id), "edge");
        this.start_node = start_node;
        this.end_node = end_node;
    }

    static getEdgeKey(nodeId1: string, nodeId2: string) {
        return [ nodeId1, nodeId2 ].sort().join();
    }

    render() {
        // const color = this.is_highlighted ? "blue" : this.color;

        this.drawLine(this.start_node.pos.x, this.start_node.pos.y, this.end_node.pos.x, this.end_node.pos.y, Edge.thickness, this.color.hex);
    }

}
