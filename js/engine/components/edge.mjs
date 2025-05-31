import {Drawable} from "./drawable.mjs";


export class Edge extends Drawable {
    static thickness = 2;
    constructor(ctx, start_node, end_node) {
        super(ctx, Edge.getEdgeKey(start_node.id, end_node.id));
        this.start_node = start_node;
        this.end_node = end_node;
    }

    static getEdgeKey(nodeId1, nodeId2) {
        return [nodeId1, nodeId2].sort().join();
    }

    render() {
        // const color = this.is_highlighted ? "blue" : this.color;
        this.drawLine(this.start_node.position.x, this.start_node.position.y, this.end_node.position.x, this.end_node.position.y, Edge.thickness, this.color);
    }

}