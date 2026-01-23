import type { EditorModel } from "../model/EditorModel";

export default interface EditorOperation{
    apply(model:EditorModel):void;
    invert():EditorOperation;
}