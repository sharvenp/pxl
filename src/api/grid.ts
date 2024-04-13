import { APIScope, InstanceAPI, Events, RGBAColor, PaletteItem, Utils, CanvasCoordinates, PixelCoordinates, Coordinates } from '.';

export class GridAPI extends APIScope {

    private _pixelWidth: number;
    private _pixelHeight: number;
    private _canvasWidth: number;
    private _canvasHeight: number;
    private _el: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _data: Uint8ClampedArray;

    constructor(iApi: InstanceAPI, el: HTMLCanvasElement, width: number, height: number) {
        super(iApi);

        this._el = el;

        this._pixelWidth = width;
        this._pixelHeight = height;
        this._canvasWidth = el.width;
        this._canvasHeight = el.height;
        this._ctx = el.getContext("2d", { willReadFrequently: true })!;
        this._data = new Uint8ClampedArray(0);

        this.initialize();
    }

    initialize(): void {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        this._data = new Uint8ClampedArray(this._pixelWidth * this.pixelHeight * 4);

        let isDragging = false;
        let lastCell: PixelCoordinates | undefined = undefined;
        this._el.onmousedown = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            if (event.button === 0) {
                isDragging = true;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, { coords , isDragging });
                lastCell = coords.pixel;
            }
        };

        this._el.onmouseup = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            if (event.button === 0) {
                isDragging = false;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, { coords, isDragging });
            }
        };

        this._el.onmouseenter = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            if (event.buttons > 0 && event.buttons === 1) {
                isDragging = true;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, { coords, isDragging });
                lastCell = coords.pixel;
            }
            this.$iApi.event.emit(Events.CANVAS_MOUSE_ENTER, { coords, isDragging });
        }

        this._el.onmouseleave = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            isDragging = false;
            this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, { coords, isDragging });
            this.$iApi.event.emit(Events.CANVAS_MOUSE_LEAVE, { coords, isDragging });
        }

        this._el.onmousemove = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            if (!this._coordsIsEqual(coords.pixel, lastCell)) {
                this.$iApi.event.emit(Events.CANVAS_MOUSE_MOVE, { coords, isDragging });
                lastCell = coords.pixel;
            }
        };
    }

    destroy(): void {
        this._el!.onmousemove = null;
        this._el!.onmouseup = null;
        this._el!.onmousedown = null;
        this._el!.onmouseenter = null;
        this._el!.onmouseleave = null;
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

    fillRect(topLeft: PixelCoordinates, width: number, height: number, color: PaletteItem): void {
        let canvasCoords = this.toCanvasCoords(topLeft);
        this._ctx.fillStyle = color.colorHex;
        this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this.offsetX * width, this.offsetY * height);

        this._drawDataRect(topLeft, width, height, color.colorRGBA)

        this._notify();
    }

    clearRect(topLeft: PixelCoordinates, width: number, height: number): void {
        let canvasCoords = this.toCanvasCoords(topLeft);
        this._ctx.clearRect(canvasCoords.x, canvasCoords.y, this.offsetX * width, this.offsetY * height);

        this._drawDataRect(topLeft, width, height)

        this._notify();
    }

    floodFill(coords: PixelCoordinates, tolerance: number, color: PaletteItem) {

        // color to check similarity against
        let targetColor = this.getData(coords);

        // use bfs to fill neighboring colors
        let fillStack: Array<PixelCoordinates> = [];
        fillStack.push(coords);

        let validCoords = (c: PixelCoordinates) => (c.x >= 0 && c.x < this.pixelWidth && c.y >= 0 && c.y < this.pixelHeight);

        // keep track of seen colors to prevent revisiting the same cell
        let seenColors: Record<string, boolean> = {};

        this._ctx.fillStyle = color.colorHex;

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
            let canvasCoords = this.toCanvasCoords({x, y});
            this.setData({x, y}, color.colorRGBA);
            this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this.offsetX, this.offsetY);
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

    getData(coords: PixelCoordinates): RGBAColor {
        let idx = this._flattenCoords(coords);
        let c: RGBAColor = {
            r: this._data[idx],
            g: this._data[idx + 1],
            b: this._data[idx + 2],
            a: this._data[idx + 3]
        }
        return c
    }

    setData(coords: PixelCoordinates, color: RGBAColor): void {
        let idx = this._flattenCoords(coords);

        // calculate resulting color
        let a0 = color.a / 255.0;
        let a1 = this._data[idx + 3] / 255.0;
        let r0 = color.r;
        let r1 = this._data[idx];
        let g0 = color.g;
        let g1 = this._data[idx + 1];
        let b0 = color.b;
        let b1 = this._data[idx + 2];

        let aa = (1 - a0) * a1 + a0;
        let rr = ((1 - a0) * a1 * r1 + a0 * r0) / aa;
        let gg = ((1 - a0) * a1 * g1 + a0 * g0) / aa;
        let bb = ((1 - a0) * a1 * b1 + a0 * b0) / aa;

        this._data[idx] = Math.round(rr);
        this._data[idx + 1] = Math.round(gg);
        this._data[idx + 2] = Math.round(bb);
        this._data[idx + 3] = Math.round(aa * 255);
    }

    clearData(coords: PixelCoordinates): void {
        let idx = this._flattenCoords(coords);
        this._data[idx] = 0;
        this._data[idx + 1] = 0;
        this._data[idx + 2] = 0;
        this._data[idx + 3] = 0;
    }

    private _drawDataRect(topLeft: PixelCoordinates, width: number, height: number, color?: RGBAColor) {
        // TODO: make this faster?
        let tx = Math.max(topLeft.x, 0);
        let ty = Math.max(topLeft.y, 0);
        if (topLeft.x < 0) {
            width = width + topLeft.x;
        }
        if (topLeft.y < 0) {
            height = height + topLeft.y;
        }

        for (let x = tx; x < Math.min(tx + width, this.pixelWidth); x++) {
            for (let y = ty; y < Math.min(ty + height, this.pixelHeight); y++) {
                if (!color) {
                    // clear
                    this.clearData({x, y});
                } else {
                    // draw
                    this.setData({x, y}, color);
                }
            }
        }
    }

    private _flattenCoords(coords: PixelCoordinates): number {
        // flatten coordinates with offset of 4 [r,g,b,a]
        return (coords.y * this.pixelHeight + coords.x) * 4;
    }

    private _parseMouseEvent(event: MouseEvent): Coordinates {
        let coords: CanvasCoordinates = { x: event.offsetX, y: event.offsetY };
        let pixelCoords = this.toPixelCoords(coords);
        return { canvas: coords, pixel: pixelCoords};
    }

    private _coordsIsEqual(coords: PixelCoordinates | CanvasCoordinates | undefined, other: PixelCoordinates | CanvasCoordinates | undefined): boolean {
        return coords?.x === other?.x && coords?.y === other?.y;
    }

    private _notify(): void {
        this.$iApi.event.emit(Events.CANVAS_UPDATE);
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
}
