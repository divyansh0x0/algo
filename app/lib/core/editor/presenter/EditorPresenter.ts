import type { DocumentModel } from "../model/DocumentModel";
import type { EditorView } from "../view/EditorView";

export class EditorPresenter {
    constructor(private view:EditorView, private document:DocumentModel) {

    }
}