import { APIScope, InstanceAPI, Events, RGBAColor, Utils, CanvasCoordinates, PixelCoordinates } from '.';

export class GridAPI extends APIScope {

    private _pixelWidth: number;
    private _pixelHeight: number;
    private _canvasWidth: number;
    private _canvasHeight: number;
    private _widthRatio: number;
    private _heightRatio: number;
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
        this._widthRatio = Math.floor(this._canvasWidth * 1.0 / this._pixelWidth);
        this._heightRatio = Math.floor(this._canvasHeight * 1.0 / this._pixelHeight);
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

    set(coords: PixelCoordinates, overwrite: boolean = false) {
        this._setData(coords, this._color, overwrite);
        this._notify();
    }

    rect(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {
        this._drawDataRect(topLeft, width, height, fill)
        this._notify();
    }

    ellipse(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {
        this._drawDataEllipse(topLeft, width, height, fill)
        this._notify();
    }

    line(start: PixelCoordinates, end: PixelCoordinates, width: number): void {
        this._drawDataLine(start, end, width)
        this._notify();
    }

    floodFill(coords: PixelCoordinates, tolerance: number): void {
        this._dataFloodFill(coords, tolerance);
        this._notify();
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

    getDataRect(topLeft: PixelCoordinates, width: number, height: number): Array<[PixelCoordinates, RGBAColor]> {
        if (!this._preserveData) {
            throw new Error("attempted to get data from grid with preserveData set to false");
        }

        // top left coords
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);

        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        let data: Array<[PixelCoordinates, RGBAColor]> = [];

        // bottom right corner x and y
        let bx = Math.min(tx + width, this.pixelWidth);
        let by = Math.min(ty + height, this.pixelHeight);

        // get all pixels
        for (let x = tx; x < bx; x++) {
            for (let y = ty; y < by; y++) {
                let coords = {x, y};
                let idx = this._flattenCoords(coords);
                data.push([coords, {
                    r: this._data[idx],
                    g: this._data[idx + 1],
                    b: this._data[idx + 2],
                    a: this._data[idx + 3]
                }]);
            }
        }

        return data;
    }

    toPixelCoords(coords: CanvasCoordinates): PixelCoordinates {
        return {
            x: Math.floor(coords.x / (this._widthRatio * 1.0)),
            y: Math.floor(coords.y / (this._heightRatio * 1.0))
        }
    }

    toCanvasCoords(coords: PixelCoordinates): CanvasCoordinates {
        return {
            x: coords.x * this._widthRatio,
            y: coords.y * this._heightRatio
        }
    }

    private _drawDataRect(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {

        // top left coords
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);

        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        // bottom right corner x and y
        let bx = Math.min(tx + width, this.pixelWidth);
        let by = Math.min(ty + height, this.pixelHeight);

        if (fill) {
            // fill all pixels
            for (let x = tx; x < bx; x++) {
                for (let y = ty; y < by; y++) {
                    // draw
                    this._setData({x, y});
                }
            }
        } else {
            // draw only perimeter
            for (let x = tx; x < bx; x++) {
                // draw horizontal sides
                this._setData({x, y: ty});
                this._setData({x, y: by - 1});
            }
            for (let y = ty + 1; y < by - 1; y++) {
                // draw vertical sides
                this._setData({x: tx, y});
                this._setData({x: bx - 1, y});
            }
        }
    }

    private _drawDataEllipse(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {

        // use Midpoint ellipse algorithm
        // https://en.wikipedia.org/wiki/Midpoint_circle_algorithm

        // top left coords
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);

        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        // handle base-cases quickly
        if (width === 1 && height === 1) {
            // if it is just a point, draw point and return
            this._setData({x: tx, y: ty});
            return;
        } else if (width === 2 && height === 2) {
            // if it is 2x2, then draw rect
            this._setData({x: tx, y: ty});
            this._setData({x: tx + 1, y: ty});
            this._setData({x: tx, y: ty + 1});
            this._setData({x: tx + 1, y: ty + 1});
            return;
        }

        // offsets for even width or height
        let ewo = (width + 1) % 2;
        let eho = (height + 1) % 2;

        // semi major and minor axes
        let rx = Math.round(width / 2.0) - (width % 2);
        let ry = Math.round(height / 2.0) - (height % 2);

        // center coord
        let xc = tx + rx;
        let yc = ty + ry;

        // init x and y, we use this to progressively draw the ellipse
        let x = 0;
        let y = ry;

        // decision parameters for region 1 of ellipse
        let d1 = ((ry * ry) - (rx * rx * ry) + (0.25 * rx * rx));
        let dx = 2 * ry * ry * x;
        let dy = 2 * rx * rx * y;

        // what follows is some number magic and idk how any of this works

        // draw region 1
        while (dx < dy) {

            // set points based 4 point symmetry
            // check if x is 0 to avoid duplication
            if (x === 0) {
                if (ewo !== 1) {
                    this._setData({x: x + xc - ewo, y: y + yc - eho});
                    this._setData({x: -x + xc, y: -y + yc});
                }
            } else {
                this._setData({x: x + xc - ewo, y: y + yc - eho});
                this._setData({x: -x + xc, y: y + yc - eho});
                this._setData({x: x + xc - ewo, y: -y + yc});
                this._setData({x: -x + xc, y: -y + yc});
            }

            if (fill) {
                // draw vertical scanlines
                for (let i = -y + yc + 1; i < y + yc - eho; i++) {

                    if (x === 0 && ewo === 1) continue;

                    this._setData({x: x + xc - ewo, y: i});

                    if (x !== 0) {
                        this._setData({x: -x + xc,  y: i});
                    }
                }
            }

            // update decision parameter
            if (d1 < 0) {
                x += 1;
                dx = dx + (2 * ry * ry);
                d1 = d1 + dx + (ry * ry);
            } else {
                x += 1;
                y -= 1;
                dx = dx + (2 * ry * ry);
                dy = dy - (2 * rx * rx);
                d1 = d1 + dx - dy + (ry * ry);
            }
        }

        // keep track of last x, we need this when drawing the horizontal scanlines
        let lx = x;

        // decision parameters for region 1
        let d2 = (((ry * ry) * ((x + 0.5) * (x + 0.5))) + ((rx * rx) * ((y - 1) * (y - 1))) - (rx * rx * ry * ry));

        // draw region 2
        while (y >= 0) {

            // set points based 4 point symmetry
            if (y === 0) {
                if (eho !== 1) {
                    this._setData({x: x + xc - ewo, y: y + yc - eho});
                    this._setData({x: -x + xc, y: -y + yc});
                }
            } else {
                this._setData({x: x + xc - ewo, y: y + yc - eho});
                this._setData({x: -x + xc, y: y + yc - eho});
                this._setData({x: x + xc - ewo, y: -y + yc});
                this._setData({x: -x + xc, y: -y + yc});
            }

            if (fill) {
                // draw horizontal scanlines
                let j = 0;
                for (let i = -x + xc + 1; i < -lx + xc + 1; i++) {

                    if (y === 0 && eho === 1) continue;

                    this._setData({x: x + xc - j - 1 - ewo, y: y + yc - eho});
                    this._setData({x: i, y: y + yc - eho});

                    if (y !== 0) {
                        this._setData({x: i, y: -y + yc});
                        this._setData({x: x + xc - j - 1 - ewo, y: -y + yc});
                    }

                    j++;
                }
            }

            // update decision parameter
            if (d2 > 0) {
                y -= 1;
                dy = dy - (2 * rx * rx);
                d2 = d2 + (rx * rx) - dy;
            } else {
                y -= 1;
                x += 1;
                dx = dx + (2 * ry * ry);
                dy = dy - (2 * rx * rx);
                d2 = d2 + dx - dy + (rx * rx);
            }
        }
    }

    private _drawDataLine(start: PixelCoordinates, end: PixelCoordinates, width: number): void {

        // use Bresenham's line algorithm with anti-aliasing (it's magic)
        // https://gist.github.com/randvoorhies/807ce6e20840ab5314eb7c547899de68

        let x0 = Math.max(start.x, 0);
        let y0 = Math.max(start.y, 0);

        let x1 = Math.max(end.x, 0);
        let y1 = Math.max(end.y, 0);

        let dx =  Math.abs(x1 - x0);
        let sx = x0 < x1 ? 1 : -1;
        let dy = -Math.abs(y1 - y0);
        let sy = y0 < y1 ? 1 : -1;
        let err = dx + dy
        let e2;

        while(true) {
            this._setData({x: x0, y: y0});

            // repeat the line above and below based on the width
            let alt = -1;
            for (let i = 1; i < width; i++) {
                let y_o = alt * Math.floor((i + 1) / 2);
                this._setData({x: x0, y: y0 + y_o});
                alt = -alt;
            }

            if (x0 === x1 && y0 === y1) {
                break;
            }

            e2 = 2*err;

            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }

            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    private _dataFloodFill(coords: PixelCoordinates, tolerance: number): void {

        if (!this._color) {
            // early exit
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
            this._setData({x, y});
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
    }

    _setData(coords: PixelCoordinates, color: RGBAColor | undefined = undefined, overwrite: boolean = false): void {

        let idx = this._flattenCoords(coords);
        let canvasCoords = this.toCanvasCoords(coords);

        let colorToApply = color ?? this._color;

        if (colorToApply) {

            if (this._preserveData) {
                // calculate resulting color
                let a0 = colorToApply.a / 255.0;
                let a1 = this._data[idx + 3] / 255.0;
                let r0 = colorToApply.r;
                let r1 = this._data[idx];
                let g0 = colorToApply.g;
                let g1 = this._data[idx + 1];
                let b0 = colorToApply.b;
                let b1 = this._data[idx + 2];

                let aa = (1 - a0) * a1 + a0;
                let rr = ((1 - a0) * a1 * r1 + a0 * r0) / aa;
                let gg = ((1 - a0) * a1 * g1 + a0 * g0) / aa;
                let bb = ((1 - a0) * a1 * b1 + a0 * b0) / aa;

                if (overwrite) {
                    rr = r0;
                    gg = g0;
                    bb = b0;
                    aa = a0;
                }

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
                this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);

            } else {
               // set color to canvas using current color
               this._ctx.fillStyle = Utils.rgbaToHex(colorToApply);
               this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);
            }


        } else {

            if (this._preserveData) {
                this._data[idx] = 0;
                this._data[idx + 1] = 0;
                this._data[idx + 2] = 0;
                this._data[idx + 3] = 0;
            }

            // clear canvas
            this._ctx.clearRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);
        }
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

    get widthRatio(): number {
        return this._widthRatio;
    }

    get heightRatio(): number {
        return this._heightRatio;
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
