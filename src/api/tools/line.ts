import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { Events, GridMouseEvent, ToolType } from '../utils';

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
        if (color && grid && mouseEvent.isOnCanvas) {

            if (!mouseEvent.isOnCanvas) {
                // mouse left canvas, do nothing
                return;
            }

            this.$iApi.cursor.clearCursor();

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

            // If in alt-mode, snap the line to fixed angles
            if (this.$iApi.tool.isAltMode) {

                // get closest snap angle

                if (Math.abs(x0 - x1) < Math.abs(y0 - y1)) {
                    // snap to vertical line
                    x1 = x0;
                } else if (Math.abs(y0 - y1) < Math.abs(x0 - x1)) {
                    // snap to horizontal line
                    y1 = y0
                }

                // else, snap to diagonal
            }

            if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
                // dragging stopped, draw line
                grid.color = color.colorRGBA;
                grid.line({x: x0, y: y0}, {x: x1, y: y1}, this._thicknessProperty.value);

                this.$iApi.history.push();

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