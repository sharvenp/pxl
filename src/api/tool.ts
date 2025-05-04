import { APIScope, InstanceAPI } from ".";
import { Clone, Ellipse, Eraser, Fill, Line, Pencil, Picker, Rectangle, Select, Shade, Tool } from "./tools";
import { Events, GridMouseEvent, PixelCoordinates, ToolType } from "./utils";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;
    private _isAltMode: boolean;
    private readonly _tools: Record<string, Tool>;

    private _handlers: Array<string>;
    private _trackedPixels: Set<number>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._tools = {};
        this._trackedPixels = new Set();
        this._handlers = [];
        this._isAltMode = false;

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
        this._tools[ToolType.CLONE] = new Clone(this.$iApi);

        // setup _handlers
        this._handlers.push(this.$iApi.event.on(Events.MOUSE_DRAG_START, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool && mouseEvt.isOnCanvas) {
                if (this._selectedTool.toolConfiguration.showPreviewOnInvoke) {
                    this.previewCursor(mouseEvt);
                } else {
                    this.$iApi.canvas.cursor?.clearCursor();
                }
                this.invokeAction(mouseEvt, event);
            }
        }));

        this._handlers.push(this.$iApi.event.on(Events.MOUSE_DRAG_STOP, (mouseEvt: GridMouseEvent, event: Events) => {
            if (this._selectedTool) {
                this.invokeAction(mouseEvt, event);
            }
            if (mouseEvt.isOnCanvas) {
                this.previewCursor(mouseEvt);
            }
            this._stopTracking();
        }));

        this._handlers.push(this.$iApi.event.on(Events.MOUSE_MOVE, (mouseEvt: GridMouseEvent, event: Events) => {

            // invoke only if it on canvas
            if (this._selectedTool && mouseEvt.isOnCanvas) {
                if (mouseEvt.isDragging) {
                    if (this._selectedTool.toolConfiguration.showPreviewOnInvoke) {
                        this.previewCursor(mouseEvt);
                    }
                    if (this._selectedTool.toolConfiguration.invokeOnMove) {
                        this.invokeAction(mouseEvt, event);
                    }
                } else {
                    this.previewCursor(mouseEvt);
                }
            }
        }));

        this._handlers.push(this.$iApi.event.on(Events.CANVAS_MOUSE_LEAVE, (event: Events) => {

            // clear the cursor
            this.$iApi.canvas.cursor?.clearCursor();

            // clear tracking set
            this._stopTracking();
        }));

        // default to pencil if not set
        this._selectedTool = this._tools[this.$iApi.state.loadedState?.selectedTool ?? ToolType.PENCIL];
        this._selectedTool.init();
    }

    destroy(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
        Object.values(this._tools).forEach(tool => {
            tool.drawGraphic.destroy();
            tool.destroy()
        });
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        if (this._selectedTool) {
            if (!this._checkTracking(mouseEvent.coords) || !mouseEvent.isDragging) {

                // only update the pixel tracking if mouse is being dragged
                if (mouseEvent.isDragging) {
                    this._updateTracking(mouseEvent.coords);
                }

                this._selectedTool.invokeAction(mouseEvent, event);
                this.$iApi.history.update();
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
            this._selectedTool.destroy();
            this.$iApi.canvas.cursor?.clearCursor();
        }

        this._selectedTool = this._tools[tool];
        this._selectedTool.init();

        this.$iApi.event.emit(Events.TOOL_SELECT, tool);
    }

    toggleAltMode(mode: boolean): void {
        this._isAltMode = mode;
        this.$iApi.event.emit(Events.TOOL_ALT_MODE_UPDATE, mode);
    }

    private _checkTracking(coords: PixelCoordinates): boolean {

        if (this._selectedTool?.toolConfiguration.trackPixels === false) {
            // short-circuit
            return false;
        }

        const canvas = this.$iApi.canvas;
        if (canvas) {
            return this._trackedPixels.has(coords.y * canvas.height + coords.x);
        }
        return true;
    }

    private _updateTracking(coords: PixelCoordinates): void {

        if (this._selectedTool?.toolConfiguration.trackPixels === false) {
            return;
        }

        const canvas = this.$iApi.canvas;
        if (canvas) {
            this._trackedPixels.add(coords.y * canvas.height + coords.x);
        }
    }

    private _stopTracking(): void {
        this._trackedPixels.clear();
    }

    get selectedTool(): Tool | undefined {
        return this._selectedTool;
    }

    get isAltMode(): boolean {
        return this._isAltMode;
    }

    get tools(): Array<Tool> {
        return Object.values(this._tools);
    }
}