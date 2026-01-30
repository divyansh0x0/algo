import type { YToken } from "../YToken";

export interface YParserError {
    message: string;
    token: YToken;
    highlight: string;
    start_col: number;
    end_col: number;
    start_line: number;
    end_line: number;
}