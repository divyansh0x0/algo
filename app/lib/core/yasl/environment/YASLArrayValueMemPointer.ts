import type { YASLArrayObj } from "../natives/YASLArrayObj";
import type { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";
import type { YASLMemPointer } from "./YASLMemPointer";

export class YASLArrayValueMemPointer implements YASLMemPointer {
    constructor(private value: YASLArrayObj,
                private index: number) {
    }


    set(value: YASLNativeValueWrapper) {
        const arr = this.value as YASLArrayObj;
        arr.set(this.index, value);
    }

    get() {
        return this.value;
    }
}