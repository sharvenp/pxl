import { GridMouseEvent, InstanceAPI } from '..';
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

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && event.isDragging) {
            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            grid.color = color.colorRGBA;
            grid.rect({x, y}, pxWidth, pxWidth);
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();

            let pxWidth = this._brushWidthProperty.value;
            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            this.$iApi.cursor.grid.rect({x, y}, pxWidth, pxWidth);
        }
    }
}