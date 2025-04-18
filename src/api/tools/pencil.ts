import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

export class Pencil extends Tool {

    private _brushWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PENCIL);

        this._toolConfiguration.showPreviewOnInvoke = false;
        this._toolConfiguration.invokeOnMove = true;

        this._brushWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px');

        this._toolProperties = [
            this._brushWidthProperty,
        ]
    }

    initialize(): void {
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        const grid = this.$iApi.canvas.grid;
        const color = this.$iApi.palette.selectedColor;
        if (color && grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {
            const pxWidth = this._brushWidthProperty.value;

            const x = Math.round(mouseEvent.coords.x - (pxWidth / 2.0));
            const y = Math.round(mouseEvent.coords.y - (pxWidth / 2.0));

            this._drawGraphic.blendMode = 'normal';
            const coordsToDraw = grid.reflectCoordinates({ x, y }, -(pxWidth - 1), -(pxWidth - 1));
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
        const grid = this.$iApi.canvas.grid;
        const cursor = this.$iApi.canvas.cursor;
        if (cursor && grid) {

            const pxWidth = this._brushWidthProperty.value;
            const x = Math.round(event.coords.x - (pxWidth / 2.0));
            const y = Math.round(event.coords.y - (pxWidth / 2.0));

            const graphic = cursor.cursorGraphic
            graphic.clear();

            const coordsToDraw = grid.reflectCoordinates({ x, y }, -(pxWidth - 1), -(pxWidth - 1));
            coordsToDraw.forEach(c => {
                graphic.rect(c.x, c.y, pxWidth, pxWidth).fill(CURSOR_PREVIEW_COLOR);
            });

        }
    }

    getToolState(): any {
        return {
            width: this._brushWidthProperty.value
        }
    }
}