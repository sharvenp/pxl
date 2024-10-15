import { InstanceAPI } from '..';
import { Tool, ButtonProperty} from '.'
import { SelectedRegionData, GridMouseEvent, Utils, PixelCoordinates, Events, ToolType } from '../utils';

class SelectedRegion {

    private _originalX: number;
    private _originalY: number;
    private _x: number;
    private _y: number;
    private _lastX: number;
    private _lastY: number;
    private _width: number;
    private _height: number

    private _pixels: Array<SelectedRegionData>;

    constructor(originalX: number, originalY: number, width: number, height: number, pixels: Array<SelectedRegionData>) {
        this._originalX = originalX;
        this._originalY = originalY;
        this._x = originalX;
        this._y = originalY;
        this._width = width;
        this._height = height;

        this._lastX = -1;
        this._lastY = -1;

        this._pixels = pixels;
    }

    transform(dx: number, dy: number) {
        // keep track of previous x,y values
        if (this._lastX === -1) {
            this._lastX = this._x;
        }
        if (this._lastY === -1) {
            this._lastY = this._y;
        }

        // transform in delta direction
        this._x = this._lastX + dx;
        this._y = this._lastY + dy;

        this._pixels.forEach(pair => {

            // keep track of previous x,y values
            if (pair.lastCoords.x === -1) {
                pair.lastCoords.x = pair.currentCoords.x;
            }
            if (pair.lastCoords.y === -1) {
                pair.lastCoords.y = pair.currentCoords.y;
            }

            // move the position
            pair.currentCoords.x = pair.lastCoords.x + dx;
            pair.currentCoords.y = pair.lastCoords.y + dy;

        });
    }

    stopTransform() {
        this._lastX = -1;
        this._lastY = -1;

        this._pixels.forEach(pair => {
            pair.lastCoords.x = -1;
            pair.lastCoords.y = -1;
        });
    }

    revertTransform() {
        this._x = this._originalX;
        this._y = this._originalY;

        this._pixels.forEach(pair => {
            pair.currentCoords.x = pair.originalCoords.x;
            pair.currentCoords.y = pair.originalCoords.y;
        });
        this.stopTransform();
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get pixels(): Array<SelectedRegionData> {
        return this._pixels;
    }
}


export class Select extends Tool {

    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;
    private _isSelected: boolean;
    private _selectedRegion: SelectedRegion | undefined;

    private _resetButtonProperty: ButtonProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SELECT);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = true;
        this._trackPixels = false;
        this._canMirror = false;

        this._resetButtonProperty = new ButtonProperty("Reset", Events.SELECT_TOOL_RESET);

