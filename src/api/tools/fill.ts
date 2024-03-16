import { CURSOR_PREVIEW_COLOR, InstanceAPI, PixelCoordinates, Utils } from '..';
import { SliderProperty, Tool, ToolType} from '.'

export class Fill extends Tool {

    private _toleranceProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.FILL);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;

        this._toleranceProperty = new SliderProperty("Tolerance", 0, 100, 0, '%');

        this._toolProperties = [
            this._toleranceProperty,
        ]
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid) {
            grid.floodFill(pixelCoords, this._toleranceProperty.value / 100.0, color);
        }
    }

    previewCursor(pixelCoords: PixelCoordinates): void {
        let color = CURSOR_PREVIEW_COLOR;
        if (this.$iApi.cursor.ctx) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.cursorActive = true;

            let x = pixelCoords.x;
            let y = pixelCoords.y;

            this.$iApi.cursor.ctx.fillStyle = color;
            this.$iApi.cursor.ctx.fillRect(x * this.$iApi.cursor.offsetX, y * this.$iApi.cursor.offsetY, this.$iApi.cursor.offsetX, this.$iApi.cursor.offsetY);
        }
    }
}