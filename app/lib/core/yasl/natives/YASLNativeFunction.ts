import type {YASLNativeValue} from "./YASLNativeValue";

export type YASLNativeFunction = (...args: YASLNativeValue[]) => YASLNativeValue;

export const YASLNativeFunctions: Record<string, YASLNativeFunction> = {
    print: (...args)=>{
        console.log(...args);
        return null;
    }
}