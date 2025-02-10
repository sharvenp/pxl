import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

export class Pencil extends Tool {

    private _brushWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PENCIL);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;

        this._brushWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px');

        this._toolProperties = [
            this._brushWidthProperty,
        ]
    }

    initialize(): void {
        this._drawGraphic.blendMode = 'normal';
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {
            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(mouseEvent.coords.x - (pxWidth / 2.0));
            let y = Math.round(mouseEvent.coords.y - (pxWidth / 2.0));

            let coordsToDraw = grid.reflectCoordinates({ x, y }, -(pxWidth - 1), -(pxWidth - 1));
            coordsToDraw.forEach(c => {
                this._drawGraphic.rect(c.x, c.y, pxWidth, pxWidth).fill(color.colorHex);
            });
            grid.draw(this._drawGraphic);
        }

        if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
            this.newGraphic();
            grid?.render();
        }
    }

    previewCursor(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid;
        let cursor = this.$iApi.canvas.cursor;
        if (cursor && grid) {

            let pxWidth = this._brushWidthProperty.value;
            let x = Math.round(event.coords.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.y - (pxWidth / 2.0));

            const graphic = cursor.cursorGraphic
            graphic.clear();

            let coordsToDraw = grid.reflectCoordinates({ x, y }, -(pxWidth - 1), -(pxWidth - 1));
            coordsToDraw.forEach(c => {
                graphic.rect(c.x, c.y, pxWidth, pxWidth).fill(CURSOR_PREVIEW_COLOR);
            });

        }
    }
}