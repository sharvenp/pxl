import { InstanceAPI } from '..';
import { Tool, ButtonProperty } from '.'
import { SelectedRegionData, GridMouseEvent, Utils, Events, ToolType, SelectedRegion, CURSOR_PREVIEW_COLOR } from '../utils';

export class Clone extends Tool {

    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;
    private _isSelected: boolean;
    private _selectedRegion: SelectedRegion | undefined;

    private _resetButtonProperty: ButtonProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.CLONE);

        this._toolConfiguration.showPreviewOnInvoke = true;
        this._toolConfiguration.invokeOnMove = true;
        this._toolConfiguration.trackPixels = false;

        this._resetButtonProperty = new ButtonProperty("Reset", Events.CLONE_TOOL_RESET);

        this._toolProperties = [
            this._resetButtonProperty
        ];

        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
        this._isSelected = false;
    }

    init(): void {
        this._handlers.push(this.$iApi.event.on(Events.CLONE_TOOL_RESET, () => {
            this._resetDrag();
            this._resetRegionSelect();
        }, "INSTANCE_BOUND_clone_tool_reset"));
    }

    destroy(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
        this._resetDrag();
        this._resetRegionSelect();
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        const grid = this.$iApi.canvas.grid;
        const cursor = this.$iApi.canvas.cursor;

        if (grid && cursor) {

            if (event === Events.CANVAS_MOUSE_LEAVE) {
                if (!this._isSelected) {
                    // reset
                    this._resetDrag();
                } else {
                    // preview selected region
                    this._updatePreview();
                }
                return;
            }

            if (!this._isSelected) {

                // STAGE 1

                cursor.clearCursor();

                if (mouseEvent.isDragging) {
                    if (!this._isDragging) {
                        this._dragStartX = mouseEvent.coords.x;
                    }
                    if (!this._isDragging) {
                        this._dragStartY = mouseEvent.coords.y;
                    }
                    this._isDragging = true;
                }

                const x = Math.min(this._dragStartX, mouseEvent.coords.x);
                const y = Math.min(this._dragStartY, mouseEvent.coords.y);
                const w = Math.abs(x - Math.max(this._dragStartX, mouseEvent.coords.x) - 1);
                const h = Math.abs(y - Math.max(this._dragStartY, mouseEvent.coords.y) - 1);

                // draw preview rectangle
                if (this._isDragging) {
                    cursor.cursorGraphic.rect(x, y, w, h);
                    cursor.cursorGraphic.stroke({ width: 1, color: CURSOR_PREVIEW_COLOR, alignment: 1 });
                }

                if (!mouseEvent.isDragging && this._isDragging && event === Events.MOUSE_DRAG_STOP) {
                    // dragging stopped, select area

                    // get pixels within region
                    const pixels: Array<SelectedRegionData> = grid.getPixelFrame({ x, y }, w, h)
                        .filter(p => !Utils.isEmptyColor(p[1]))
                        .map(p => <SelectedRegionData>{
                            originalCoords: p[0],
                            currentCoords: { x: p[0].x, y: p[0].y }, // make copy
                            lastCoords: {
                                x: -1,
                                y: -1
                            },
                            color: Utils.rgbaToHex(p[1]),
                        });

                    if (pixels.length !== 0) {
                        this._isSelected = true;
                        this._isDragging = false;

                        // create region
                        this._selectedRegion = new SelectedRegion(x, y, w, h, pixels);
                        this._updatePreview();
                    } else {
                        this._resetDrag();
                        this._resetRegionSelect();
                    }
                }
            } else {

                // STAGE 2

                if (mouseEvent.isDragging && mouseEvent.isOnCanvas) {
                    // place region
                    this._selectedRegion?.pixels.forEach(px => {
                        // only draw if coords are inside the canvas
                        if (grid.contains(px.currentCoords)) {
                            this._drawGraphic.rect(px.currentCoords.x, px.currentCoords.y, 1, 1)
                                .fill(px.color);
                        }
                    });
                    grid.draw(this._drawGraphic);
                }

                if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
                    this.newGraphic();
                    grid?.render();
                }
            }
        }
    }

    previewCursor(event: GridMouseEvent): void {

        // update region coords
        if (this._selectedRegion) {

            let dx = event.coords.x - this._selectedRegion.x;
            let dy = event.coords.y - this._selectedRegion.y;

            dx -= Math.round(this._selectedRegion.width / 2);
            dy -= Math.round(this._selectedRegion.height / 2);

            this._selectedRegion.transform(dx, dy);
            this._selectedRegion.stopTransform();

            this._updatePreview();
        }

    }

    private _updatePreview(): void {

        const cursor = this.$iApi.canvas.cursor;

        if (!this._selectedRegion || !cursor) {
            return;
        }

        // clear cursor
        cursor.clearCursor();

        // draw pixel data
        this._selectedRegion.pixels.forEach(px => {
            cursor.cursorGraphic!.rect(px.currentCoords.x, px.currentCoords.y, 1, 1)
                .fill(px.color);
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
        this.$iApi.canvas.cursor.clearCursor();
    }

    getToolState(): any {
        return {}
    }
}