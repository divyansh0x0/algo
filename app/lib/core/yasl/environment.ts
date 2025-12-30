import {type YASLNativeValue, type YASLNode} from "@/lib/core/yasl/tree";

export enum EnvironmentReturnCode {
    AlreadyDefined,
    Success,
    NotDefined,
}

export enum RValueType {
    Node,
    Native,
    Environment
}

export interface RValue {
    type: RValueType;
    value: YASLNativeValue | YASLNode | YASLEnvironment;
}

export class YASLEnvironment {
    private variable_map = new Map<string, RValue | null>();

    constructor() {
    }

    define(name: string, value: YASLNativeValue) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, {type: RValueType.Native, value});
        return EnvironmentReturnCode.Success;
    }

    defineScope(name: string, value: YASLEnvironment) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, {type: RValueType.Environment, value});
        return EnvironmentReturnCode.Success;
    }

    mutate(name: string, new_value: YASLNativeValue) {
        if (!this.variable_map.has(name))
            return EnvironmentReturnCode.NotDefined;

        this.variable_map.set(name, {type: RValueType.Native, value: new_value});
        return EnvironmentReturnCode.Success;
    }

    mutateScope(name: string, new_value: YASLEnvironment) {
        if (!this.variable_map.has(name))
            return EnvironmentReturnCode.NotDefined;

        this.variable_map.set(name, {type: RValueType.Environment, value: new_value});
        return EnvironmentReturnCode.Success;
    }

    get(name: string) {
        return this.variable_map.get(name) ?? null;
    }

}
