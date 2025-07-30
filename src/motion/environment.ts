import { Ast } from "@/motion/ast/tree";

export enum EnvironmentReturnCode {
    AlreadyDefined,
    Success,
    NotDefined,
}

export enum RValueType {
    Node,
    Environment
}

export interface RValue {
    type: RValueType;
    value: Ast.Node | Environment;
}

export class Environment {
    private variable_map = new Map<string, RValue>();

    constructor() { }

    define(name: string, value: Ast.Node) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, { type: RValueType.Node, value });
        return EnvironmentReturnCode.Success;
    }

    defineScope(name: string, value: Environment) {
        if (this.variable_map.has(name))
            return EnvironmentReturnCode.AlreadyDefined;
        this.variable_map.set(name, { type: RValueType.Environment, value });
        return EnvironmentReturnCode.Success;
    }

    mutate(name: string, new_value: Ast.Node) {
        if (!this.variable_map.has(name))
            return EnvironmentReturnCode.NotDefined;

        this.variable_map.set(name, { type: RValueType.Node, value: new_value });
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
