import { CURSOR_PREVIEW_COLOR, InstanceAPI, PaletteItem, PixelCoordinates, Utils } from '..';
import { Tool, ToolType} from '.'

export class Picker extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PICKER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;
    }

    invokeAction(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid) {

            let pickedColor = grid.getData(pixelCoords);

            if (pickedColor.r + pickedColor.g + pickedColor.b + pickedColor.a === 0) {
                // no color
                return;
            }

            // let p = grid.ctx.getImageData(pixelCoords.x * grid.offsetX + 2, pixelCoords.y * grid.offsetY + 2, 1, 1).data;
            // console.log(p);

            let paletteItem: PaletteItem = {
                colorHex: Utils.rgbaToHex(pickedColor),
                colorRGBA: pickedColor
            }

            // will not duplicate if color with hex code is already present
            this.$iApi.palette.addColor(paletteItem);
            this.$iApi.palette.selectColor(this.$iApi.palette.palette.find(c => c.colorHex === paletteItem.colorHex)!);
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