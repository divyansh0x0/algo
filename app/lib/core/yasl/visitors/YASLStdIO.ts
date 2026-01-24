import type { YASLRuntimeValue } from "./YASLRuntimeValue";

export interface YASLStdIO {
    write(output:string):void;
    read():string;
}