import { APIScope, InstanceAPI, Events, RGBAColor, Utils, CanvasCoordinates, PixelCoordinates } from '.';

export class GridAPI extends APIScope {

    private _pixelWidth: number;
    private _pixelHeight: number;
    private _canvasWidth: number;
    private _canvasHeight: number;
    private _ctx: CanvasRenderingContext2D;
    private _data: Uint8ClampedArray;
    private _color: RGBAColor | undefined;
    private _preserveData: boolean;
    private _notifyCanvas: boolean;
    private _touched: boolean;

    constructor(iApi: InstanceAPI, el: HTMLCanvasElement, width: number, height: number, preserveData: boolean = true, notifyCanvas: boolean = true) {
        super(iApi);

        this._pixelWidth = width;
        this._pixelHeight = height;
        this._canvasWidth = el.width;
        this._canvasHeight = el.height;
        this._ctx = el.getContext("2d")!;
        this._data = new Uint8ClampedArray(0);
        this._preserveData = preserveData;
        this._notifyCanvas = notifyCanvas;
        this._touched = false;

        this.initialize();
    }

    initialize(): void {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        if (this._preserveData) {
            this._data = new Uint8ClampedArray(this._pixelWidth * this.pixelHeight * 4);
        }
    }

    destroy(): void {
        this._data = new Uint8ClampedArray(0);
        this._color =  undefined;
        this._touched = false;
    }

    clear(): void {

        if (!this._touched) {
            // grid is untouched, so avoid clear call
            return;
        }

        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        if (this._preserveData) {
            this._data = new Uint8ClampedArray(0);
        }

        this._touched = false;
    }

    rect(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {
        this._drawDataRect(topLeft, width, height, fill)
        this._notify();
    }

    circle(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {
        this._drawDataCircle(topLeft, width, height, fill)
        this._notify();
    }

    floodFill(coords: PixelCoordinates, tolerance: number): void {

        // if no color, then there's nothing to fill
        if (!this._color) {
            return;
        }

        // color to check similarity against
        let targetColor = this.getData(coords);

        // use bfs to fill neighboring colors
        let fillStack: Array<PixelCoordinates> = [];
        fillStack.push(coords);

        let validCoords = (c: PixelCoordinates) => (c.x >= 0 && c.x < this.pixelWidth && c.y >= 0 && c.y < this.pixelHeight);

        // keep track of seen colors to prevent revisiting the same cell
        let seenColors: Record<string, boolean> = {};

        while(fillStack.length > 0) {

            let {x, y} = fillStack.pop()!;
            let currCellColor = this.getData({x, y});

            // check current cell color is the fill color
            // if it is, continue
            if (seenColors[Utils.rgbaToString(currCellColor)]) {
                continue;
            }

            // tolerance is the threshold for the color similarity of neighboring cells as a percentage
            // check current cell color is above threshold
            // if it is, continue
            if (Utils.getColorSimilarity(currCellColor, targetColor) > tolerance) {
                continue;
            }

            // fill color
            this.setData({x, y});
            seenColors[Utils.rgbaToString(this.getData({x, y}))] = true;

            if (validCoords({x, y: y + 1})) {
                fillStack.push({x, y: y + 1});
            }
            if (validCoords({x, y: y - 1})) {
                fillStack.push({x, y: y - 1});
            }
            if (validCoords({x: x + 1, y})) {
                fillStack.push({x: x + 1, y});
            }
            if (validCoords({x: x - 1, y})) {
                fillStack.push({x: x - 1, y});
            }
        }

        this._notify();
    }

    setData(coords: PixelCoordinates): void {

        let idx = this._flattenCoords(coords);
        let canvasCoords = this.toCanvasCoords(coords);

        if (this._color) {

            if (this._preserveData) {
                // calculate resulting color
                let a0 = this._color.a / 255.0;
                let a1 = this._data[idx + 3] / 255.0;
                let r0 = this._color.r;
                let r1 = this._data[idx];
                let g0 = this._color.g;
                let g1 = this._data[idx + 1];
                let b0 = this._color.b;
                let b1 = this._data[idx + 2];

                let aa = (1 - a0) * a1 + a0;
                let rr = ((1 - a0) * a1 * r1 + a0 * r0) / aa;
                let gg = ((1 - a0) * a1 * g1 + a0 * g0) / aa;
                let bb = ((1 - a0) * a1 * b1 + a0 * b0) / aa;

                let dataColor: RGBAColor = {
                    r: Math.round(rr),
                    g: Math.round(gg),
                    b: Math.round(bb),
                    a: Math.round(aa * 255)
                };

                this._data[idx] = dataColor.r;
                this._data[idx + 1] = dataColor.g;
                this._data[idx + 2] = dataColor.b;
                this._data[idx + 3] = dataColor.a;

                // set color to canvas
                this._ctx.fillStyle = Utils.rgbaToHex(dataColor);
                this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this.offsetX, this.offsetY);

            } else {
               // set color to canvas using current color
               this._ctx.fillStyle = Utils.rgbaToHex(this._color);
               this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this.offsetX, this.offsetY);
            }


        } else {

            if (this._preserveData) {
                this._data[idx] = 0;
                this._data[idx + 1] = 0;
                this._data[idx + 2] = 0;
                this._data[idx + 3] = 0;
            }

            // clear canvas
            this._ctx.clearRect(canvasCoords.x, canvasCoords.y, this.offsetX, this.offsetY);
        }
    }

