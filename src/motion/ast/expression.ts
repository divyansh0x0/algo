import { Token } from "@/motion/tokens/token";

export interface Expression {
    left: Expression;
    op: Token;
    right: Expression;
}
