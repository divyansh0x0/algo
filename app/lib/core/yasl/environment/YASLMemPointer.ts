import type { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";

export interface YASLMemPointer {
    set(value: YASLNativeValueWrapper): void;

    get(): YASLNativeValueWrapper;
}