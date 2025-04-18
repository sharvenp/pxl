import { InstanceAPI } from '..';
import { SliderProperty, Tool } from '.'
import { CURSOR_PREVIEW_COLOR, Events, GridMouseEvent, ToolType } from '../utils';

export class Fill extends Tool {

    private _toleranceProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.FILL);

        this._toolConfiguration.showPreviewOnInvoke = true;
        this._toolConfiguration.invokeOnMove = false;

        this._toleranceProperty = new SliderProperty("Tolerance", 0, 100, 0, '%');

        this._toolProperties = [
            this._toleranceProperty,
        ]
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        const grid = this.$iApi.canvas.grid;
        const color = this.$iApi.palette.selectedColor;
        if (color && grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {
            this._drawGraphic.blendMode = 'normal';
            grid.floodFill(this._drawGraphic, mouseEvent.coords, this._toleranceProperty.value / 100.0);
            this._drawGraphic.fill(color.colorHex);
        }

        if (event === Events.MOUSE_DRAG_STOP) {
            this.newGraphic();
            grid?.render();
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.canvas.cursor) {
            const graphic = this.$iApi.canvas.cursor.cursorGraphic
            graphic.clear();
            graphic.rect(event.coords.x, event.coords.y, 1, 1).fill(CURSOR_PREVIEW_COLOR);
        }
    }

    getToolState(): any {
        return {
            tolerance: this._toleranceProperty.value,
        }
    }
}