import { OperationDispatcher } from "../operations/OperationDispatcher";
import { CaretModel } from "./CaretModel";
import type { DocumentModel } from "./DocumentModel";

export class EditorModel {
    // readonly document: DocumentModel;
    private carets: CaretModel[] = [];
    private selection: Selection[] = [];
    private opDispatcher = new OperationDispatcher(this);
    constructor(private readonly doc: DocumentModel) {}

    getCaret(): CaretModel {
        if(this.carets.length== 0){
            this.carets.push(new CaretModel())
        }
        return this.carets[0]!;
    }

    getOpDispatcher(): OperationDispatcher {
        return this.opDispatcher;
    }
    get document() {
        return this.doc;
    }
}
