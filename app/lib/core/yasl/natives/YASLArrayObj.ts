import type {YASLNativeValue} from "./YASLNativeValue";

export class YASLArrayObj {
    private readonly internal: YASLNativeValue[];

    constructor(initialValues: YASLNativeValue[]) {
        this.internal = initialValues;
    }

    length() {
        return this.internal.length;
    }

    get(index: number): YASLNativeValue {
        if (index < 0 || index >= this.internal.length) {
            throw new Error(`Index ${index} out of bounds`);
        }
        return this.internal[index]!;
    }

    set(index: number, value: YASLNativeValue) {
        if (index < 0 || index >= this.internal.length) {
            throw new Error(`Index ${index} out of bounds`);
        }
        this.internal[index] = value;
    }
    push(value:YASLNativeValue){
        this.internal.push(value);
    }
    pop(): YASLNativeValue{
        if(this.internal.length === 0)
            throw new Error("Pop from empty array is not possible");

        return this.internal.pop()!;
    }
}