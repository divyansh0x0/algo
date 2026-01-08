import type { YASLMemPointer } from "../environment/YASLMemPointer";
import  { YASLNativeValue } from "../natives/YASLNativeValue";

export type YASLRuntimeValue =
    | {kind: "value", value:YASLNativeValue }
    | {kind: "ref", ref: YASLMemPointer};

export const YASLNull:YASLRuntimeValue = {
    kind:"value",
    value:YASLNativeValue.NULL,
}