import { InstanceAPI } from '..';
import { Tool, ButtonProperty} from '.'
import { SelectedRegionData, GridMouseEvent, Utils, PixelCoordinates, Events, ToolType, SelectedRegion } from '../utils';

export class Clone extends Tool {

    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;
    private _isSelected: boolean;
    private _selectedRegion: SelectedRegion | undefined;

    private _resetButtonProperty: ButtonProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.CLONE);

        this._showPreviewOnInvoke = true;
        this._invokeOnMove = true;
        this._trackPixels = false;
        this._canMirror = false;

        this._resetButtonProperty = new ButtonProperty("Reset", Events.CLONE_TOOL_RESET);

        this._toolProperties = [
            this._resetButtonProperty
        ];

        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
        this._isSelected = false;
    }

    initialize(): void {
        this._handlers.push(this.$iApi.event.on(Events.CLONE_TOOL_RESET, () => {
            this._resetDrag();
            this._resetRegionSelect();
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

                    if (pixels.length !== 0) {
                        this._isSelected = true;

                        // create region
                        this._selectedRegion = new SelectedRegion(x, y, w, h, pixels);

                        this._previewRegion();
                        this._isDragging = false;
                    } else {
                        this._resetDrag();
                        this._previewRegion();
                        this.$iApi.cursor.clearCursor();
                    }
                }
            } else {

                // STAGE 2

                // place region
                this._selectedRegion?.pixels.forEach(px => {
                    // only draw if coords are inside the canvas
                    if (grid.coordsInBounds(px.currentCoords)) {
                        grid.color = px.color;
                        grid.set(px.currentCoords);
                    }
                });

                if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
                    this.$iApi.history.push();
                }
            }
        }
    }

    previewCursor(event: GridMouseEvent): void {

        // update region coords
        if (this._selectedRegion) {

            let dx = event.coords.pixel.x - this._selectedRegion.x;
            let dy = event.coords.pixel.y - this._selectedRegion.y;

            dx -= Math.round(this._selectedRegion.width / 2);
            dy -= Math.round(this._selectedRegion.height / 2);

            this._selectedRegion.transform(dx, dy);
            this._selectedRegion.stopTransform();

            this._previewRegion();
        }

    }

    private _previewRegion(): void {

        if (!this._selectedRegion || !this.$iApi.cursor.grid) {
            return;
        }

        // clear cursor
        this.$iApi.cursor.clearCursor();

        // draw pixel data
        this._selectedRegion.pixels.forEach(px => {
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
        this.$iApi.cursor.clearCursor();
    }
}