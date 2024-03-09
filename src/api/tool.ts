import { APIScope, Events, InstanceAPI, PixelCoordinates } from ".";
import { Eraser, Pencil, Picker, Tool, ToolType } from "./tools";

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
        this._tools[ToolType.PENCIL] = new Pencil(this.$iApi)
        this._tools[ToolType.ERASER] = new Eraser(this.$iApi)
        this._tools[ToolType.PICKER] = new Picker(this.$iApi)

        // default to pencil
        // TODO: load correct tool from save state
        this.selectTool(ToolType.PENCIL);

        // setup handlers
        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_DRAG_START, (evt: any) => {
            if (this._selectedTool) {
                if (this._selectedTool.showPreviewOnInvoke) {
                    this.previewCursor(evt.coords.pixel);
                    this.invokeAction(evt.coords.pixel);
                } else {
                    this.$iApi.cursor.clearCursor();
                    this.invokeAction(evt.coords.pixel);
                }
            }
        }));

        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_MOVE, (evt: any) => {
            if (evt.isDragging) {
                if (this._selectedTool?.showPreviewOnInvoke) {
                    this.previewCursor(evt.coords.pixel);
                }
                this.invokeAction(evt.coords.pixel);
            } else {
                this.previewCursor(evt.coords.pixel);
            }
        }));

        this.handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_LEAVE, () => {
            // clear the cursor
            this.$iApi.cursor.clearCursor();
        }));
    }

    destroy(): void {
        this.handlers.forEach(h => this.$iApi.event.off(h));
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        if (this._selectedTool) {
            this._selectedTool.invokeAction(pixelCoords);
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        if (this._selectedTool) {
            this._selectedTool.previewCursor(pixelCoords);
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