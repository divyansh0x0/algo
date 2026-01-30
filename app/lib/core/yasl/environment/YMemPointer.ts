import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";

export interface YMemPointer {
    set(value: YNativeValueWrapper): void;

    get(): YNativeValueWrapper;
}