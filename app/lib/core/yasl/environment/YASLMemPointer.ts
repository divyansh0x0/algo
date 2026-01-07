import type { YASLNativeValue } from "../natives/YASLNativeValue";

export interface YASLMemPointer {
    set(value: YASLNativeValue): void;

    get(): YASLNativeValue;
}