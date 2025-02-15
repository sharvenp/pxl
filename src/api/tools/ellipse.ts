import { InstanceAPI } from '..';
import { Tool, CheckboxProperty, SliderProperty } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

export class Ellipse extends Tool {

    private _fillProperty: CheckboxProperty;
    private _widthProperty: SliderProperty;
    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ELLIPSE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;
        this._trackPixels = false;

        this._fillProperty = new CheckboxProperty("Fill", false);
        this._widthProperty = new SliderProperty("Width", 1, 10, 1, 'px');

        this._toolProperties = [
            this._fillProperty,
            this._widthProperty
        ]

        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let cursor = this.$iApi.canvas.cursor;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && cursor) {

            if (!mouseEvent.isOnCanvas) {
                this._resetDrag();
                return;
            }

            cursor.clearCursor();

            if (mouseEvent.isDragging) {
                if (!this._isDragging) {
                    this._dragStartX = mouseEvent.coords.x;
                }
                if (!this._isDragging) {
                    this._dragStartY = mouseEvent.coords.y;
                }
                this._isDragging = true;
            }

            let x = Math.min(this._dragStartX, mouseEvent.coords.x);
            let y = Math.min(this._dragStartY, mouseEvent.coords.y);
            let w = Math.abs(x - Math.max(this._dragStartX, mouseEvent.coords.x) - 1);
            let h = Math.abs(y - Math.max(this._dragStartY, mouseEvent.coords.y) - 1);

            // is the user dragging in reverse?
            let xRev = (x < this._dragStartX);
            let yRev = (y < this._dragStartY);

            // If in alt-mode, snap to nearest square
            if (this.$iApi.tool.isAltMode) {

                // get closest snap width/height
                // adjust the x, y if in reverse
                if (h > w) {
                    x -= xRev ? (h - w) : 0;
                    w = h;
                } else if (h < w) {
                    y -= yRev ? (w - h) : 0;
                    h = w;
                }
            }

            // adjust width and height into axis radii
            w = Math.floor(w / 2);
            h = Math.floor(h / 2);

            // offset x and y
            x += w;
            y += h;

            // dont draw if width or height is 0
            if (w === 0 || h === 0) {
                return;
            }

            if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
                // dragging stopped, draw ellipse
                this._drawGraphic.blendMode = 'normal';
                this._drawGraphic.roundPixels = false;

                let reflectedCoords = grid.reflectCoordinates({ x, y }, 1, 1);
                reflectedCoords.forEach(c => {
                    this._drawGraphic.ellipse(c.x, c.y, w, h);
                });

                if (this._fillProperty.value) {
                    this._drawGraphic.fill(color.colorHex);
                } else {
                    this._drawGraphic.stroke({ width: this._widthProperty.value, color: color.colorHex, pixelLine: this._widthProperty.value === 1 });
                }

                grid.draw(this._drawGraphic);

                this._resetDrag();
                this.newGraphic();
                grid?.render();
            }

            // draw preview ellipse
            if (this._isDragging) {

                cursor.clearCursor();
                cursor.cursorGraphic.roundPixels = false;

                let reflectedCoords = grid.reflectCoordinates({ x, y }, 1, 1);
                reflectedCoords.forEach(c => {
                    cursor.cursorGraphic.ellipse(c.x, c.y, w, h);
                });

                if (this._fillProperty.value) {
                    cursor.cursorGraphic.fill(CURSOR_PREVIEW_COLOR);
                } else {
                    cursor.cursorGraphic.stroke({ width: this._widthProperty.value, color: CURSOR_PREVIEW_COLOR, pixelLine: this._widthProperty.value === 1 });
                }
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