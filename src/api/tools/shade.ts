import { InstanceAPI } from '..';
import { Tool, SliderProperty, RadioProperty } from '.'
import { GridMouseEvent, Utils, RGBAColor, ShadeMode, ToolType, Events, CURSOR_PREVIEW_COLOR } from '../utils';

export class Shade extends Tool {

    private _strengthProperty: SliderProperty;
    private _shadeTypeProperty: RadioProperty;
    private _brushWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SHADE);

        this._toolConfiguration.showPreviewOnInvoke = true;
        this._toolConfiguration.invokeOnMove = true;

        const toolState = this.loadToolState();
        this._shadeTypeProperty = new RadioProperty("Mode", [ShadeMode.LIGHTEN, ShadeMode.DARKEN], toolState?.mode ?? ShadeMode.LIGHTEN);
        this._strengthProperty = new SliderProperty("Strength", 0, 100, toolState?.strength ?? 10, '%');
        this._brushWidthProperty = new SliderProperty("Size", 1, 10, toolState?.width ?? 1, 'px');

        this._toolProperties = [
            this._shadeTypeProperty,
            this._strengthProperty,
            this._brushWidthProperty
        ]
    }

    destroy(): void {
    }

    invokeAction(mouseEvent: GridMouseEvent, event: Events): void {
        const grid = this.$iApi.canvas.grid;
        if (grid && mouseEvent.isDragging && mouseEvent.isOnCanvas) {

            const strength = (this._strengthProperty.value / 100.0);
            const shadeType = this._shadeTypeProperty.value;

            const pxWidth = this._brushWidthProperty.value;
            const x = Math.round(mouseEvent.coords.x - (pxWidth / 2.0));
            const y = Math.round(mouseEvent.coords.y - (pxWidth / 2.0));

            const currPixels = grid.getPixelFrame({ x, y }, pxWidth, pxWidth);

            currPixels.forEach(pxPair => {
                const coords = pxPair[0];
                const color = pxPair[1];

                if (!Utils.isEmptyColor(color)) {
                    // calculate the resulting color
                    const colorToApply = this._calculateColor(color, strength, shadeType);

                    this._drawGraphic.blendMode = 'normal';
                    this._drawGraphic.rect(coords.x, coords.y, 1, 1).fill(colorToApply);
                }
            });

            grid.draw(this._drawGraphic);
        }

        if (event === Events.MOUSE_DRAG_STOP && mouseEvent.isOnCanvas) {
            this.newGraphic();
            grid?.render();
        }
    }

    private _calculateColor(color: RGBAColor, strength: number, mode: string): RGBAColor {

        const lightOffset = mode === ShadeMode.LIGHTEN ? 255 : 0;

        const r = Math.max(0, Math.min(255, color.r * (1 - strength) + lightOffset * strength));
        const g = Math.max(0, Math.min(255, color.g * (1 - strength) + lightOffset * strength));
        const b = Math.max(0, Math.min(255, color.b * (1 - strength) + lightOffset * strength));

        return { r, g, b, a: color.a };
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.canvas.cursor) {

            const pxWidth = this._brushWidthProperty.value;
            const x = Math.round(event.coords.x - (pxWidth / 2.0));
            const y = Math.round(event.coords.y - (pxWidth / 2.0));

            const graphic = this.$iApi.canvas.cursor.cursorGraphic
            graphic.clear();
            graphic.rect(x, y, pxWidth, pxWidth).fill(CURSOR_PREVIEW_COLOR);
        }
    }

    getToolState(): any {
        return {
            mode: this._shadeTypeProperty.value,
            strength: this._strengthProperty.value,
            width: this._brushWidthProperty.value
        }
    }
}