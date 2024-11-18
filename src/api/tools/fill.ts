import { InstanceAPI } from '..';
import { SliderProperty, Tool } from '.'
import { Events, GridMouseEvent, ToolType } from '../utils';

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

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {
            grid.color = color.colorRGBA;
            grid.floodFill(mouseEvent.coords.pixel, this._toleranceProperty.value / 100.0);
        }

        if (event === Events.MOUSE_DRAG_STOP) {
            this.$iApi.history.push();
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();
            this.$iApi.cursor.grid.rect({x: event.coords.pixel.x, y: event.coords.pixel.y}, 1, 1);
        }
    }
}