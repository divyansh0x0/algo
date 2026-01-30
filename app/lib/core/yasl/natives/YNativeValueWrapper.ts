import { YArrayObj } from "./YArrayObj";

export type YNativeValue = string | boolean | number | YArrayObj | null;

export class YNativeValueWrapper {
    public static NULL = new YNativeValueWrapper(null);

    constructor(public readonly value: YNativeValue) {

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

    isArray(): this is { value: YArrayObj } {
        return this.value instanceof YArrayObj;
    }

    isBoolean(): this is { value: boolean } {
        return typeof this.value === "boolean";
    }

    copy(): YNativeValueWrapper {
        if (!this.isArray())
            return new YNativeValueWrapper(this.value);
        else
            return new YNativeValueWrapper(this.value.copy());
    }
}
