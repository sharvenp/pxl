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

    protected _pixelWidth: number;
    protected _pixelHeight: number;
    protected _canvasWidth: number;
    protected _canvasHeight: number;
    protected _el: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;

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

    initialize(): void {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        let isDragging = false;
        this._el.onmousedown = (event: MouseEvent)   => {
            if (event.button === 0) {
                isDragging = true;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, { coords: this.parseMouseEvent(event), isDragging });
            }
        };

        this._el.onmouseup = (event: MouseEvent) => {
            if (event.button === 0) {
                isDragging = false;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, { coords: this.parseMouseEvent(event), isDragging });
            }
        };

        this._el.onmouseenter = (event: MouseEvent) => {
            if (event.buttons > 0 && event.buttons === 1) {
                isDragging = true;
                this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_START, { coords: this.parseMouseEvent(event), isDragging });
            }
            this.$iApi.event.emit(Events.CANVAS_MOUSE_ENTER, { coords: this.parseMouseEvent(event), isDragging });
        }

        this._el.onmouseleave = (event: MouseEvent) => {
            isDragging = false;
            this.$iApi.event.emit(Events.CANVAS_MOUSE_DRAG_STOP, { coords: this.parseMouseEvent(event), isDragging });
            this.$iApi.event.emit(Events.CANVAS_MOUSE_LEAVE, { coords: this.parseMouseEvent(event), isDragging });
        }

        this._el.onmousemove = (event: MouseEvent) => {
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

    protected parseMouseEvent(event: MouseEvent): { canvas: CanvasCoordinates, pixel: PixelCoordinates} {
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
