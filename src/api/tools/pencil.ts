import { CURSOR_PREVIEW_COLOR, InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolType, SliderProperty, CheckboxProperty} from '.'

export class Pencil extends Tool {

    private _brushWidthProperty: SliderProperty;
    private _opacityProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PENCIL);

        this._brushWidthProperty = new SliderProperty("Brush Size", 1, 10, 1, 'px');
        this._opacityProperty = new SliderProperty("Opacity", 0, 100, 100, '%');

        this._toolProperties = [
            this._brushWidthProperty,
            this._opacityProperty,
        ]
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColorRGB(this._opacityProperty.value / 100.0);
        if (color && grid) {

            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            grid.ctx.fillStyle = color;
            grid.ctx.fillRect(x * grid.offsetX, y * grid.offsetY, grid.offsetX * pxWidth, grid.offsetY * pxWidth);

            this.notify();
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        let cursor = this.$iApi.canvas.cursor;
        let color = CURSOR_PREVIEW_COLOR;
        if (cursor) {

            cursor.clearCursor();
            cursor.cursorActive = true;

            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(pixelCoords.x - (pxWidth / 2.0));
            let y = Math.round(pixelCoords.y - (pxWidth / 2.0));

            cursor.ctx.fillStyle = color;
            cursor.ctx.fillRect(x * cursor.offsetX, y * cursor.offsetY, cursor.offsetX * pxWidth, cursor.offsetY * pxWidth);
        }
    }
}