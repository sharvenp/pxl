import { CURSOR_PREVIEW_COLOR, InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolType, SliderProperty } from '.'

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

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid) {

            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            grid.fillRect({x, y}, pxWidth, pxWidth, color);
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        let color = CURSOR_PREVIEW_COLOR;
        if (this.$iApi.cursor.ctx) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.cursorActive = true;

            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            this.$iApi.cursor.ctx.fillStyle = color;
            this.$iApi.cursor.ctx.fillRect(x * this.$iApi.cursor.offsetX, y * this.$iApi.cursor.offsetY, this.$iApi.cursor.offsetX * pxWidth, this.$iApi.cursor.offsetY * pxWidth);
        }
    }
}