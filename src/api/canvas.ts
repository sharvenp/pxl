import { APIScope, InstanceAPI, GridAPI } from '.';
import Panzoom, { PanZoom } from "panzoom";
import { CanvasCoordinates, Coordinates, Events, PixelCoordinates } from './utils';

export class CanvasAPI extends APIScope {

    private _grid: GridAPI | undefined;

    private _initialized: boolean;
    private _el: HTMLCanvasElement | undefined;
    private _bgCanvas: HTMLCanvasElement | undefined;
    private _panzoom: PanZoom | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._initialized = false;
    }

    initialize(el: HTMLCanvasElement, bgCanvas: HTMLCanvasElement, width: number, height: number): void {
        if (this._initialized) {
            console.warn("Canvas already intialized");
            return;
        }

        this._el = el;
        this._bgCanvas = bgCanvas;

        this._panzoom = Panzoom(el.parentElement!, {
            minZoom: 0.5,
            maxZoom: 6,
            smoothScroll: false,
            beforeMouseDown: (event) => {
                return event.button !== 1;
            },
            onDoubleClick: () => {
                return false
            }
        });

        if (width > height) {
            this._el.width = 512;
            this._el.height = Math.min(Math.max((height * 1.0 / width) * 512, 32), 1024);
        } else if (width < height) {
        this._el.height = 512;
            this._el.width = Math.min(Math.max((width * 1.0 / height) * 512, 32), 1024);
        } else {
            this._el.width = 512;
            this._el.height = 512;
        }

        this._grid = new GridAPI(this.$iApi, this._el, width, height);

        // draw checkerboard pattern
        let ctx = this._bgCanvas.getContext("2d")!;
        this._bgCanvas.width = this._el.width;
        this._bgCanvas.height = this._el.height;
        let cw = this._bgCanvas.width / width;
        let ch = this._bgCanvas.height / height;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (j % 2 === 0 && i % 2 === 1 || j % 2 === 1 && i % 2 === 0) {
                    ctx.rect(i * cw, j * ch, cw, ch);
                }
            }
        }
        ctx.fillStyle  = '#F9F9F9';
        ctx.fill();

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
            this.$iApi.event.emit(Events.CANVAS_MOUSE_LEAVE, { coords, isDragging });
        }

        this._el.onmousemove = (event: MouseEvent) => {
            let coords = this._parseMouseEvent(event);
            if (!(coords.pixel?.x === lastCell?.x && coords.pixel?.y === lastCell?.y)) {
                this.$iApi.event.emit(Events.CANVAS_MOUSE_MOVE, { coords, isDragging });
                lastCell = coords.pixel;
            }
        };

        this._initialized = true;
    }

    destroy(): void {
        this._initialized = false;
        this._panzoom?.dispose();

        this._grid?.destroy();
        this._grid = undefined;

        this._el!.onmousemove = null;
        this._el!.onmouseup = null;
        this._el!.onmousedown = null;
        this._el!.onmouseenter = null;
        this._el!.onmouseleave = null;
        this._el = undefined;
    }

    private _parseMouseEvent(event: MouseEvent): Coordinates {
        let coords: CanvasCoordinates = { x: event.offsetX, y: event.offsetY };
        let pixelCoords = this._grid!.toPixelCoords(coords);
        return { canvas: coords, pixel: pixelCoords};
    }

    get initialized(): boolean {
        return this._initialized;
    }

    get el(): HTMLCanvasElement | undefined {
        return this._el;
    }

    get grid(): GridAPI | undefined {
        return this._grid;
    }
}
