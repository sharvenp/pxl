import { Events, GridMouseEvent, InstanceAPI } from '..';
import { Tool, ToolType, CheckboxProperty } from '.'

export class Circle extends Tool {

    private _fillProperty: CheckboxProperty;
    private dragStartX: number;
    private dragStartY: number;
    private isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.CIRCLE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;

        this._fillProperty = new CheckboxProperty("Fill", false);

        this._toolProperties = [
            this._fillProperty
        ]

        this.dragStartX = -1;
        this.dragStartY = -1;
        this.isDragging = false;
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
                if (!this.isDragging) {
                    this.dragStartX = mouseEvent.coords.pixel.x;
                }
                if (!this.isDragging) {
                    this.dragStartY = mouseEvent.coords.pixel.y;
                }
                this.isDragging = true;
            }

            let x = Math.min(this.dragStartX, mouseEvent.coords.pixel.x);
            let y = Math.min(this.dragStartY, mouseEvent.coords.pixel.y);
            let w = Math.abs(x - Math.max(this.dragStartX, mouseEvent.coords.pixel.x) - 1);
            let h = Math.abs(y - Math.max(this.dragStartY, mouseEvent.coords.pixel.y) - 1);

            if (!mouseEvent.isDragging && this.isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                // dragging stopped, draw rectangle
                grid.color = color.colorRGBA;
                grid.circle({x, y}, w, h, this._fillProperty.value);

                this._resetDrag();
            }

            // draw preview rectangle
            if (this.$iApi.cursor.grid && this.isDragging) {
                this.$iApi.cursor.grid.circle({x, y}, w, h, this._fillProperty.value);
            }
        }
    }

    previewCursor(): void {
        // preview handled by invoke
        return;
    }

    private _resetDrag(): void {
        this.dragStartX = -1;
        this.dragStartY = -1;
        this.isDragging = false;
    }
}