import type { TraceList } from "../tracer/TraceList";
import type { YASLNativeValueWrapper } from "./YASLNativeValueWrapper";

export interface YASLNativeMethodContext {
    line: number;
    tracer: TraceList;
    identifier?: string;
    error?: string;
}

export type YASLNativeMethod<T> = (target: T, args: YASLNativeValueWrapper[], context: YASLNativeMethodContext) => YASLNativeValueWrapper;