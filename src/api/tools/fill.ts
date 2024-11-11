import { InstanceAPI } from '..';
import { SliderProperty, Tool } from '.'
import { GridMouseEvent, ToolType } from '../utils';

export class Fill extends Tool {

    private _toleranceProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.FILL);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = false;
        this._canMirror = false;

        this._toleranceProperty = new SliderProperty("Tolerance", 0, 100, 0, '%');

        this._toolProperties = [
            this._toleranceProperty,
        ]
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && event.isDragging && event.isOnCanvas) {
            grid.color = color.colorRGBA;
            grid.floodFill(event.coords.pixel, this._toleranceProperty.value / 100.0);
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.grid.rect({x: event.coords.pixel.x, y: event.coords.pixel.y}, 1, 1);
        }
    }
}