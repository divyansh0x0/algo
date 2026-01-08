import type { YASLMemPointer } from "../environment/YASLMemPointer";
import { YASLArrayObj } from "./YASLArrayObj";

export type YASLPossibleNativeValue = string | boolean | number | YASLArrayObj | null;

export class YASLNativeValue {
    public static NULL = new YASLNativeValue(null);

    constructor(public readonly value: YASLPossibleNativeValue) {

    }

    isNull(): this is { value: null } {
        return this.value === null;
    }

    isNumber(): this is { value: number } {
        return typeof this.value === "number";
    }

    isString(): this is { value: string } {
        return typeof this.value === "string";
    }

    isArray(): this is { value: YASLArrayObj } {
        return this.value instanceof YASLArrayObj;
    }

    isBoolean(): this is {value: boolean} {
        return typeof this.value === "boolean";
    }
}
