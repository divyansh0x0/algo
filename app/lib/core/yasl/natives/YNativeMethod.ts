import type { YTraceList } from "../tracer/YTraceList";
import type { YNativeValueWrapper } from "./YNativeValueWrapper";

export interface YNativeMethodContext {
    line: number;
    tracer: YTraceList;
    identifier?: string;
    error?: string;
}

export type YNativeMethod<T> = (target: T, args: YNativeValueWrapper[], context: YNativeMethodContext) => YNativeValueWrapper;