    getData(coords: PixelCoordinates): RGBAColor {
        if (!this._preserveData) {
            throw new Error("attempted to get data from grid with preserveData set to false");
        }

        let idx = this._flattenCoords(coords);
        let c: RGBAColor = {
            r: this._data[idx],
            g: this._data[idx + 1],
            b: this._data[idx + 2],
            a: this._data[idx + 3]
        }
        return c
    }

    toPixelCoords(coords: CanvasCoordinates): PixelCoordinates {
        return {
            x: Math.floor(coords.x / (this.offsetX * 1.0)),
            y: Math.floor(coords.y / (this.offsetY * 1.0))
        }
    }

    toCanvasCoords(coords: PixelCoordinates): CanvasCoordinates {
        return {
            x: coords.x * this.offsetX,
            y: coords.y * this.offsetY
        }
    }

    private _drawDataRect(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true, clear: boolean = false) {
        // TODO: make this faster?
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);
        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        let bx = Math.min(tx + width, this.pixelWidth);
        let by = Math.min(ty + height, this.pixelHeight);
        for (let x = tx; x < bx; x++) {
            for (let y = ty; y < by; y++) {
                if (!fill && ((x > tx && x < bx - 1) && (y > ty  && y < by - 1))) {
                    // inside perimeter but we don't want to fill
                    continue;
                }

                // draw
                this.setData({x, y});
            }
        }
    }

    private _drawDataCircle(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true, clear: boolean = false) {
        // TODO: make this faster?
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);
        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        let bx = Math.min(tx + width, this.pixelWidth);
        let by = Math.min(ty + height, this.pixelHeight);

        for (let x = tx; x < bx; x++) {
            for (let y = ty; y < by; y++) {
                if (!fill && ((x > tx && x < bx - 1) && (y > ty  && y < by - 1))) {
                    // inside perimeter but we don't want to fill
                    continue;
                }

                // draw
                this.setData({x, y});
            }
        }
    }

    private _distance(p1: PixelCoordinates, p2: PixelCoordinates)
    {
       let dx = p2.x - p1.x;
       dx *= dx;

       let dy = p2.y - p1.y;
       dy *= dy;

       return Math.sqrt(dx + dy);
    }

    private _flattenCoords(coords: PixelCoordinates): number {
        // flatten coordinates with offset of 4 [r,g,b,a]
        return (coords.y * this.pixelHeight + coords.x) * 4;
    }

    private _notify(): void {
        this._touched = true;
        if (this._notifyCanvas) {
            this.$iApi.event.emit(Events.CANVAS_UPDATE);
        }
    }

    get offsetX(): number {
        return Math.floor(this._canvasWidth * 1.0 / this._pixelWidth);
    }

    get offsetY(): number {
        return Math.floor(this._canvasHeight * 1.0 / this._pixelHeight);
    }

    get pixelWidth(): number {
        return this._pixelWidth;
    }

    get pixelHeight(): number {
        return this._pixelHeight;
    }

    get canvasWidth(): number {
        return this._canvasWidth;
    }

    get canvasHeight(): number {
        return this._canvasHeight;
    }

    get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }

    get color(): RGBAColor | undefined {
        return this._color;
    }

    set color(newColor: RGBAColor | undefined) {
        this._color = newColor;
    }
}
