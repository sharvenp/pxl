import { CURSOR_PREVIEW_COLOR, InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolType, SliderProperty} from '.'

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._showPreviewOnInvoke = true;

        this._eraserWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px')

        this._toolProperties = [
            this._eraserWidthProperty
        ]
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            grid.clearRect({x, y}, pxWidth, pxWidth);
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        let color = CURSOR_PREVIEW_COLOR;
        if (this.$iApi.cursor.ctx) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.cursorActive = true;

            let pxWidth = this._eraserWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            this.$iApi.cursor.ctx.fillStyle = color;
            this.$iApi.cursor.ctx.fillRect(x * this.$iApi.cursor.offsetX, y * this.$iApi.cursor.offsetY, this.$iApi.cursor.offsetX * pxWidth, this.$iApi.cursor.offsetY * pxWidth);
        }
    }
}