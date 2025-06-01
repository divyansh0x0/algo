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
    LABEL_EDGE: "label_edge",
    NOOP: "noop",
    FINISHED: "finished",
    ERROR: "error",
    RESET: "reset",
    CLEAR: "clear"
});

/** ---------------------------- NODE COMMANDS --------------------------
 * Node commands are used to modify the nodes of the graph.
 * Nodes are defined by a unique id and a position (x, y).
 */
export const SceneCommands = Object.freeze({
    addNode: function (id, x = 0, y = 0, radius = 10) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }

        if (typeof radius !== "number") {
            throw new Error(`radius must be a number, received: ${radius}`);
        }

        return {
            type: COMMAND_TYPES.ADD_NODE,
            id: id,
            pos: {x, y},
            radius: radius
        };
    },

    removeNode(id) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }
        return {
            type: COMMAND_TYPES.REMOVE_NODE,
            id: id
        };
    },

    highlightNode(id) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }
        return {
            type: COMMAND_TYPES.HIGHLIGHT_NODE,
            id: id
        };
    },

    unhighlightNode(id) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }
        return {
            type: COMMAND_TYPES.UNHIGHLIGHT_NODE,
            id: id
        };
    },

    moveNode(id, from_pos, to_pos) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }
        if (typeof from_pos !== "object") {
            throw new Error(`from_pos must be an object of type {x: int, y: int}, received: ${JSON.stringify(from_pos)}`);
        }

        if (typeof to_pos !== "object") {
            throw new Error(`to_pos must be an object of type {x: int, y: int}, received: ${JSON.stringify(to_pos)}`);
        }
        return {
            type: COMMAND_TYPES.MOVE_NODE,
            id: id,
            from: from_pos,
            end: to_pos
        };
    },

    labelNode(id, label) {
        if (typeof id !== "string") {
            throw new Error(`id must be a string, received: ${id}`);
        }
        if (typeof label !== "string") {
            throw new Error(`label must be a string, received: ${label}`);
        }
        return {
            type: COMMAND_TYPES.LABEL_NODE,
            id: id,
            label: label
        };
    },
    /** -------------------------- EDGE COMMANDS --------------------------
     * Edge commands are used to modify the edges of the graph.
     * Edges are defined by a pair of nodes (from, to).
     *---------------------------------------------------------------------
     */
    addEdge(from_id, to_id) {
        if (typeof from_id !== "string") {
            throw new Error(`from must be a string, received: ${from_id}`);
        }
        if (typeof to_id !== "string") {
            throw new Error(`end must be a string, received: ${to_id}`);
        }
        return {
            type: COMMAND_TYPES.ADD_EDGE,
            from: from_id,
            end: to_id
        };
    },

    removeEdge(from_id, to_id) {
        if (typeof from_id !== "string") {
            throw new Error(`from must be a string, received: ${from_id}`);
        }
        if (typeof to_id !== "string") {
            throw new Error(`end must be a string, received: ${to_id}`);
        }
        return {
            type: COMMAND_TYPES.REMOVE_EDGE,
            from: from_id,
            end: to_id
        };
    },


    highlightEdge(from_id, to_id) {
        if (typeof from_id !== "string") {
            throw new Error(`from must be a string, received: ${from_id}`);
        }
        if (typeof to_id !== "string") {
            throw new Error(`end must be a string, received: ${to_id}`);
        }
        return {
            type: COMMAND_TYPES.HIGHLIGHT_EDGE,
            from: from_id,
            end: to_id
        };
    },

    unhighlightEdge(from_id, to_id) {
        if (typeof from_id !== "string") {
            throw new Error(`from must be a string, received: ${from_id}`);
        }
        if (typeof to_id !== "string") {
            throw new Error(`end must be a string, received: ${to_id}`);
        }
        return {
            type: COMMAND_TYPES.UNHIGHLIGHT_EDGE,
            from: from_id,
            end: to_id
        };
    },

    labelEdge(from_id, to_id, label) {
        if (typeof from_id !== "string") {
            throw new Error(`from must be a string, received: ${from_id}`);
        }
        if (typeof to_id !== "string") {
            throw new Error(`end must be a string, received: ${to_id}`);
        }
        if (typeof label !== "string") {
            throw new Error(`label must be a string, received: ${label}`);
        }

        return {
            type: COMMAND_TYPES.LABEL_EDGE,
            from: from_id,
            end: to_id,
            label: label
        };
    },
    /** ---------------------------- GLOBAL COMMANDS --------------------------
     *
     */

    noop() {
        return {
            type: COMMAND_TYPES.NOOP
        };
    },
    finished() {
        return {
            type: COMMAND_TYPES.FINISHED
        };
    },
    error(message) {
        return {
            type: COMMAND_TYPES.ERROR,
            msg: message
        };
    },
    reset() {
        return {
            type: COMMAND_TYPES.RESET
        };
    },
    clear() {
        return {type: COMMAND_TYPES.CLEAR};
    }
});
