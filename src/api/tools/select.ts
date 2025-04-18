import { InstanceAPI } from '..';
import { Tool, ButtonProperty } from '.'
import { SelectedRegionData, GridMouseEvent, Utils, PixelCoordinates, Events, ToolType, SelectedRegion, CURSOR_PREVIEW_COLOR, NO_COLOR_FULL_ALPHA } from '../utils';
import { Container, Graphics } from 'pixi.js';

export class Select extends Tool {

    private _dragStartX: number;
    private _dragStartY: number;
    private _isDragging: boolean;
    private _isSelected: boolean;
    private _selectedRegion: SelectedRegion | undefined;

    private _previewLayer: Container | undefined;
    private _previewGraphic: Graphics | undefined;
    private _drawContainer: Container | undefined;

    private _resetButtonProperty: ButtonProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SELECT);

        this._toolConfiguration.showPreviewOnInvoke = true;
        this._toolConfiguration.invokeOnMove = true;
        this._toolConfiguration.trackPixels = false;

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

        this._handlers.push(this.$iApi.event.on(Events.UNDO, () => {
            this._resetDrag();
            this._revertRegion();
        }));

        this._previewLayer = new Container({ eventMode: 'none' });
        this._previewGraphic = new Graphics({ roundPixels: true });
        this._previewLayer.addChild(this._previewGraphic);
    }

    dispose(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
        this._resetDrag();
        this._revertRegion();

        this._previewLayer?.destroy({ children: true });
        this._previewGraphic = undefined;
        this._previewLayer = undefined;
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
                    this._isSelected = true;

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
                    // create region
                    this._selectedRegion = new SelectedRegion(x, y, w, h, pixels);

                    // erase pixels from grid
                    this._drawContainer = new Container({ eventMode: 'none' });
                    this._drawGraphic.blendMode = 'erase';
                    this._drawGraphic.rect(x, y, w, h).fill(NO_COLOR_FULL_ALPHA);
                    this._drawContainer.addChild(this._drawGraphic);
                    grid.draw(this._drawContainer);
                    this.newGraphic();
                    grid?.render();

                    cursor.clearCursor();
                    this._createPreview();
                    this._updatePreview();

                    this._isDragging = false;
                }
            } else {

                // STAGE 2

                // check if click is inside the region
                if (this._isPointInRegion(mouseEvent.coords)) {

                    if (event === Events.MOUSE_DRAG_START) {

                        if (!this._isDragging) {
                            this._dragStartX = mouseEvent.coords.x;
                        }
                        if (!this._isDragging) {
                            this._dragStartY = mouseEvent.coords.y;
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

                        const dx = mouseEvent.coords.x - this._dragStartX;
                        const dy = mouseEvent.coords.y - this._dragStartY;

                        this._selectedRegion!.transform(dx, dy);
                        this._updatePreview();
                    }

                } else if (mouseEvent.isOnCanvas) {

                    // place region
                    this._drawGraphic.blendMode = 'normal';

                    this._selectedRegion?.pixels.forEach(px => {
                        // only draw if coords are inside the canvas
                        if (grid.contains(px.currentCoords)) {
                            this._drawGraphic.rect(px.currentCoords.x, px.currentCoords.y, 1, 1)
                                .fill(px.color);
                        }
                    });
                    this._drawContainer!.addChild(this._drawGraphic);
                    grid.draw(this._drawContainer!);
                    this.newGraphic();
                    grid?.render();

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

    private _createPreview(): void {

        const previewContainer = this.$iApi.canvas.grid?.previewContainer;

        if (!this._selectedRegion || !previewContainer || !this._previewLayer || !this._previewGraphic) {
            return;
        }

        // remove all children
        if (previewContainer.children.length > 0) {
            previewContainer.removeChildren(0, previewContainer.children.length);
        }

        // add preview layer to preview container
        previewContainer.addChild(this._previewLayer);
    }

    private _updatePreview(): void {

        if (!this._selectedRegion || !this._previewGraphic) {
            return;
        }

        // clear preview
        this._previewGraphic.clear();

        // draw pixel data
        this._previewGraphic.rect(this._selectedRegion.x, this._selectedRegion.y, this._selectedRegion.width, this._selectedRegion.height)
            .stroke({ width: 1, color: CURSOR_PREVIEW_COLOR, alignment: 1, alpha: 0.2 });

        this._selectedRegion.pixels.forEach(px => {
            this._previewGraphic!.rect(px.currentCoords.x, px.currentCoords.y, 1, 1)
                .fill(px.color);
        });
    }

    private _resetDrag(): void {
        this._dragStartX = -1;
        this._dragStartY = -1;
        this._isDragging = false;
    }

    private _revertRegion(): void {
        const grid = this.$iApi.canvas.grid;

        if (this._isSelected && grid && this._drawContainer) {
            this._selectedRegion?.revertTransform();

            this._drawContainer.removeFromParent();
            this._drawContainer.destroy({ children: true });
            this._drawContainer = undefined;
        }

        this._resetRegionSelect();
    }

    private _resetRegionSelect(): void {
        this._isSelected = false;
        this._selectedRegion = undefined;
        this._previewGraphic?.clear();
    }

    getToolState(): any {
        return {}
    }
}