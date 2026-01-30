import type { YNativeValueWrapper } from "./YNativeValueWrapper";

export type YNativeFunction = (...args: YNativeValueWrapper[]) => YNativeValueWrapper;

export const YNativeFunctions: Record<string, YNativeFunction> = {
    print: (...args) => {
        console.log(...args);
        return null;
    }
};