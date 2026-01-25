import type { YASLNativeValueWrapper } from "../natives/YASLNativeValueWrapper";
import type { YASLArrayObj } from "../natives/YASLArrayObj";
import type { YASLTokenBinaryOp, YASLTokenUnaryOp } from "../YASLToken";
import {
    TracerType,
    type YASLTracer,
    type YASLTracerArrayRead,
    type YASLTracerArraySwap,
    type YASLTracerArrayWrite,
    type YASLTracerAssignVariable,
    type YASLTracerBinaryOperation,
    type YASLTracerConditionEvaluation,
    type YASLTracerDeclareVariable,
    type YASLTracerJump,
    type YASLTracerUnaryOperation
} from "./Tracers";

export class TraceList {
    traces: YASLTracer[] = [];
    listener: ((trace: YASLTracer) => void) | null = null;

    get last() {
        return this.traces[this.traces.length - 1];
    }

    emitDeclareVariable(variable_name: string, line: number, assigned_value?: YASLNativeValueWrapper) {
        this.emit({
            type: TracerType.DECLARE_VARIABLE,
            line,
            variable_name,
            assigned_value: assigned_value?.copy(),
        } as YASLTracerDeclareVariable);
    }

    emitAssignVariable(variable_name: string, value: YASLNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.ASSIGN_VARIABLE,
            line,
            variable_name,
            value,
        } as YASLTracerAssignVariable);
    }

    emitBinaryOperation(operator: YASLTokenBinaryOp, left: YASLNativeValueWrapper, right: YASLNativeValueWrapper, result: YASLNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.BINARY_OPERATION,
            line,
            operator,
            left,
            right,
            result,
        } as YASLTracerBinaryOperation);
    }

    emitUnaryOperation(operator: YASLTokenBinaryOp, operand: YASLTokenUnaryOp, result: YASLNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.UNARY_OPERATION,
            line,
            operator,
            operand,
            result,
        } as YASLTracerUnaryOperation);
    }

    emitArrayWrite(array_name: YASLArrayObj, value: YASLNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.ARRAY_WRITE,
            array_name,
            value,
            line
        } as YASLTracerArrayWrite);
    }

    emitArrayRead(array_name: YASLArrayObj, read_index: number, line: number) {
        this.emit({
            type: TracerType.ARRAY_READ,
            array_name,
            read_index,
            line
        } as YASLTracerArrayRead);
    }

    emitArraySwap(array_name: string, index1: number, index2: number, line: number) {
        this.emit({
            type: TracerType.ARRAY_SWAP,
            array_name,
            index1,
            index2,
            line
        } as YASLTracerArraySwap);
    }

    emitJump(target_line: number, line: number) {
        this.emit({
            type: TracerType.JUMP,
            target_line,
            line
        } as YASLTracerJump);
    }

    emitConditionEvaluation(condition_value: boolean, line: number) {
        this.emit({
            type: TracerType.CONDITION_EVALUATION,
            condition_value,
            line
        } as YASLTracerConditionEvaluation);
    }

    private emit(trace: YASLTracer) {
        this.traces.push(trace);
        if (this.listener)
            this.listener(trace);
    }

    setListener(param: (trace: YASLTracer) => void): void {
        this.listener = param;
    }
}