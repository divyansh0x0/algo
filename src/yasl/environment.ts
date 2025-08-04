import { NativeValue, YASLNode } from "@/yasl/tree";

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
    value: NativeValue | YASLNode | Environment;
}

export class Environment {
    private variable_map = new Map<string, RValue | null>();

    constructor() { }

    define(name: string, value: NativeValue) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, { type: RValueType.Native, value });
        return EnvironmentReturnCode.Success;
    }

    defineScope(name: string, value: Environment) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, { type: RValueType.Environment, value });
        return EnvironmentReturnCode.Success;
    }

    mutate(name: string, new_value: NativeValue) {
        if (!this.variable_map.has(name))
            return EnvironmentReturnCode.NotDefined;

        this.variable_map.set(name, { type: RValueType.Native, value: new_value });
        return EnvironmentReturnCode.Success;
    }

    mutateScope(name: string, new_value: Environment) {
        if (!this.variable_map.has(name))
            return EnvironmentReturnCode.NotDefined;

        this.variable_map.set(name, { type: RValueType.Environment, value: new_value });
        return EnvironmentReturnCode.Success;
    }

    get(name: string) {
        return this.variable_map.get(name) ?? null;
    }

}
