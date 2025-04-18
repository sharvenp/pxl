import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;
    private _eraserOpacityProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._toolConfiguration.showPreviewOnInvoke = true;
        this._toolConfiguration.invokeOnMove = true;

        this._eraserWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px')
        this._eraserOpacityProperty = new SliderProperty("Strength", 0, 100, 100, '%')

        this._toolProperties = [
            this._eraserWidthProperty,
            this._eraserOpacityProperty
        ]
    }

    initialize(): void {
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        const grid = this.$iApi.canvas.grid!;
        if (grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {

            const pxWidth = this._eraserWidthProperty.value;

            const x = Math.round(mouseEvent.coords.x - (pxWidth / 2.0));
            const y = Math.round(mouseEvent.coords.y - (pxWidth / 2.0));

            const coordsToDraw = grid.reflectCoordinates({ x, y }, -(pxWidth - 1), -(pxWidth - 1));
            this._drawGraphic.blendMode = 'erase';
            coordsToDraw.forEach(c => {
                this._drawGraphic.rect(c.x, c.y, pxWidth, pxWidth).fill({ color: 0, alpha: this._eraserOpacityProperty.value / 100 });
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
        if (grid && cursor) {

            const pxWidth = this._eraserWidthProperty.value;
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
}