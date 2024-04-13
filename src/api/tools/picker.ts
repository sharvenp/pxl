import { CURSOR_PREVIEW_COLOR, GridMouseEvent, InstanceAPI, PaletteItem, Utils } from '..';
import { Tool, ToolType} from '.'

export class Picker extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PICKER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && event.isDragging) {

            let pickedColor = grid.getData(event.coords.pixel);

            if (pickedColor.r + pickedColor.g + pickedColor.b + pickedColor.a === 0) {
                // no color
                return;
            }

            // let p = grid.ctx.getImageData(event.coords.pixel.x * grid.offsetX + 2, event.coords.pixel.y * grid.offsetY + 2, 1, 1).data;
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

    previewCursor(event: GridMouseEvent): void {
        let color = CURSOR_PREVIEW_COLOR;
        if (this.$iApi.cursor.ctx) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.cursorActive = true;

            let x = event.coords.pixel.x;
            let y = event.coords.pixel.y;

            this.$iApi.cursor.ctx.fillStyle = color;
            this.$iApi.cursor.ctx.fillRect(x * this.$iApi.cursor.offsetX, y * this.$iApi.cursor.offsetY, this.$iApi.cursor.offsetX, this.$iApi.cursor.offsetY);
        }
    }
}