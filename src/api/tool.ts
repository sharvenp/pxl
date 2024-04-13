import { APIScope, Events, InstanceAPI, GridMouseEvent } from ".";
import { Eraser, Fill, Pencil, Picker, Tool, ToolType } from "./tools";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;
    private readonly _tools: Record<string, Tool> = {};

    private handlers: Array<string> = [];

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.initialize();
    }

    initialize(): void {

        // TODO: add all the tools
        this._tools[ToolType.PENCIL] = new Pencil(this.$iApi);
        this._tools[ToolType.ERASER] = new Eraser(this.$iApi);
        this._tools[ToolType.PICKER] = new Picker(this.$iApi);
        this._tools[ToolType.FILL] = new Fill(this.$iApi);

        // default to pencil
        // TODO: load correct tool from save state
        this.selectTool(ToolType.PENCIL);

        // setup handlers
        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_DRAG_START, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool) {
                if (this._selectedTool.showPreviewOnInvoke) {
                    this.previewCursor(mouseEvt);
                } else {
                    this.$iApi.cursor.clearCursor();
                }
                this.invokeAction(mouseEvt, event);
            }
        }));

        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_DRAG_STOP, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool) {
                this.invokeAction(mouseEvt, event);
            }
        }));

        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_MOVE, (mouseEvt: GridMouseEvent, event: Events) => {
            if (mouseEvt.isDragging && this._selectedTool) {
                if (this._selectedTool.showPreviewOnInvoke) {
                    this.previewCursor(mouseEvt);
                }
                if (this._selectedTool.invokeOnMove) {
                    this.invokeAction(mouseEvt, event);
                }
            } else {
                this.previewCursor(mouseEvt);
            }
        }));

        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_LEAVE, (mouseEvt: GridMouseEvent, event: Events) => {
            // clear the cursor
            this.$iApi.cursor.clearCursor();
            if (this._selectedTool) {
                this.invokeAction(mouseEvt, event);
            }
        }));
    }

    destroy(): void {
        this.handlers.forEach(h => this.$iApi.event.off(h));
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        if (this._selectedTool) {
            this._selectedTool.invokeAction(mouseEvent, event);
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this._selectedTool) {
            this._selectedTool.previewCursor(event);
        }
    }

    selectTool(tool: ToolType): void {
        this._selectedTool = this._tools[tool];
        this.$iApi.event.emit(Events.TOOL_SELECT, tool);
    }

    get selectedTool(): Tool | undefined {
        return this._selectedTool;
    }
}