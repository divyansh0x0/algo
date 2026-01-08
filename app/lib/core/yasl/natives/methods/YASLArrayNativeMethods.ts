import type { YASLArrayObj } from "../YASLArrayObj";
import { YASLNativeMethodRegistry } from "../YASLNativeMethodRegistry";
import { YASLNativeValue } from "../YASLNativeValue";

function assertArgLength(args: YASLNativeValue[], expected: number, name: string): void {
    if (args.length !== expected) {
        throw new Error(`${name} expects ${expected} arguments`);
    }
}


export const YASLArrayNativeMethods = new YASLNativeMethodRegistry<YASLArrayObj>();


YASLArrayNativeMethods.register("swap", (arr, args, context): YASLNativeValue => {
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

        context.tracer.emitArraySwap(arr, i.value, j.value, context.line);
        return YASLNativeValue.NULL;
    }
);

YASLArrayNativeMethods.register("length", (arr, args): YASLNativeValue => {
    assertArgLength(args, 0, "length");
    return new YASLNativeValue(arr.length());
});