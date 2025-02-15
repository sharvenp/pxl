import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

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

            let x0 = this._dragStartX;
            let y0 = this._dragStartY;
            let x1 = mouseEvent.coords.x;
            let y1 = mouseEvent.coords.y;

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

            let pxWidth = this._thicknessProperty.value;

            if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
                // dragging stopped, draw line

                let coordsFrom = grid.reflectCoordinates({ x: x0, y: y0 }, 1, 1);
                let coordsTo = grid.reflectCoordinates({ x: x1, y: y1 }, 1, 1);
                let zippedCoords = coordsFrom.map(function (e, i) {
                    return { c1: e, c2: coordsTo[i] };
                });
                zippedCoords.forEach(coordPairs => {
                    this._drawGraphic.moveTo(coordPairs.c1.x, coordPairs.c1.y)
                        .lineTo(coordPairs.c2.x, coordPairs.c2.y)
                        .stroke({ width: pxWidth, color: color.colorHex, pixelLine: pxWidth === 1 });
                });

                grid.draw(this._drawGraphic);

                this._resetDrag();
                this.newGraphic();
                grid?.render();
            }

            // draw preview line
            if (this._isDragging) {

                cursor.clearCursor();

                let coordsFrom = grid.reflectCoordinates({ x: x0, y: y0 }, 1, 1);
                let coordsTo = grid.reflectCoordinates({ x: x1, y: y1 }, 1, 1);
                let zippedCoords = coordsFrom.map(function (e, i) {
                    return { c1: e, c2: coordsTo[i] };
                });
                zippedCoords.forEach(coordPairs => {
                    cursor.cursorGraphic.moveTo(coordPairs.c1.x, coordPairs.c1.y)
                        .lineTo(coordPairs.c2.x, coordPairs.c2.y)
                        .stroke({ width: pxWidth, color: CURSOR_PREVIEW_COLOR, pixelLine: pxWidth === 1 });
                });

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