import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import type { YMemPointer } from "./YMemPointer";

export class YNativeValuePointer implements YMemPointer {
    constructor(private value: YNativeValueWrapper) {
    }

    get(): YNativeValueWrapper {
        return this.value;
    }

    set(value: YNativeValueWrapper): void {
        this.value = value;
    }

}