        this._toolProperties = [
            this._resetButtonProperty
        ];

        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
        this._isSelected = false;
    }

    initalize(): void {
        this._handlers.push(this.$iApi.event.on(Events.SELECT_TOOL_RESET, () => {
            this._selectedRegion?.revertTransform();
            this._previewRegion();
        }));
    }

    dispose(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
        this._resetDrag();
        this._resetRegionSelect();
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;

        if (grid) {

            if (event === Events.CANVAS_MOUSE_LEAVE) {
                if (!this._isSelected) {
                    // reset
                    this._resetDrag();
                    this._resetRegionSelect();
                } else {
                    // preview selected region
                    this._previewRegion();
                }
                return;
            }

            // spec:
            // two-stage approach
            // 1. The user drags a rectangle to select the area. Once the area is selected, move to step 2
            // 2. When selected area is hovered, the user can drag it to move it. Clicking outside the selected area resets back to step 1
            // Keep track of the selected areas pixel colors, original position, and current position
            // Move the pixels by shifting the position and colors in the grid
            // "Reset" button in tool properties to reset selected area back to original position

            if (!this._isSelected) {

                // STAGE 1

                this.$iApi.cursor.clearCursor();

                if (mouseEvent.isDragging) {
                    if (!this._isDragging) {
                        this._dragStartX = mouseEvent.coords.pixel.x;
                    }
                    if (!this._isDragging) {
                        this._dragStartY = mouseEvent.coords.pixel.y;
                    }
                    this._isDragging = true;
                }

                let x = Math.min(this._dragStartX, mouseEvent.coords.pixel.x);
                let y = Math.min(this._dragStartY, mouseEvent.coords.pixel.y);
                let w = Math.abs(x - Math.max(this._dragStartX, mouseEvent.coords.pixel.x) - 1);
                let h = Math.abs(y - Math.max(this._dragStartY, mouseEvent.coords.pixel.y) - 1);

                // draw preview rectangle
                if (this.$iApi.cursor.grid && this._isDragging) {
                    this.$iApi.cursor.grid.rect({x, y}, w, h, false);
                }

                if (!mouseEvent.isDragging && this._isDragging && event === Events.CANVAS_MOUSE_DRAG_STOP) {
                    // dragging stopped, select area
                    this._isSelected = true;

                    // get pixels within region
                    let pixels: Array<SelectedRegionData> = grid.getDataRect({x: x + 1, y: y + 1}, w - 2, h - 2)
                                                        .filter(p => !Utils.isEmptyColor(p[1]))
                                                        .map(p => <SelectedRegionData>{
                                                            originalCoords: p[0],
                                                            currentCoords: {x: p[0].x, y: p[0].y}, // make copy
                                                            lastCoords: {
                                                                x: -1,
                                                                y: -1
                                                            },
                                                            color: p[1],
                                                        });
                    // create region
                    this._selectedRegion = new SelectedRegion(x, y, w, h, pixels);

                    // erase pixels from grid
                    pixels.forEach(px => {
                        grid.color = undefined;
                        grid.set(px.currentCoords);
                    });

                    this._previewRegion();

                    this._isDragging = false;
                }
            } else {

                // STAGE 2

                // check if click is inside the region
                if (this._isPointInRegion(mouseEvent.coords.pixel)) {

                    if (event === Events.CANVAS_MOUSE_DRAG_START) {

                        if (!this._isDragging) {
                            this._dragStartX = mouseEvent.coords.pixel.x;
                        }
                        if (!this._isDragging) {
                            this._dragStartY = mouseEvent.coords.pixel.y;
                        }
                        this._isDragging = true;

                    } else if (event === Events.CANVAS_MOUSE_DRAG_STOP) {

                        this._dragStartX = -1;
                        this._dragStartY = -1;
                        this._isDragging = false;
                        this._selectedRegion?.stopTransform();

                    }

                    if (mouseEvent.isDragging && event === Events.CANVAS_MOUSE_MOVE) {
                        // if not, reset drag

                        let dx = mouseEvent.coords.pixel.x - this._dragStartX;
                        let dy = mouseEvent.coords.pixel.y - this._dragStartY;

                        this._selectedRegion!.transform(dx, dy);
                        this._previewRegion();
                    }

                } else {

                    // place region
                    this._selectedRegion?.pixels.forEach(px => {
                        grid.color = px.color;
                        grid.set(px.currentCoords);
                    });

                    this._resetDrag();
                    this._resetRegionSelect();
                }
            }
        }
    }

    private _isPointInRegion(coords: PixelCoordinates): boolean {
        if (this._selectedRegion) {
            return (
                (coords.x >= this._selectedRegion.x && coords.x <= this._selectedRegion.x + this._selectedRegion.width) &&
                (coords.y >= this._selectedRegion.y && coords.y <= this._selectedRegion.y + this._selectedRegion.height)
            );
        } else {
            return false;
        }
    }

    private _previewRegion(): void {

        if (!this._selectedRegion || !this.$iApi.cursor.grid) {
            return;
        }

        // clear cursor
        this.$iApi.cursor.clearCursor();

        // draw cursor box
        this.$iApi.cursor.grid.rect(
            {
                x: this._selectedRegion.x,
                y: this._selectedRegion.y
            },
            this._selectedRegion.width,
            this._selectedRegion.height,
            false
        );

        // draw pixel data
        this._selectedRegion.pixels.forEach(px => {
            this.$iApi.cursor.grid!.color = px.color;
            this.$iApi.cursor.grid!.set(px.currentCoords, true);
        });
    }

    private _resetDrag(): void {
        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
    }

    private _resetRegionSelect(): void {
        this._isSelected = false;
        this._selectedRegion = undefined;
    }
}