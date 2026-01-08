import type { ExpCallNode, YASLNode } from "../YASLNode";

export class YASLRuntimeError {
    constructor(
        public message: string,
        public node: YASLNode,
        public kind: YASLRuntimeErrorType// an error in programming languages where a function, method, or operation is called with an incorrect number of arguments (or operands) than what it expects
    ) {}
}
export type YASLRuntimeErrorType=
    | "TypeError"
    | "ReferenceError"
    | "RuntimeError"
    | "ArityError";
export class YASLRuntimeContext {
    error: YASLRuntimeError | null = null;

    raise(error: YASLRuntimeError) {
        if (!this.error) {
            this.error = error;
        }
    }

    hasError(): boolean {
        return this.error !== null;
    }

    raiseMethodNotFound(node: ExpCallNode): void {

    }
}