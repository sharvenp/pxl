import { InstanceAPI } from '..';
import { Tool, SliderProperty} from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, NO_COLOR_FULL_ALPHA, ToolType } from '../utils';

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = true;

        this._eraserWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px')

        this._toolProperties = [
            this._eraserWidthProperty
        ]
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = Math.round(mouseEvent.coords.x - (pxWidth / 2.0));
            let y = Math.round(mouseEvent.coords.y - (pxWidth / 2.0));

            this._drawGraphic.blendMode = 'erase';
            this._drawGraphic.rect(x, y, pxWidth, pxWidth).fill(NO_COLOR_FULL_ALPHA);
            grid.draw(this._drawGraphic);
        }

        if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
            this.newGraphic();
            grid?.render();
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.canvas.cursor) {

            let pxWidth = this._eraserWidthProperty.value;
            let x = Math.round(event.coords.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.y - (pxWidth / 2.0));

            const graphic = this.$iApi.canvas.cursor.cursorGraphic
            graphic.clear();
            graphic.rect(x, y, pxWidth, pxWidth).fill(CURSOR_PREVIEW_COLOR);
        }
    }
}