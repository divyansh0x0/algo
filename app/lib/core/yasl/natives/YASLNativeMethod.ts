import type { TraceList } from "../tracer/TraceList";
import type { YASLNativeValue } from "./YASLNativeValue";

export interface YASLNativeMethodContext {
    line: number;
    tracer: TraceList;
    error?: string;
}

export type YASLNativeMethod<T> = (target: T, args: YASLNativeValue[], context: YASLNativeMethodContext) => YASLNativeValue;