import { YASLArrayObj } from "./YASLArrayObj";

export type YASLNativeValue = string | boolean | number | YASLArrayObj | null;

export class YASLNativeValueWrapper {
    public static NULL = new YASLNativeValueWrapper(null);

    constructor(public readonly value: YASLNativeValue) {

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

    isBoolean(): this is { value: boolean } {
        return typeof this.value === "boolean";
    }

    copy(): YASLNativeValueWrapper {
        if (!this.isArray())
            return new YASLNativeValueWrapper(this.value);
        else
            return new YASLNativeValueWrapper(this.value.copy());
    }
}
