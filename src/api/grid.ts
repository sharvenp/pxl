import { APIScope, InstanceAPI, Events } from '.';

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

    constructor(iApi: InstanceAPI, el: HTMLCanvasElement, width: number, height: number) {
        super(iApi);

        this._el = el;

        this._pixelWidth = width;
        this._pixelHeight = height;
        this._canvasWidth = el.width;
        this._canvasHeight = el.height;
        this._ctx = el.getContext("2d")!;

        this.initialize();
    }

    draw(pixelCoords: PixelCoordinates): void {
        this._ctx.fillRect(pixelCoords.x * this.offsetX, pixelCoords.y * this.offsetY, this.offsetX, this.offsetY);
    }

    initialize(): void {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        let isDragging = false;
        this._el.onmousedown = (event: MouseEvent) => {
            if (event.button === 0) {
                let c = this.parseMouseEvent(event);
                isDragging = true;
                this.draw(c.pixel);
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, this.parseMouseEvent(event));
            }
        };

        this._el.onmouseup = (event: MouseEvent) => {
            if (event.button === 0) {
                isDragging = false;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, this.parseMouseEvent(event));
            }
        };

        this._el.onmouseenter = (event: MouseEvent) => {
            if (event.buttons > 0 && event.buttons == 1) {
                let c = this.parseMouseEvent(event);
                isDragging = true;
                this.draw(c.pixel);
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, this.parseMouseEvent(event));
            }
        }

        this._el.onmouseleave = (event: MouseEvent) => {
            isDragging = false;
            this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, this.parseMouseEvent(event));
        }

        this._el.onmousemove = (event: MouseEvent) => {
            let coords = this.parseMouseEvent(event);
            if (isDragging) {
                this.draw(coords.pixel);
            }

            this.$iApi.event.emit(Events.CANVAS_MOUSE_MOVE, { coords: this.parseMouseEvent(event), isDragging });
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

    private parseMouseEvent(event: MouseEvent): { canvas: CanvasCoordinates, pixel: PixelCoordinates} {
        let coords: CanvasCoordinates = { x: event.offsetX, y: event.offsetY };
        let pixelCoords = this.toPixelCoords(coords);
        return { canvas: coords, pixel: pixelCoords};
    }

    get offsetX(): number {
        return Math.floor(this._canvasWidth * 1.0 / this._pixelWidth);
    }

    get offsetY(): number {
        return Math.floor(this._canvasHeight * 1.0 / this._pixelHeight);
    }
}
