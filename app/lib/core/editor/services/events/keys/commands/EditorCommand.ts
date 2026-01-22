import type { DocumentModel } from "../../../../model/DocumentModel";

export abstract class EditorCommand{
    abstract execute(model:DocumentModel): void;
}