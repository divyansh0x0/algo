import type { YASLArrayObj } from "../YASLArrayObj";
import { YASLNativeMethodRegistry } from "../YASLNativeMethodRegistry";
import type { YASLNativeValue } from "../YASLNativeValue";

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
        if (typeof i !== "number") {
            throw new Error("Invalid first argument. Expected number");
        }
        if (typeof j !== "number") {
            throw new Error("Invalid second argument. Expected number");
        }
        const a = arr.get(i);
        const b = arr.get(j);

        arr.set(j, a);
        arr.set(i, b);

        context.tracer.emitArraySwap(arr, i, j, context.line);
        return null;
    }
);

YASLArrayNativeMethods.register("length", (arr, args): YASLNativeValue => {
    assertArgLength(args, 0, "length");
    return arr.length();
});