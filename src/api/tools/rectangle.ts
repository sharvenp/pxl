import { Events, GridMouseEvent, InstanceAPI } from '..';
import { Tool, ToolType, CheckboxProperty } from '.'

export class Rectangle extends Tool {

    private _fillProperty: CheckboxProperty;
    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.RECTANGLE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;
        this._trackPixels = false;

        this._fillProperty = new CheckboxProperty("Fill", false);

        this._toolProperties = [
            this._fillProperty
        ]

        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid) {

            this.$iApi.cursor.clearCursor();
            if (event === Events.CANVAS_MOUSE_LEAVE) {
                // mouse left canvas, do nothing
                this._resetDrag();
                return;
            }

            if (mouseEvent.isDragging) {
                if (!this._isDragging) {
                    this._dragStartX = mouseEvent.coords.pixel.x;
                }
                if (!this._isDragging) {
                    this._dragStartY = mouseEvent.coords.pixel.y;
                }
                this._isDragging = true;
            }

            let x = Math.min(this._dragStartX, mouseEvent.coords.pixel.x);
            let y = Math.min(this._dragStartY, mouseEvent.coords.pixel.y);
            let w = Math.abs(x - Math.max(this._dragStartX, mouseEvent.coords.pixel.x) - 1);
            let h = Math.abs(y - Math.max(this._dragStartY, mouseEvent.coords.pixel.y) - 1);

            if (!mouseEvent.isDragging && this._isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                // dragging stopped, draw rectangle
                grid.color = color.colorRGBA;
                grid.rect({x, y}, w, h, this._fillProperty.value);

                this._resetDrag();
            }

            // draw preview rectangle
            if (this.$iApi.cursor.grid && this._isDragging) {
                this.$iApi.cursor.grid.rect({x, y}, w, h, this._fillProperty.value);
            }
        }
    }

    dispose(): void {
        this._resetDrag();
    }

    private _resetDrag(): void {
        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
    }
}