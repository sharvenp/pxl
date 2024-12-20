import { InstanceAPI } from '..';
import { Tool, CheckboxProperty } from '.'
import { Events, GridMouseEvent, ToolType } from '../utils';

export class Ellipse extends Tool {

    private _fillProperty: CheckboxProperty;
    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ELLIPSE);

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

            let x = Math.min(this._dragStartX, mouseEvent.coords.pixel.x);
            let y = Math.min(this._dragStartY, mouseEvent.coords.pixel.y);
            let w = Math.abs(x - Math.max(this._dragStartX, mouseEvent.coords.pixel.x) - 1);
            let h = Math.abs(y - Math.max(this._dragStartY, mouseEvent.coords.pixel.y) - 1);

            // is the user dragging in reverse?
            let rev = (x < this._dragStartX) || (y < this._dragStartY);

            // If in alt-mode, snap to nearest square
            if (this.$iApi.tool.isAltMode) {

                // get closest snap width/height
                // adjust the x, y if in reverse
                if (h > w) {
                    x -= rev ? (h - w) : 0;
                    w = h;
                } else if (h < w) {
                    y -= rev ? (w - h) : 0;
                    h = w;
                }
            }

            if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
                // dragging stopped, draw ellipse
                grid.color = color.colorRGBA;
                grid.ellipse({x, y}, w, h, this._fillProperty.value);

                this.$iApi.history.push();

                this._resetDrag();
            }

            // draw preview ellipse
            if (this.$iApi.cursor.grid && this._isDragging) {
                this.$iApi.cursor.grid.ellipse({x, y}, w, h, this._fillProperty.value);
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