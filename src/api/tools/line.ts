import { Events, GridMouseEvent, InstanceAPI } from '..';
import { Tool, ToolType, SliderProperty, CheckboxProperty } from '.'

export class Line extends Tool {

    private _thicknessProperty: SliderProperty;

    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.LINE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;
        this._trackPixels = false;

        this._thicknessProperty = new SliderProperty("Thickness", 1, 5, 1, 'px');

        this._toolProperties = [
            this._thicknessProperty,
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

            let x0 = this._dragStartX;
            let y0 = this._dragStartY;
            let x1 = mouseEvent.coords.pixel.x;
            let y1 = mouseEvent.coords.pixel.y;

            if (!mouseEvent.isDragging && this._isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                // dragging stopped, draw line
                grid.color = color.colorRGBA;
                grid.line({x: x0, y: y0}, {x: x1, y: y1}, this._thicknessProperty.value);

                this._resetDrag();
            }

            // draw preview line
            if (this.$iApi.cursor.grid && this._isDragging) {

                this.$iApi.cursor.grid.line({x: x0, y: y0}, {x: x1, y: y1}, this._thicknessProperty.value);
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