import { APIScope, InstanceAPI, GridAPI } from '.';
import Panzoom, { PanZoom } from "panzoom";

export class CanvasAPI extends APIScope {

    private grid: GridAPI | undefined;

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
        ctx.fillStyle  = '#F5F5F5';
        ctx.fill();

        this.grid = new GridAPI(this.$iApi, this._el, width, height);
        this._initialized = true;
    }

    destroy(): void {
        this._initialized = false;
        this._panzoom?.dispose();

        this.grid?.destroy();
        this.grid = undefined;

        this._el = undefined;
    }

    get initialized(): boolean {
        return this._initialized;
    }

    set initialized(isInitialized: boolean) {
        this._initialized = isInitialized;
    }

    get el(): HTMLCanvasElement | undefined {
        return this._el;
    }
}
