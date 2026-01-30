import type { ExpCallNode, YNode } from "../YNode";

export class YRuntimeError {
    constructor(
        public message: string,
        public node: YNode,
        public kind: YRuntimeErrorType// an error in programming languages where a function, method, or operation is called with an incorrect number of arguments (or operands) than what it expects
    ) {}
}
export type YRuntimeErrorType =
    | "TypeError"
    | "ReferenceError"
    | "RuntimeError"
    | "ArityError";
export class YRuntimeContext {
    error: YRuntimeError | null = null;

    raise(error: YRuntimeError) {
        if (!this.error) {
            this.error = error;
        }
    }

    hasError(): boolean {
        return this.error !== null;
    }

    raiseMethodNotFound(node: ExpCallNode): void {

    }

    getError() {
        return this.error;
    }
}