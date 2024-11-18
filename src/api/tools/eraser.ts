import { InstanceAPI } from '..';
import { Tool, SliderProperty} from '.'
import { Events, GridMouseEvent, ToolType } from '../utils';

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = true;

        this._eraserWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px')

        this._toolProperties = [
            this._eraserWidthProperty
        ]
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = Math.round(mouseEvent.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(mouseEvent.coords.pixel.y - (pxWidth / 2.0));

            grid.color = undefined;
            grid.rect({x, y}, pxWidth, pxWidth);
        }

        if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
            this.$iApi.history.push();
        }
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();

            let pxWidth = this._eraserWidthProperty.value;
            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            this.$iApi.cursor.grid.rect({x, y}, pxWidth, pxWidth);
        }
    }
}