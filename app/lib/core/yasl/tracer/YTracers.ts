/**
 * A tracer interface and enum for different tracer types. These tracers are used to
 * monitor the execution of YASL code, capturing events such as function calls,
 * returns, line executions, and exceptions.
 *
 *
 * Each tracer will be used for visualization purpose.
 */
import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import type { YArrayObj } from "../natives/YArrayObj";
import type { YTokenBinaryOp, YTokenUnaryOp } from "../YToken";

export enum TracerType {
    DECLARE_VARIABLE,
    DECLARE_FUNCTION,
    ASSIGN_VARIABLE,


    BINARY_OPERATION,
    UNARY_OPERATION,

    CALL,
    RETURN,
    JUMP,

    ENTER_BLOCK,
    EXIT_BLOCK,

    ARRAY_READ,
    ARRAY_WRITE,
    ARRAY_SWAP,

    CONDITION_EVALUATION,
    COMPARE,
}

export interface YTracer {
    type: TracerType;
    line: number;
}


export interface YTracerDeclareVariable extends YTracer {
    type: TracerType.DECLARE_VARIABLE;
    line: number;
    variable_name: string;
    assigned_value?: YNativeValueWrapper;
}

export interface YTracerAssignVariable extends YTracer {
    type: TracerType.ASSIGN_VARIABLE;
    variable_name: string;
    value: YNativeValueWrapper;
}

export interface YTracerBinaryOperation extends YTracer {
    type: TracerType.BINARY_OPERATION;
    operator: YTokenBinaryOp;
    left: YNativeValueWrapper;
    right: YNativeValueWrapper;
    result: YNativeValueWrapper;
}

export interface YTracerUnaryOperation extends YTracer {
    type: TracerType.UNARY_OPERATION;
    operator: YTokenUnaryOp;
    operand: YTokenUnaryOp;
    result: YNativeValueWrapper;
}

export interface YTracerArrayWrite extends YTracer {
    type: TracerType.ARRAY_WRITE;
    array_name: YArrayObj;
    value: YNativeValueWrapper;
}

export interface YTracerArrayRead extends YTracer {
    type: TracerType.ARRAY_READ;
    array_name: YArrayObj;
    read_index: number;
}

export interface YTracerArraySwap extends YTracer {
    type: TracerType.ARRAY_SWAP;
    array_name: string;
    index1: number;
    index2: number;
}

export interface YTracerJump extends YTracer {
    type: TracerType.JUMP;
    target_line: number;
}

export interface YTracerConditionEvaluation extends YTracer {
    type: TracerType.CONDITION_EVALUATION;
    condition_value: boolean;
}