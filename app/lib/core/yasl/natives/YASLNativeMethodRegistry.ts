import type { YASLNativeMethod, YASLNativeMethodContext } from "./YASLNativeMethod";
import  { YASLNativeValueWrapper } from "./YASLNativeValueWrapper";

export class YASLNativeMethodRegistry<T> {
    private readonly methods = new Map<string, YASLNativeMethod<T>>();

    register(name: string, method: YASLNativeMethod<T>): void {
        if (this.methods.has(name)) {
            throw new Error(`Native method '${name}' already registered`);
        }
        this.methods.set(name, method);
    }

    call(name: string, target: T, args: YASLNativeValueWrapper[], context: YASLNativeMethodContext): YASLNativeValueWrapper {
        const method = this.methods.get(name);
        if (!method)
            return YASLNativeValueWrapper.NULL;

        return method(target, args, context);
    }

    has(name: string): boolean {
        return this.methods.has(name);
    }
}