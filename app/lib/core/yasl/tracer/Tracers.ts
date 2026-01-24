/**
 * A tracer interface and enum for different tracer types. These tracers are used to
 * monitor the execution of YASL code, capturing events such as function calls,
 * returns, line executions, and exceptions.
 *
 *
 * Each tracer will be used for visualization purpose.
 */
import type { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";
import type { YASLArrayObj } from "../natives/YASLArrayObj";
import type { YASLTokenBinaryOp, YASLTokenUnaryOp } from "../YASLToken";

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

export interface YASLTracer {
    type: TracerType;
    line: number;
}


export interface YASLTracerDeclareVariable extends YASLTracer {
    type: TracerType.DECLARE_VARIABLE;
    line: number;
    variable_name: string;
    assigned_value?: YASLNativeValueWrapper;
}

export interface YASLTracerAssignVariable extends YASLTracer {
    type: TracerType.ASSIGN_VARIABLE;
    variable_name: string;
    value: YASLNativeValueWrapper;
}

export interface YASLTracerBinaryOperation extends YASLTracer {
    type: TracerType.BINARY_OPERATION;
    operator: YASLTokenBinaryOp;
    left: YASLNativeValueWrapper;
    right: YASLNativeValueWrapper;
    result: YASLNativeValueWrapper;
}

export interface YASLTracerUnaryOperation extends YASLTracer {
    type: TracerType.UNARY_OPERATION;
    operator: YASLTokenUnaryOp;
    operand: YASLTokenUnaryOp;
    result: YASLNativeValueWrapper;
}

export interface YASLTracerArrayWrite extends YASLTracer {
    type: TracerType.ARRAY_WRITE;
    array_name: YASLArrayObj;
    value: YASLNativeValueWrapper;
}

export interface YASLTracerArrayRead extends YASLTracer {
    type: TracerType.ARRAY_READ;
    array_name: YASLArrayObj;
    read_index: number;
}

export interface YASLTracerArraySwap extends YASLTracer {
    type: TracerType.ARRAY_SWAP;
    array_name: YASLArrayObj;
    index1: number;
    index2: number;
}

export interface YASLTracerJump extends YASLTracer {
    type: TracerType.JUMP;
    target_line: number;
}

export interface YASLTracerConditionEvaluation extends YASLTracer {
    type: TracerType.CONDITION_EVALUATION;
    condition_value: boolean;
}