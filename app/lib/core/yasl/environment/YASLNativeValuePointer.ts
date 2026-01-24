import type { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";
import type { YASLMemPointer } from "./YASLMemPointer";

export class YASLNativeValuePointer implements YASLMemPointer {
    constructor(private value: YASLNativeValueWrapper) {
    }

    get(): YASLNativeValueWrapper {
        return this.value;
    }

    set(value: YASLNativeValueWrapper): void {
        this.value = value;
    }

}