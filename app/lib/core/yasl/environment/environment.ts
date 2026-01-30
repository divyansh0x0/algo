import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import type { YMemPointer } from "./YMemPointer";
import { YNativeValuePointer } from "./YNativeValuePointer";

export enum EnvironmentReturnCode {
    AlreadyDefined,
    Success,
    NotDefined,
}


export class YEnvironment {
    public parent?: YEnvironment;
    private variable_map = new Map<string, YMemPointer>();


    define(name: string, value: YNativeValueWrapper) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, new YNativeValuePointer(value));
        return EnvironmentReturnCode.Success;
    }

    mutate(name: string, new_value: YNativeValueWrapper) {
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
