import { OperationDispatcher } from "../operations/OperationDispatcher";
import { CaretModel } from "./CaretModel";
import type { DocumentModel } from "./DocumentModel";

export class EditorModel {
    // readonly document: DocumentModel;
    private caret: CaretModel= new CaretModel();
    private selection: Selection[] = [];
    private opDispatcher = new OperationDispatcher(this);
    constructor(private readonly doc: DocumentModel) {}

    getCarets(): CaretModel {
        return this.caret;
    }

    getOpDispatcher(): OperationDispatcher {
        return this.opDispatcher;
    }
    get document() {
        return this.doc;
    }
}
