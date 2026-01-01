import type {YASLMemPointer} from "./YASLMemPointer";
import type {YASLNativeValue} from "../natives/YASLNativeValue";

export class YASLNativeValuePointer implements YASLMemPointer{
    constructor(private value:YASLNativeValue) {
    }
    get(): YASLNativeValue {
        return this.value;
    }

    set(value: YASLNativeValue): void {
        this.value = value;
    }

}