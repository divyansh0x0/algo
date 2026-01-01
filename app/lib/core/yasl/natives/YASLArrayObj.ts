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
        this.assertIndex(index);
        return this.internal[index]!;
    }

    set(index: number, value: YASLNativeValue) {
        this.assertIndex(index);
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
    private assertIndex(index: number): void {
        if (index < 0 || index >= this.internal.length) {
            throw new Error(`Index ${index} out of bounds`);
        }
    }

}