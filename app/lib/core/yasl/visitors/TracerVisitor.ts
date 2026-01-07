import { YASLNativeValue, YASLNodeTypeChecker, type YASLPossibleNativeValue, YASLTokenType } from "~/lib/core/yasl";
import { YASLEnvironment } from "~/lib/core/yasl/environment/environment";
import { YASLArrayObj } from "~/lib/core/yasl/natives/YASLArrayObj";
import { TraceList } from "~/lib/core/yasl/tracer/TraceList";
import type { Visitor } from "~/lib/core/yasl/visitors/Visitor";
import type { YASLMemPointer } from "../environment/YASLMemPointer";
import { YASLArrayNativeMethods } from "../natives/methods/YASLArrayNativeMethods";
import { YASLRuntimeContext } from "../tracer/YASLRuntimeError";
import { YASLNodeType } from "../YASLAst";
import type {
    DefArrayNode,
    DefFunctionNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpCallNode,
    ExpIdentifierNode,
    ExpLiteralNode,
    ExpPropertyAccessNode,
    ExpTernaryNode,
    ExpUnaryNode,
    OpIndexingNode,
    OpPostfixNode,
    StmtBlockNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    StmtElseIfNode,
    StmtElseNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    YASLNode
} from "../YASLNode";
import { YASLError } from "./YASLError";
import { YASLNull, type YASLRuntimeValue } from "./YASLRuntimeValue";

function CreateYaslRuntimeValue(val: YASLPossibleNativeValue): YASLRuntimeValue{
    return { kind: "value", value: new YASLNativeValue(val) };
}

export class TracerVisitor implements Visitor<YASLRuntimeValue> {
    private next_node: YASLNode | null = null;
    private rootScope: YASLEnvironment;
    private currentScope: YASLEnvironment;
    private line: number = 0;
    private tracerList: TraceList = new TraceList();
    private ctx = new YASLRuntimeContext();
    private raiseTypeError(nodes: YASLNode[]){
        this.ctx.raise({
            nodes[0],
            kind: "TypeError",
            message: "Expected value"
        });
        throw new YASLError("TypeError");
    }
    private expectRef(
        node:YASLNode,
    ):  { kind: "ref"; ref: YASLMemPointer } {
        const rv = node.accept(this);
        if (rv.kind !== "ref") {
            this.ctx.raise({
                node,
                kind: "ReferenceError",
                message: "Expected reference"
            });
            throw new YASLError("TypeError");
        }
        return rv;
    }

    private expectValue(
        node:YASLNode
    ): { kind: "value"; value: YASLNativeValue }  {
        const rv = node.accept(this);
        if (rv.kind !== "value") {
            this.ctx.raise({
                node,
                kind: "TypeError",
                message: "Expected value"
            });
            throw new YASLError("TypeError");
        }
        return rv;
    }
    visitDefArray(node: DefArrayNode): YASLRuntimeValue {
        const arr: YASLArrayObj = new YASLArrayObj();
        for (const element of node.elements) {
            const val = this.expectValue(element).value;
            arr.push(val);
        }
        return {kind: "value", value: new YASLNativeValue(arr)};
    }

