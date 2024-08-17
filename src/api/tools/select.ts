import { Events, GridMouseEvent, InstanceAPI, PixelCoordinates, RGBAColor } from '..';
import { Tool, ToolType, ButtonProperty} from '.'


class SelectedRegion {

    private _originalX: number;
    private _originalY: number;
    private _width: number;
    private _height: number
    private _pixels: Array<[PixelCoordinates, RGBAColor, RGBAColor]>;

    constructor(originalX: number, originalY: number, width: number, height: number, pixels: Array<[PixelCoordinates, RGBAColor, RGBAColor]>) {
        this._originalX = originalX;
        this._originalY = originalY;
        this._width = width;
        this._height = height;

        this._pixels = pixels;
    }

    transform(dx: number, dy: number) {
        this._pixels.forEach(pair => {
            // move the position
            pair[0].x += dx;
            pair[0].x += dy;
        });
    }
}


export class Select extends Tool {

    private dragStartX: number;
    private dragStartY: number;
    private isDragging: boolean;

    private _resetButtonProperty: ButtonProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SELECT);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;
        this._trackPixels = false;

        this._resetButtonProperty = new ButtonProperty("Reset", Events.SELECT_TOOL_RESET);

        this._toolProperties = [
            this._resetButtonProperty
        ];

        this.dragStartX = -1;
        this.dragStartY = -1;
        this.isDragging = false;
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid) {

            // spec:
            // two-stage approach
            // 1. The user drags a rectangle to select the area. Once the area is selected, move to step 2
            // 2. When selected area is hovered, the user can drag it to move it. Clicking outside the selected area resets back to step 1
            // Keep track of the selected areas pixel colors, original position, and current position
            // Move the pixels by shifting the position and colors in the grid
            // "Reset" button in tool properties to reset selected area back to original position

            this.$iApi.cursor.clearCursor();
            if (event === Events.CANVAS_MOUSE_LEAVE) {
                // mouse left canvas, do nothing
                this._resetDrag();
                return;
            }

            if (mouseEvent.isDragging) {
                if (!this.isDragging) {
                    this.dragStartX = mouseEvent.coords.pixel.x;
                }
                if (!this.isDragging) {
                    this.dragStartY = mouseEvent.coords.pixel.y;
                }
                this.isDragging = true;
            }

            let x = Math.min(this.dragStartX, mouseEvent.coords.pixel.x);
            let y = Math.min(this.dragStartY, mouseEvent.coords.pixel.y);
            let w = Math.abs(x - Math.max(this.dragStartX, mouseEvent.coords.pixel.x) - 1);
            let h = Math.abs(y - Math.max(this.dragStartY, mouseEvent.coords.pixel.y) - 1);

            if (!mouseEvent.isDragging && this.isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                // dragging stopped, select area
                grid.color = color.colorRGBA;

                this._resetDrag();
            }

            // draw preview rectangle
            if (this.$iApi.cursor.grid && this.isDragging) {
                this.$iApi.cursor.grid.rect({x, y}, w, h, false);
            }
        }
    }

    previewCursor(): void {
        // preview handled by invoke
        return;
    }

    private _resetDrag(): void {
        this.dragStartX = -1;
        this.dragStartY = -1;
        this.isDragging = false;
    }
}