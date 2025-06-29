import { Vector } from "@/utils/geometry";

interface ArgumentDefinition {
    name: string;
    type: string;
    description: string;
    default?: any;
}

interface CommandDefinition {
    name: string;
    description: string;
    arguments: ArgumentDefinition[];
}

export const CommandRegistry: Record<string, CommandDefinition> = {
    AddNodeCommand: {
        name: "AddNode",
        description: "Adds a new node to the scene with specified position and radius.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier for the node."
            },
            {
                name: "x",
                type: "number",
                description: "X-coordinate of the node's position.",
                default: 0
            },
            {
                name: "y",
                type: "number",
                description: "Y-coordinate of the node's position.",
                default: 0
            },
            {
                name: "radius",
                type: "number",
                description: "Radius of the node.",
                default: 10
            }
        ]
    },
    RemoveNodeCommand: {
        name: "RemoveNode",
        description: "Removes a node from the scene by its ID.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier of the node to remove."
            }
        ]
    },
    HighlightNodeCommand: {
        name: "HighlightNode",
        description: "Highlights a node in the scene by its ID.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier of the node to highlight."
            }
        ]
    },
    UnhighlightNodeCommand: {
        name: "UnhighlightNode",
        description: "Removes highlight from a node in the scene by its ID.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier of the node to unhighlight."
            }
        ]
    },
    MoveNodeCommand: {
        name: "MoveNode",
        description: "Moves a node from one position to another.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier of the node to move."
            },
            {
                name: "from_pos",
                type: "Vector",
                description: "Starting position of the node as a Vector object with x and y coordinates."
            },
            {
                name: "to_pos",
                type: "Vector",
                description: "Target position of the node as a Vector object with x and y coordinates."
            }
        ]
    },
    LabelNodeCommand: {
        name: "LabelNode",
        description: "Sets a label for a node in the scene.",
        arguments: [
            {
                name: "id",
                type: "string",
                description: "Unique identifier of the node to label."
            },
            {
                name: "label",
                type: "string",
                description: "Text to set as the node's label."
            }
        ]
    },
    AddEdgeCommand: {
        name: "AddEdge",
        description: "Adds an edge between two nodes in the scene.",
        arguments: [
            {
                name: "from_id",
                type: "string",
                description: "ID of the source node for the edge."
            },
            {
                name: "to_id",
                type: "string",
                description: "ID of the target node for the edge."
            }
        ]
    },
    RemoveEdgeCommand: {
        name: "RemoveEdge",
        description: "Removes an edge between two nodes in the scene.",
        arguments: [
            {
                name: "from_id",
                type: "string",
                description: "ID of the source node of the edge to remove."
            },
            {
                name: "to_id",
                type: "string",
                description: "ID of the target node of the edge to remove."
            }
        ]
    },
    HighlightEdgeCommand: {
        name: "HighlightEdge",
        description: "Highlights an edge between two nodes in the scene.",
        arguments: [
            {
                name: "from_id",
                type: "string",
                description: "ID of the source node of the edge to highlight."
            },
            {
                name: "to_id",
                type: "string",
                description: "ID of the target node of the edge to highlight."
            }
        ]
    },
    UnhighlightEdgeCommand: {
        name: "UnhighlightEdge",
        description: "Removes highlight from an edge between two nodes.",
        arguments: [
            {
                name: "from_id",
                type: "string",
                description: "ID of the source node of the edge to unhighlight."
            },
            {
                name: "to_id",
                type: "string",
                description: "ID of the target node of the edge to unhighlight."
            }
        ]
    },
    LabelEdgeCommand: {
        name: "LabelEdge",
        description: "Sets a label for an edge between two nodes.",
        arguments: [
            {
                name: "from_id",
                type: "string",
                description: "ID of the source node of the edge to label."
            },
            {
                name: "to_id",
                type: "string",
                description: "ID of the target node of the edge to label."
            },
            {
                name: "label",
                type: "string",
                description: "Text to set as the edge's label."
            }
        ]
    },
    NoopCommand: {
        name: "Noop",
        description: "Performs no operation on the scene.",
        arguments: []
    },
    FinishedCommand: {
        name: "Finished",
        description: "Signals that the scene operations are complete.",
        arguments: []
    },
    ErrorCommand: {
        name: "Error",
        description: "Reports an error in the scene.",
        arguments: [
            {
                name: "message",
                type: "string",
                description: "Error message describing the issue."
            }
        ]
    },
    ResetCommand: {
        name: "Reset",
        description: "Resets the scene to its initial state.",
        arguments: []
    },
    ClearCommand: {
        name: "Clear",
        description: "Clears all nodes and edges from the scene.",
        arguments: []
    }
};
