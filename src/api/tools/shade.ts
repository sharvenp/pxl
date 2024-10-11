import { InstanceAPI } from '..';
import { Tool, SliderProperty, RadioProperty } from '.'
import { GridMouseEvent, Utils, RGBAColor, ShadeMode, ToolType } from '../utils';

export class Shade extends Tool {

    private _strengthProperty: SliderProperty;
    private _shadeTypeProperty: RadioProperty;
    private _brushWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SHADE);

        this._showPreviewOnInvoke = false;
    this._invokeOnMove = true;

        this._shadeTypeProperty = new RadioProperty("Mode", [ShadeMode.LIGHTEN, ShadeMode.DARKEN], ShadeMode.LIGHTEN);
        this._strengthProperty = new SliderProperty("Strength", 0, 100, 10, '%');
        this._brushWidthProperty = new SliderProperty("Size", 1, 10, 1, 'px');

        this._toolProperties = [
            this._shadeTypeProperty,
            this._strengthProperty,
            this._brushWidthProperty
        ]
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid;
        if (grid && event.isDragging) {

            let strength = (this._strengthProperty.value / 100.0);
            let shadeType = this._shadeTypeProperty.value;

            let pxWidth = this._brushWidthProperty.value;
            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            let currPixels = grid.getDataRect({x, y}, pxWidth, pxWidth);

            currPixels.forEach(pxPair => {
                let coords = pxPair[0];
                let color = pxPair[1];

                if (!Utils.isEmptyColor(color)) {
                    // theres no color here, so continue
                    let colorToApply = this._calculateColor(color, strength, shadeType);
                    grid.color = colorToApply;
                    grid.set(coords, true);
                }
            });

        }
    }

    private _calculateColor(color: RGBAColor, strength: number, mode: string): RGBAColor {

        let lightOffset = mode === ShadeMode.LIGHTEN ? 255 : 0;

        let r = Math.max(0, Math.min(255, color.r * (1 - strength) + lightOffset * strength));
        let g = Math.max(0, Math.min(255, color.g * (1 - strength) + lightOffset * strength));
        let b = Math.max(0, Math.min(255, color.b * (1 - strength) + lightOffset * strength));

        return { r, g, b, a: color.a };
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            this.$iApi.cursor.clearCursor();

            let pxWidth = this._brushWidthProperty.value;
            let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            this.$iApi.cursor.grid.rect({x, y}, pxWidth, pxWidth);
        }
    }
}