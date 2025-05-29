import {Drawable} from "./drawable.mjs";


export class Edge extends Drawable {
    constructor(ctx, start_node, end_node) {
        super(ctx, Edge.getEdgeKey(start_node.id, end_node.id));
        this.text_color = "#000";
        this.start_node = start_node;
        this.end_node = end_node;
    }

    static getEdgeKey(nodeId1, nodeId2) {
        return [nodeId1, nodeId2].sort().join();
    }

    render() {
        // const color = this.is_highlighted ? "blue" : this.color;
        const from_pos = {x: this.start_node.x, y: this.start_node.y};
        const to_pos = {x: this.end_node.x, y: this.end_node.y};
        this.drawLine(from_pos.x, from_pos.y, to_pos.x, to_pos.y, 10, this.color);
    }

}