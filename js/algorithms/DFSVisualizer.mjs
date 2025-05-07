import {AlgorithmVisualizer} from '/js/algorithms/AlgorithmVisualizer.mjs';
import MouseInfo from '/js/utils/MouseInfo.mjs';


export class DFSVisualizer extends AlgorithmVisualizer {
    constructor(default_config, ctx) {
        super(default_config, ctx);
        /**
         * node = {x: 0, y: 0, radius: 0}
         * edge = {from: "node_name", to: "node_name"}
         */
        this.nodes = {};
        for (const id in this.default_config.nodes){
            const node_data = this.default_config.nodes[id];
            const abs_pos = this.toPixelPosition(node_data.x, node_data.y);
            this.nodes[id] = new Node(id, abs_pos.x, abs_pos.y, node_data.radius);
        }
        this.edges = this.default_config.edges;
        this.drag_info = {node: null, mouse_diff: null};
    }
    update(dt_ms) {
        
        // Drag implementation
        for (const id in this.nodes){
            const node = this.nodes[id]

            if (!this.drag_info.node && node.containsPoint(MouseInfo.location) && MouseInfo.is_primary_btn_down) {
                console.log("Dragging node: " + id)
                node.color = "#f00";
                this.drag_info.node = node;
                this.drag_info.mouse_diff = node.getPositionDifference(MouseInfo.location);
            }
        }
        if (this.drag_info.node) {
            this.drag_info.node.x = MouseInfo.location.x;
            this.drag_info.node.y = MouseInfo.location.y; 
            if (!MouseInfo.is_primary_btn_down) {
                this.drag_info.node.color = "#fff";
                this.drag_info.node = null;
                this.drag_info.mouse_diff = null;
            }
        }
    }

    render() {

        const total_edges = this.edges.length;

        for (let i = 0; i < total_edges; i++) {
            const edge = this.edges[i];
            const node_from = this.nodes[edge.from];
            const node_to = this.nodes[edge.to];


            this.drawLine(node_from.x,node_from.y,node_to.x,node_to.y, 10, "blue")
        }

        for (const id in this.nodes) {
            const node = this.nodes[id]
            this.drawCircle(node.radius, node.x, node.y, node.color, true, "red", 5);
            this.drawText(node.name, node.x,node.y, "#000")
        }

    }


}