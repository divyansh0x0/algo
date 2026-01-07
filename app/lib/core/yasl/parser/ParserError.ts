import type { YASLToken } from "../YASLToken";

export interface ParserError {
    message: string;
    token: YASLToken;
    highlight: string;
    start_col: number;
    end_col: number;
    start_line: number;
    end_line: number;
}