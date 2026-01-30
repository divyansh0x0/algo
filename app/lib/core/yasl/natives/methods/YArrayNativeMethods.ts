import type { YArrayObj } from "../YArrayObj";
import { YNativeMethodRegistry } from "../YNativeMethodRegistry";
import { YNativeValueWrapper } from "../YNativeValueWrapper";

function assertArgLength(args: YNativeValueWrapper[], expected: number, name: string): void {
    if (args.length !== expected) {
        throw new Error(`${name} expects ${expected} arguments`);
    }
}


export const YArrayNativeMethods = new YNativeMethodRegistry<YArrayObj>();


YArrayNativeMethods.register("swap", (arr, args, context): YNativeValueWrapper => {
        assertArgLength(args, 2, "swap");
        const [ i, j ] = args;
        if (!i || !j) {
            throw new Error("Invalid args");
        }
        if (!i.isNumber()) {
            throw new Error("Invalid first argument. Expected number");
        }
        if (!j.isNumber()) {
            throw new Error("Invalid second argument. Expected number");
        }
        const a = arr.get(i.value);
        const b = arr.get(j.value);

        arr.set(j.value, a);
        arr.set(i.value, b);

        context.tracer.emitArraySwap(context.identifier ?? "unknown", i.value, j.value, context.line);
        return YNativeValueWrapper.NULL;
    }
);

YArrayNativeMethods.register("length", (arr, args): YNativeValueWrapper => {
    assertArgLength(args, 0, "length");
    return new YNativeValueWrapper(arr.length());
});