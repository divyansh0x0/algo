import type { YNativeMethod, YNativeMethodContext } from "./YNativeMethod";
import  { YNativeValueWrapper } from "./YNativeValueWrapper";

export class YNativeMethodRegistry<T> {
    private readonly methods = new Map<string, YNativeMethod<T>>();

    register(name: string, method: YNativeMethod<T>): void {
        if (this.methods.has(name)) {
            throw new Error(`Native method '${name}' already registered`);
        }
        this.methods.set(name, method);
    }

    call(name: string, target: T, args: YNativeValueWrapper[], context: YNativeMethodContext): YNativeValueWrapper {
        const method = this.methods.get(name);
        if (!method)
            return YNativeValueWrapper.NULL;

        return method(target, args, context);
    }

    has(name: string): boolean {
        return this.methods.has(name);
    }
}