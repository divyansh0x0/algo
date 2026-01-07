import type { YASLNativeValue } from "../natives/YASLNativeValue";
import type { YASLMemPointer } from "./YASLMemPointer";
import { YASLNativeValuePointer } from "./YASLNativeValuePointer";

export enum EnvironmentReturnCode {
    AlreadyDefined,
    Success,
    NotDefined,
}


export class YASLEnvironment {
    public parent?: YASLEnvironment;
    private variable_map = new Map<string, YASLMemPointer>();


    define(name: string, value: YASLNativeValue) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, new YASLNativeValuePointer(value));
        return EnvironmentReturnCode.Success;
    }

    mutate(name: string, new_value: YASLNativeValue) {
        const ptr = this.variable_map.get(name);
        if (ptr === undefined)
            return EnvironmentReturnCode.NotDefined;
        ptr?.set(new_value);
        return EnvironmentReturnCode.Success;
    }

    get(name: string) {
        return this.variable_map.get(name);
    }

}
