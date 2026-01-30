import type { YRuntimeValue } from "./YRuntimeValue";

export interface YStdIO {
    write(output:string):void;
    read():string;
}