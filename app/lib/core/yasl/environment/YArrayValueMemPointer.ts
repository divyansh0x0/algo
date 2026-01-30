import type { YArrayObj } from "../natives/YArrayObj";
import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import type { YMemPointer } from "./YMemPointer";

export class YArrayValueMemPointer implements YMemPointer {
    constructor(private value: YArrayObj,
                private index: number) {
    }


    set(value: YNativeValueWrapper) {
        const arr = this.value as YArrayObj;
        arr.set(this.index, value);
    }

    get() {
        return this.value;
    }
}