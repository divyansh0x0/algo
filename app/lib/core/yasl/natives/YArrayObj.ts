import type { YNativeValueWrapper } from "./YNativeValueWrapper";

export class YArrayObj {
    private readonly internal: YNativeValueWrapper[];

    constructor(initialValues: YNativeValueWrapper[] = []) {
        this.internal = initialValues;
    }

    length() {
        return this.internal.length;
    }

    get(index: number): YNativeValueWrapper {
        this.assertIndex(index);
        return this.internal[index]!;
    }

    set(index: number, value: YNativeValueWrapper) {
        this.assertIndex(index);
        this.internal[index] = value;
    }

    push(value: YNativeValueWrapper) {
        this.internal.push(value);
    }

    pop(): YNativeValueWrapper {
        if (this.internal.length === 0)
            throw new Error("Pop from empty array is not possible");

        return this.internal.pop()!;
    }

    private assertIndex(index: number): void {
        if (index < 0 || index >= this.internal.length) {
            throw new Error(`Index ${index} out of bounds`);
        }
    }

    toString(){
        let str = "";
        for (let i = 0; i < this.internal.length; i++){
            const valueWrapper = this.internal[i];
            str +=  (valueWrapper?.value || "null").toString();
            if(i < this.internal.length - 1){
                str += ", ";
            }
        }
        return "[" + str + "]"
    }

    getArray(){
        return [...this.internal];
    }

    copy(): YArrayObj{
        const arr: YNativeValueWrapper[] = [];
        for (const el of this.internal) {
            arr.push(el.copy());
        }
        return new YArrayObj(arr);
    }
}