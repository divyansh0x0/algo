import type { YMemPointer } from "../environment/YMemPointer";
import  { YNativeValueWrapper } from "../natives/YNativeValueWrapper";

export type YRuntimeValue =
    | {kind: "value", value:YNativeValueWrapper }
    | {kind: "ref", ref: YMemPointer};

export const YNull:YRuntimeValue = {
    kind:"value",
    value:YNativeValueWrapper.NULL,
}