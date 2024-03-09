import { APIScope, InstanceAPI, Events, RGBAColor, PaletteItem } from '.';

export interface CanvasCoordinates {
    x: number;
    y: number;
}

export interface PixelCoordinates {
    x: number;
    y: number;
}

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
        this._data[idx] = color.r;
        this._data[idx + 1] = color.g;
        this._data[idx + 2] = color.b;

        // need to merge opacities
        if (this._data[idx + 3] !== 0) {
            this._data[idx + 3] = this._data[idx + 3] + Math.round((255 - this._data[idx + 3]) * color.a / 255.0)
        } else {
            this._data[idx + 3] = color.a;
        }
    }

    clearData(coords: PixelCoordinates): void {
        let idx = this._flattenCoords(coords);
        this._data[idx] = 0;
        this._data[idx + 1] = 0;
        this._data[idx + 2] = 0;
        this._data[idx + 3] = 0;
        console.log(this._data);
    }

    private _drawDataRect(topLeft: PixelCoordinates, width: number, height: number, color?: RGBAColor) {
        // TODO: make this faster
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
        // flatten coordinates with offset of 4
        return (coords.y * this.pixelHeight + coords.x) * 4;
    }

    private _parseMouseEvent(event: MouseEvent): { canvas: CanvasCoordinates, pixel: PixelCoordinates} {
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
