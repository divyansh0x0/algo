import type { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import type { YArrayObj } from "../natives/YArrayObj";
import type { YTokenBinaryOp, YTokenUnaryOp } from "../YToken";
import {
    TracerType,
    type YTracer,
    type YTracerArrayRead,
    type YTracerArraySwap,
    type YTracerArrayWrite,
    type YTracerAssignVariable,
    type YTracerBinaryOperation,
    type YTracerConditionEvaluation,
    type YTracerDeclareVariable,
    type YTracerJump,
    type YTracerUnaryOperation
} from "./YTracers";

export class YTraceList {
    traces: YTracer[] = [];
    listener: ((trace: YTracer) => void) | null = null;

    get last() {
        return this.traces[this.traces.length - 1];
    }

    emitDeclareVariable(variable_name: string, line: number, assigned_value?: YNativeValueWrapper) {
        this.emit({
            type: TracerType.DECLARE_VARIABLE,
            line,
            variable_name,
            assigned_value: assigned_value?.copy(),
        } as YTracerDeclareVariable);
    }

    emitAssignVariable(variable_name: string, value: YNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.ASSIGN_VARIABLE,
            line,
            variable_name,
            value,
        } as YTracerAssignVariable);
    }

    emitBinaryOperation(operator: YTokenBinaryOp, left: YNativeValueWrapper, right: YNativeValueWrapper, result: YNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.BINARY_OPERATION,
            line,
            operator,
            left,
            right,
            result,
        } as YTracerBinaryOperation);
    }

    emitUnaryOperation(operator: YTokenBinaryOp, operand: YTokenUnaryOp, result: YNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.UNARY_OPERATION,
            line,
            operator,
            operand,
            result,
        } as YTracerUnaryOperation);
    }

    emitArrayWrite(array_name: YArrayObj, value: YNativeValueWrapper, line: number) {
        this.emit({
            type: TracerType.ARRAY_WRITE,
            array_name,
            value,
            line
        } as YTracerArrayWrite);
    }

    emitArrayRead(array_name: YArrayObj, read_index: number, line: number) {
        this.emit({
            type: TracerType.ARRAY_READ,
            array_name,
            read_index,
            line
        } as YTracerArrayRead);
    }

    emitArraySwap(array_name: string, index1: number, index2: number, line: number) {
        this.emit({
            type: TracerType.ARRAY_SWAP,
            array_name,
            index1,
            index2,
            line
        } as YTracerArraySwap);
    }

    emitJump(target_line: number, line: number) {
        this.emit({
            type: TracerType.JUMP,
            target_line,
            line
        } as YTracerJump);
    }

    emitConditionEvaluation(condition_value: boolean, line: number) {
        this.emit({
            type: TracerType.CONDITION_EVALUATION,
            condition_value,
            line
        } as YTracerConditionEvaluation);
    }

    private emit(trace: YTracer) {
        this.traces.push(trace);
        if (this.listener)
            this.listener(trace);
    }

    setListener(param: (trace: YTracer) => void): void {
        this.listener = param;
    }
}