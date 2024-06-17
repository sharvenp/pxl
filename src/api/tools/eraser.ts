import { CURSOR_PREVIEW_COLOR, GridMouseEvent, InstanceAPI } from '..';
import { Tool, ToolType, SliderProperty} from '.'

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

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && event.isDragging) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            grid.color = undefined;
            grid.rect({x, y}, pxWidth, pxWidth);
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();

            let pxWidth = this._eraserWidthProperty.value;
            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            this.$iApi.cursor.grid.rect({x, y}, pxWidth, pxWidth);
        }
    }
}