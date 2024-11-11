import { InstanceAPI } from '..';
import { Tool, SliderProperty } from '.'
import { Events, GridMouseEvent, ToolType } from '../utils';

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

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {
            let pxWidth = this._brushWidthProperty.value;

            let x = Math.round(mouseEvent.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(mouseEvent.coords.pixel.y - (pxWidth / 2.0));

            grid.color = color.colorRGBA;
            grid.rect({x, y}, pxWidth, pxWidth);
        }

        if (event === Events.MOUSE_DRAG_STOP) {
            this.$iApi.history.push();
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