import { APIScope, InstanceAPI } from ".";
import { Ellipse, Eraser, Fill, Line, Pencil, Picker, Rectangle, Select, Shade, Tool } from "./tools";
import { Events, GridMouseEvent, PixelCoordinates, ToolType } from "./utils";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;
    private _altSelectToolStore: ToolType | undefined;
    private readonly _tools: Record<string, Tool> = {};

    private _handlers: Array<string> = [];
    private _trackedPixels: Set<number> = new Set();

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.initialize();
    }

    initialize(): void {

        // populate tools
        this._tools[ToolType.PENCIL] = new Pencil(this.$iApi);
        this._tools[ToolType.ERASER] = new Eraser(this.$iApi);
        this._tools[ToolType.PICKER] = new Picker(this.$iApi);
        this._tools[ToolType.FILL] = new Fill(this.$iApi);
        this._tools[ToolType.RECTANGLE] = new Rectangle(this.$iApi);
        this._tools[ToolType.ELLIPSE] = new Ellipse(this.$iApi);
        this._tools[ToolType.LINE] = new Line(this.$iApi);
        this._tools[ToolType.SHADE] = new Shade(this.$iApi);
        this._tools[ToolType.SELECT] = new Select(this.$iApi);

        // default to pencil
        // TODO: load correct tool from save state
        this.selectTool(ToolType.PENCIL);

        // setup _handlers
        this._handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_DRAG_START, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool) {
                if (this._selectedTool.showPreviewOnInvoke) {
                    this.previewCursor(mouseEvt);
                } else {
                    this.$iApi.cursor.clearCursor();
                }
                this.invokeAction(mouseEvt, event);
            }
        }));

        this._handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_DRAG_STOP, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool) {
                this.invokeAction(mouseEvt, event);
            }
            // clear tracking set
            this._stopTracking();
        }));

        this._handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_MOVE, (mouseEvt: GridMouseEvent, event: Events) => {
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

        this._handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_LEAVE, (mouseEvt: GridMouseEvent, event: Events) => {
            // clear the cursor
            this.$iApi.cursor.clearCursor();

            if (this._selectedTool) {
                this.invokeAction(mouseEvt, event);
            }

            // clear tracking set
            this._stopTracking();
        }));
    }

    destroy(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        if (this._selectedTool) {

            if (!this._checkTracking(mouseEvent.coords.pixel)) {

                // only update the pixel tracking if mouse is being dragged
                if (mouseEvent.isDragging) {
                    this._updateTracking(mouseEvent.coords.pixel);
                }

                this._selectedTool.invokeAction(mouseEvent, event);
            }
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this._selectedTool) {
            this._selectedTool.previewCursor(event);
        }
    }

    selectTool(tool: ToolType): void {
        if (this._selectedTool) {
            this._selectedTool.dispose();
            this.$iApi.cursor?.clearCursor();
        }

        this._selectedTool = this._tools[tool];
        this._selectedTool.initalize();

        this.$iApi.event.emit(Events.TOOL_SELECT, tool);
    }

    altSelectTool(tool: ToolType): void {
        this._altSelectToolStore = this._selectedTool?.toolType;

        this.selectTool(tool);
    }

    altSelectToolReset(): void {
        if (this._altSelectToolStore !== undefined) {
            this.selectTool(this._altSelectToolStore);
        }
    }

    private _checkTracking(coords: PixelCoordinates): boolean {

        if (this._selectedTool?.trackPixels === false) {
            // short-circuit
            return false;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {
            return this._trackedPixels.has(coords.y * grid.pixelHeight + coords.x);
        }
        return true;
    }

    private _updateTracking(coords: PixelCoordinates): void {

        if (this._selectedTool?.trackPixels === false) {
            return;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {
            this._trackedPixels.add(coords.y * grid.pixelHeight + coords.x);
        }
    }

    private _stopTracking(): void {
        this._trackedPixels.clear();
    }

    get selectedTool(): Tool | undefined {
        return this._selectedTool;
    }
}