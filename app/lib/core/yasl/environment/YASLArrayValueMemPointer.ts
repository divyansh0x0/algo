import type {YASLMemPointer} from "./YASLMemPointer";
import type {YASLNativeValue} from "../natives/YASLNativeValue";
import type {YASLArrayObj} from "../natives/YASLArrayObj";

export class YASLArrayValueMemPointer implements YASLMemPointer {
    constructor(private value: YASLArrayObj,
                private index: number) {}

    
    set(value: YASLNativeValue) {
        const arr = this.value as YASLArrayObj
        arr.set(this.index, value);
    }

    get() {
        return this.value;
    }
}