    visitDefFunction(node: DefFunctionNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitExpAssign(node: ExpAssignNode): YASLRuntimeValue {
        const lvalue = this.expectRef(node.lvalue);
        // const rvalue = node.rvalue;
        const rvalue = this.expectValue(node.rvalue);


        lvalue.ref.set(rvalue.value);
        return rvalue;
    }

    visitExpBinary(node: ExpBinaryNode): YASLRuntimeValue {
        // For inline assign operations
        if(node.op === YASLTokenType.INLINE_ASSIGN){
            const operand1 = this.expectRef(node.expLeft).ref;
            const operand2 = this.expectValue(node.expRight).value;
            operand1.set(operand2)
            return CreateYaslRuntimeValue(operand2.value)
        }

        // For normal binary operations
        const operand1 = this.expectValue(node.expLeft).value;
        const operand2 = this.expectValue(node.expRight).value;
        switch (node.op) {
            case YASLTokenType.PLUS: {
                // Number addition
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value + operand2.value);
                }
                // String concatenation
                if(operand1.isString() && operand2.isString()) {
                    return CreateYaslRuntimeValue(operand1.value.concat(operand2.value));
                }
                break;
            }
            case YASLTokenType.MINUS:
                // Number subtraction
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value - operand2.value);
                }
                break;
            case YASLTokenType.MULTIPLY:
                // Number multiplication
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value * operand2.value);
                }

                // String duplication
                if(operand1.isString() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value.repeat(operand2.value));
                }
                break;
            case YASLTokenType.DIVIDE:
                // Number division
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value / operand2.value);
                }
                break;
            case YASLTokenType.MODULO:
                // Number remainder
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value % operand2.value);
                }
                break;
            case YASLTokenType.BIT_AND:
                // BITWISE AND
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value & operand2.value);
                }
                break;
            case YASLTokenType.BIT_OR:
                // BITWISE OR
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value | operand2.value);
                }
                break;
            case YASLTokenType.BIT_XOR:
                // BITWISE XOR
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value ^ operand2.value);
                }
                break;
            case YASLTokenType.BIT_SHIFT_LEFT:
                // BITSHIFT LEFT
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value << operand2.value);
                }
                break;
            case YASLTokenType.BIT_SHIFT_RIGHT:
                // BITSHIFT RIGHT
                if(operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslRuntimeValue(operand1.value << operand2.value);
                }

                break;
            case YASLTokenType.AND:
                // Logical AND
                if(operand1.isBoolean() && operand2.isBoolean()) {
                    return CreateYaslRuntimeValue(operand1.value && operand2.value);
                }
                break;
            case YASLTokenType.OR:
                // Logical AND
                if(operand1.isBoolean() || operand2.isBoolean()) {
                    return CreateYaslRuntimeValue(operand1.value && operand2.value);
                }
                break;
            default:
                this.ctx.raise({
                    node,
                    message:"Invalid operator",
                    kind:"RuntimeError"
                });
        }
        throw new YASLError("Invalid binary operation");
    }

    visitExpCall(node: ExpCallNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitExpLiteral(node: ExpLiteralNode): YASLRuntimeValue {
        return {kind:"value", value: node.value};
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): YASLRuntimeValue {
       switch (node.curr_node.type){
           case YASLNodeType.EXP_IDENTIFIER:{
               const parent = this.expectRef(node.curr_node);
               const method = node.member_node;
               const arr =parent.ref.get();
               if(arr.isArray() && YASLNodeTypeChecker.isFunctionCall(method)){
                   const identifier = method.qualifiedName;
                   if(YASLNodeTypeChecker.isIdentifier(identifier)){
                       if(!YASLArrayNativeMethods.has(identifier.name))
                            this.ctx.raiseMethodNotFound(method)
                       else{
                           const nativeVals = method.args.map(arg => this.expectValue(arg).value);
                           YASLArrayNativeMethods.call(identifier.name, arr.value, nativeVals, {tracer:this.tracerList, line: this.line});
                       }
                   }
               }

           }
       }

        return YASLNull;
    }

    visitExpTernary(node: ExpTernaryNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitExpUnary(node: ExpUnaryNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitExpIdentifier(node: ExpIdentifierNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitOpIndexing(node: OpIndexingNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitOpPostfix(node: OpPostfixNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtBlock(node: StmtBlockNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtBreak(node: StmtBreakNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtCase(node: StmtCaseNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtContinue(node: StmtContinueNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtDeclaration(node: StmtDeclarationNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtElse(node: StmtElseNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtFor(node: StmtForNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtIf(node: StmtIfNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtIfElse(node: StmtElseIfNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtReturn(node: StmtReturnNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtSwitch(node: StmtSwitchNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtThen(node: StmtThenNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitStmtWhile(node: StmtWhileNode): YASLRuntimeValue {
        return YASLNull;

    }

}