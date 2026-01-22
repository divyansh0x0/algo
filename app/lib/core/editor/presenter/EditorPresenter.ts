import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import { OperationDispatcher } from "../operations/OperationDispatcher";
import { KeybindingService } from "../services/events/keys/KeybindingService";
import type { EditorView } from "../view/EditorView";

export class EditorPresenter {
    private doc: DocumentModel;
    private model:EditorModel;
    private keybindingService=new KeybindingService();


    constructor(private view:EditorView) {
        view.onKeyUp(this.onKeyUp.bind(this));
        view.onKeyDown(this.onKeyDown.bind(this));
        view.onMouseUp(this.onMouseUp.bind(this));
        view.onMouseDown(this.onMouseDown.bind(this));

        this.doc = new DocumentModel();
        this.model = new EditorModel(this.doc);
        this.keybindingService.setEditorModel(this.model);
    }
    private onKeyDown(event:KeyboardEvent){
        event.preventDefault();
        event.stopPropagation();

        this.keybindingService.handle(event.ctrlKey,event.altKey,event.shiftKey, event.metaKey, event.code,event.key);
        this.view.render(this.model);
    }
    private onKeyUp(event:KeyboardEvent){

    }
    private onMouseUp(event:MouseEvent){

    }
    private onMouseDown(event:MouseEvent){

    }
}