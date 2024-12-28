import { InstanceAPI } from '..';
import { Tool } from '.'
import { CURSOR_PREVIEW_COLOR, GridMouseEvent, PaletteItem, ToolType, Utils } from '../utils';

export class Picker extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.PICKER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;
        this._canMirror = false;
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && event.isDragging && event.isOnCanvas) {

            let pickedColor = grid.getPixel(event.coords);

            if (Utils.isEmptyColor(pickedColor)) {
                // no color
                return;
            }

            let paletteItem: PaletteItem = {
                colorHex: Utils.rgbaToHex(pickedColor),
                colorRGBA: pickedColor
            }

            // will not duplicate if color with hex code is already present
            this.$iApi.palette.addColor(paletteItem);

            this.$iApi.palette.selectColor(this.$iApi.palette.palette
                              .find(c => c.colorHex === paletteItem.colorHex)!);
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.canvas.cursor) {
            const graphic = this.$iApi.canvas.cursor.cursorGraphic
            graphic.clear();
            graphic.rect(event.coords.x, event.coords.y, 1, 1).fill(CURSOR_PREVIEW_COLOR);
        }
    }
}