import { Scene } from "@/engine/scene";
import { Vector } from "@/utils/geometry";

interface SceneCommand {
    execute(scene: Scene): Promise<void> | void;
}

export class AddNodeCommand implements SceneCommand {
    constructor(private id: string, private x: number = 0, private y: number = 0, private radius: number = 10) {}

    async execute(scene: Scene) {
        scene.addNode(this.id, new Vector(this.x, this.y), this.radius);
    }
}

export class RemoveNodeCommand implements SceneCommand {
    constructor(private id: string) {}

    async execute(scene: Scene) {
        scene.removeNode(this.id);
    }
}

export class HighlightNodeCommand implements SceneCommand {
    constructor(private id: string) {

    }

    async execute(scene: Scene) {
        scene.highlightNode(this.id);
    }
}

export class UnhighlightNodeCommand implements SceneCommand {
    constructor(private id: string) {

    }

    async execute(scene: Scene) {
        scene.unhighlightNode(this.id);
    }
}

export class MoveNodeCommand implements SceneCommand {
    constructor(private id: string, private from_pos: Vector, private to_pos: Vector) {

    }

    async execute(scene: Scene) {
        scene.moveNode(this.id, this.from_pos, this.to_pos);
    }
}

export class LabelNodeCommand implements SceneCommand {
    constructor(private id: string, private label: string) {
    }

    async execute(scene: Scene) {
        scene.labelNode(this.id, this.label);
    }
}

export class AddEdgeCommand implements SceneCommand {
    constructor(private from_id: string, private to_id: string) {
    }

    async execute(scene: Scene) {
        scene.addEdge(this.from_id, this.to_id);
    }
}

export class RemoveEdgeCommand implements SceneCommand {
    constructor(private from_id: string, private to_id: string) {

    }

    async execute(scene: Scene) {
        scene.removeEdge(this.from_id, this.to_id);
    }
}

export class HighlightEdgeCommand implements SceneCommand {
    constructor(private from_id: string, private to_id: string) {

    }

    async execute(scene: Scene) {
        scene.highlightEdge(this.from_id, this.to_id);
    }
}

export class UnhighlightEdgeCommand implements SceneCommand {
    constructor(private from_id: string, private to_id: string) {

    }

    async execute(scene: Scene) {
        scene.unhighlightEdge(this.from_id, this.to_id);
    }
}

export class LabelEdgeCommand implements SceneCommand {
    constructor(private from_id: string, private to_id: string, private label: string) {
    }

    async execute(scene: Scene) {
        scene.labelEdge(this.from_id, this.to_id, this.label);
    }
}

export class NoopCommand implements SceneCommand {
    async execute(scene: Scene) {
        scene.noop();
    }
}

export class FinishedCommand implements SceneCommand {
    async execute(scene: Scene) {
        scene.finished();
    }
}

export class ErrorCommand implements SceneCommand {
    constructor(private message: string) {}

    async execute(scene: Scene) {
        scene.error(this.message);
    }
}

export class ResetCommand implements SceneCommand {
    async execute(scene: Scene) {
        scene.reset();
    }
}

export class ClearCommand implements SceneCommand {
    async execute(scene: Scene) {
        scene.clear();
    }
}
