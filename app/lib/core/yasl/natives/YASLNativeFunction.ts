import type { YASLNativeValueWrapper } from "./YASLNativeValueWrapper";

export type YASLNativeFunction = (...args: YASLNativeValueWrapper[]) => YASLNativeValueWrapper;

export const YASLNativeFunctions: Record<string, YASLNativeFunction> = {
    print: (...args) => {
        console.log(...args);
        return null;
    }
};