import { InstanceAPI } from '..';
import { Tool, ButtonProperty} from '.'
import { SelectedRegionData, GridMouseEvent, Utils, PixelCoordinates, Events, ToolType, SelectedRegion } from '../utils';

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

    initialize(): void {
        this._handlers.push(this.$iApi.event.on(Events.SELECT_TOOL_RESET, () => {
            this._resetDrag();
            this._revertRegion();
        }));
    }

    dispose(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
        this._resetDrag();
        this._revertRegion();
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        let grid = this.$iApi.canvas.grid;

        if (grid) {

            if (event === Events.CANVAS_MOUSE_LEAVE) {
                if (!this._isSelected) {
                    // reset
                    this._resetDrag();
                } else {
                    // preview selected region
                    this._previewRegion();
                }
                return;
            }

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

                if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
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

                    if (event === Events.MOUSE_DRAG_START) {

                        if (!this._isDragging) {
                            this._dragStartX = mouseEvent.coords.pixel.x;
                        }
                        if (!this._isDragging) {
                            this._dragStartY = mouseEvent.coords.pixel.y;
                        }
                        this._isDragging = true;

                    } else if (event === Events.MOUSE_DRAG_STOP) {

                        this._dragStartX = -1;
                        this._dragStartY = -1;
                        this._isDragging = false;
                        this._selectedRegion?.stopTransform();

                    }

                    if (mouseEvent.isDragging && event === Events.MOUSE_MOVE) {
                        // if not, reset drag

                        let dx = mouseEvent.coords.pixel.x - this._dragStartX;
                        let dy = mouseEvent.coords.pixel.y - this._dragStartY;

                        this._selectedRegion!.transform(dx, dy);
                        this._previewRegion();
                    }

                } else if (mouseEvent.isOnCanvas) {

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

    private _revertRegion(): void {
        let grid = this.$iApi.canvas.grid;

        if (this._isSelected && grid) {
            this._selectedRegion?.revertTransform();

            this._selectedRegion?.pixels.forEach(px => {
                grid.color = px.color;
                grid.set(px.currentCoords);
            });
        }

        this._resetRegionSelect();
    }

    private _resetRegionSelect(): void {
        this._isSelected = false;
        this._selectedRegion = undefined;
        this.$iApi.cursor.clearCursor();
    }
}