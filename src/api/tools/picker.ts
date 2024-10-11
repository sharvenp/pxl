import { InstanceAPI } from '..';
import { Tool } from '.'
import { GridMouseEvent, PaletteItem, ToolType, Utils } from '../utils';

export class Picker extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PICKER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;
        this._canMirror = false;
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && event.isDragging) {

            let pickedColor = grid.getData(event.coords.pixel);

            if (pickedColor.r + pickedColor.g + pickedColor.b + pickedColor.a === 0) {
                // no color
                return;
            }

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
        if (this.$iApi.cursor.grid) {
            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.grid.rect({x: event.coords.pixel.x, y: event.coords.pixel.y}, 1, 1);
        }
    }
}