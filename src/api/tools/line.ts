import { Events, GridMouseEvent, InstanceAPI } from '..';
import { Tool, ToolType, SliderProperty, CheckboxProperty } from '.'

export class Line extends Tool {

    private _widthProperty: SliderProperty;
    private _smoothProperty: CheckboxProperty;

    private dragStartX: number;
    private dragStartY: number;
    private isDragging: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.LINE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;

        this._widthProperty = new SliderProperty("Width", 1, 5, 1, 'px');
        this._smoothProperty = new CheckboxProperty("Smooth", false);

        this._toolProperties = [
            this._widthProperty,
            this._smoothProperty
        ]

        this.dragStartX = -1;
        this.dragStartY = -1;
        this.isDragging = false;
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;
        let color = this.$iApi.palette.selectedColor;
        if (color && grid) {

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

            let x0 = this.dragStartX;
            let y0 = this.dragStartY;
            let x1 = mouseEvent.coords.pixel.x;
            let y1 = mouseEvent.coords.pixel.y;

            if (!mouseEvent.isDragging && this.isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                // dragging stopped, draw line
                grid.color = color.colorRGBA;
                grid.line({x: x0, y: y0}, {x: x1, y: y1}, this._widthProperty.value, this._smoothProperty.value);

                this._resetDrag();
            }

            // draw preview line
            if (this.$iApi.cursor.grid && this.isDragging) {

                this.$iApi.cursor.grid.line({x: x0, y: y0}, {x: x1, y: y1}, this._widthProperty.value, false);
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