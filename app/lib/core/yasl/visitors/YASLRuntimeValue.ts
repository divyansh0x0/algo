import type { YASLMemPointer } from "../environment/YASLMemPointer";
import  { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";

export type YASLRuntimeValue =
    | {kind: "value", value:YASLNativeValueWrapper }
    | {kind: "ref", ref: YASLMemPointer};

export const YASLNull:YASLRuntimeValue = {
    kind:"value",
    value:YASLNativeValueWrapper.NULL,
}