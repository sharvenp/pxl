import { CURSOR_PREVIEW_COLOR, InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolType, SliderProperty} from '.'

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._eraserWidthProperty = new SliderProperty("Eraser Size", 1, 10, 1, 'px')

        this._toolProperties = [
            this._eraserWidthProperty
        ]
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = pixelCoords.x;
            let y = pixelCoords.y;

            if (pxWidth >= 3) {
                x -= 1;
                y -= 1;
            }

            grid.ctx.clearRect(x * grid.offsetX, y * grid.offsetY, grid.offsetX * pxWidth, grid.offsetY * pxWidth);
            this.notify();
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        let cursor = this.$iApi.canvas.cursor;
        let color = CURSOR_PREVIEW_COLOR;
        if (cursor) {

            cursor.clearCursor();
            cursor.cursorActive = true;

            let pxWidth = this._eraserWidthProperty.value;

            let x = pixelCoords.x;
            let y = pixelCoords.y;

            if (pxWidth >= 3) {
                x -= 1;
                y -= 1;
            }

            cursor.ctx.fillStyle = color;
            cursor.ctx.fillRect(x * cursor.offsetX, y * cursor.offsetY, cursor.offsetX * pxWidth, cursor.offsetY * pxWidth);
        }
    }
}