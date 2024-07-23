import { GridMouseEvent, InstanceAPI, RGBAColor, Utils } from '..';
import { Tool, ToolType, SliderProperty, RadioProperty } from '.'

enum ShadeMode {
    LIGHTEN = "Lighten",
    DARKEN = "Darken"
}

export class Shade extends Tool {

    private _strengthProperty: SliderProperty;
    private _shadeTypeProperty: RadioProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.SHADE);

        this._showPreviewOnInvoke = false;
        this._invokeOnMove = true;

        // TODO: add brush size
        this._strengthProperty = new SliderProperty("Strength", 0, 100, 100, '%');
        this._shadeTypeProperty = new RadioProperty("Mode", [ShadeMode.LIGHTEN, ShadeMode.DARKEN], ShadeMode.LIGHTEN);

        this._toolProperties = [
            this._strengthProperty,
            this._shadeTypeProperty
        ]
    }

    invokeAction(event: GridMouseEvent): void {
        let grid = this.$iApi.canvas.grid;
        if (grid && event.isDragging) {

            let strength = (this._strengthProperty.value / 100.0) + 1;
            let shadeType = this._shadeTypeProperty.value;

            let x = event.coords.pixel.x;
            let y = event.coords.pixel.y;

            let currColor = grid.getData({x, y});

            if (Utils.isEmptyColor(currColor)) {
                // theres no color here, so return
                return;
            }

            if (shadeType === ShadeMode.LIGHTEN) {
                let colorToApply = this._calculateColor(currColor, strength);
                console.log(shadeType, strength, currColor, colorToApply);
                grid.color = colorToApply;
                grid.setData({x, y}, colorToApply, true);
            }
        }
    }

    private _calculateColor(color: RGBAColor, strength: number): RGBAColor {

        let r = color.r * strength;
        let g = color.g * strength;
        let b = color.b * strength;

        return { r: Math.round((255 - r) * strength + r), g: Math.round((255 - g) * strength + g), b: Math.round((255 - b) * strength + b), a: color.a };

        // let threshold = 255.999;
        // let m = Math.max(r, g, b);

        // if (m <= threshold) {
        //     return Utils.copyColor(color);
        // }

        // let total = r + g + b;

        // if (total >= 3 * threshold) {
        //     return { r: Math.round(threshold), g: Math.round(threshold), b: Math.round(threshold), a: color.a };
        // }

        // let z = (3 * threshold - total) / (3 * m - total);
        // let gray = threshold - z * m;

        // return { r: Math.round(gray + z * r), g: Math.round(gray + z * g), b: Math.round(gray + z * b), a: color.a };
    }

    previewCursor(event: GridMouseEvent): void {
        if (this.$iApi.cursor.grid) {

            // this.$iApi.cursor.clearCursor();

            // let pxWidth = this._brushWidthProperty.value;
            // let x = Math.round(event.coords.pixel.x - (pxWidth / 2.0));
            // let y = Math.round(event.coords.pixel.y - (pxWidth / 2.0));

            // this.$iApi.cursor.grid.rect({x, y}, pxWidth, pxWidth);
        }
    }
}