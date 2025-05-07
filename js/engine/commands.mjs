export const COMMAND_TYPES = Object.freeze({
    ADD_NODE: "add_node",
    REMOVE_NODE: "remove_node",
    HIGHLIGHT_NODE: "highlight_node",
    UNHIGHLIGHT_NODE: "unhighlight_node",
    MOVE_NODE: "move_node",
    LABEL_NODE: "label_node",
    ADD_EDGE: "add_edge",
    REMOVE_EDGE: "remove_edge",
    HIGHLIGHT_EDGE: "highlight_edge",
    UNHIGHLIGHT_EDGE: "unhighlight_edge",
    LABEL_EDGE: "label_edge"
    
});

/** ---------------------------- NODE COMMANDS --------------------------
 * Node commands are used to modify the nodes of the graph.
 * Nodes are defined by a unique id and a position (x, y).
 */

export function addNode(id, pos, radius){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    if (typeof pos !== "object"){
        throw new Error("pos must be an object of type {x: int, y: int}")
    }
 
    if (typeof radius !== "number"){
        throw new Error("radius must be a number")
    }
    
    return {
        type: COMMAND_TYPES.ADD_NODE,
        id: id,
        pos: pos,
        radius: radius
    }
}

export function removeNode(id){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    return {
        type: COMMAND_TYPES.REMOVE_NODE,
        id: id
    }
}

export function highlightNode(id){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    return {
        type: COMMAND_TYPES.HIGHLIGHT_NODE,
        id: id
    }
}

export function unhighlightNode(id){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    return {
        type: COMMAND_TYPES.UNHIGHLIGHT_NODE,
        id: id
    }
}

export function moveNode(id, from_pos, to_pos){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    if (typeof from_pos !== "object"){
        throw new Error("from_pos must be an object of type {x: int, y: int}")
    }
    
    if (typeof to_pos !== "object"){
        throw new Error("from_pos must be an object of type {x: int, y: int}")
    }
    return {
        type: COMMAND_TYPES.MOVE_NODE,
        id: id,
        from: from_pos,
        to: to_pos
    }
}

export function labelNode(id, label){
    if (typeof id !== "string"){
        throw new Error("id must be a string")
    }
    if (typeof label !== "string"){
        throw new Error("label must be a string")
    }
    return {
        type: COMMAND_TYPES.LABEL_NODE,
        id: id,
        label: label
    }
}
/** -------------------------- EDGE COMMANDS --------------------------
 * Edge commands are used to modify the edges of the graph.
 * Edges are defined by a pair of nodes (from, to). 
 *---------------------------------------------------------------------
 */
 export function addEdge(from_id, to_id){
    if (typeof from_id !== "string"){
        throw new Error("from must be a string")
    }
    if (typeof to_id !== "string"){
        throw new Error("to must be a string")
    }
    return {
        type: COMMAND_TYPES.ADD_EDGE,
        from: from_id,
        to: to_id
    }
}

export function removeEdge(from_id, to_id){
    if (typeof from_id !== "string"){
        throw new Error("from must be a string")
    }
    if (typeof to_id !== "string"){
        throw new Error("to must be a string")
    }
    return {
        type: COMMAND_TYPES.REMOVE_EDGE,
        from: from_id,
        to: to_id
    }
}


export function highlightEdge(from_id, to_id){
    if (typeof from_id !== "string"){
        throw new Error("from must be a string")
    }
    if (typeof to_id !== "string"){
        throw new Error("to must be a string")
    }
    return {
        type: COMMAND_TYPES.LABEL_EDGE,
        from: from_id,
        to: to_id
    }
}

export function unhighlightEdge(from_id, from_id){
    if (typeof from !== "string"){
        throw new Error("from must be a string")
    }
    if (typeof to !== "string"){
        throw new Error("to must be a string")
    }
    return {
        type: COMMAND_TYPES.UNHIGHLIGHT_EDGE,
        from: from_id,
        to: from_id
    }
}

export function labelEdge(from_id, to_id, label){
    if (typeof from !== "string"){
        throw new Error("from must be a string")
    }
    if (typeof to !== "string"){
        throw new Error("to must be a string")
    }
    if (typeof label !== "string"){
        throw new Error("label must be a string")
    }
    
    return {
        type: COMMAND_TYPES.LABEL_EDGE,
        from: from_id,
        to: to_id,
        label: label
    }
}

