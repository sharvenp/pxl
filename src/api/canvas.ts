import { APIScope, InstanceAPI, GridAPI, CursorAPI } from '.';
import Panzoom, { PanzoomObject, ZoomOptions } from "@panzoom/panzoom";
import { Application } from 'pixi.js';
import { Events } from './utils';


export class CanvasAPI extends APIScope {

    private _grid: GridAPI | undefined;
    private _cursor: CursorAPI | undefined;

    private _initialized: boolean;
    private _panzoom: PanzoomObject | undefined;
    private _pixi: Application | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._initialized = false;
    }

    initialize(pixi: Application): void {
        if (this._initialized) {
            console.warn("Canvas already intialized");
            return;
        }

        this._pixi = pixi;

        this._pixi.renderer.clear();

        // set up panzoom

        let canvasParent = pixi.canvas.parentElement!;
        let pbr = canvasParent.getBoundingClientRect();

        const scaleX = pbr.width / pixi.canvas.width;
        const scaleY = pbr.height / pixi.canvas.height;
        const scale = Math.round(Math.min(scaleX, scaleY) * 0.7);

        this._panzoom = Panzoom(canvasParent, {
            minScale: Math.floor(scale * 0.5),
            maxScale: Math.ceil(scale * 20),
            cursor: 'default'
        });

        // add scroll wheen zoom listener
        canvasParent.onwheel = this._handleZoom.bind(this);

        // add pan listener (remove existing listener)
        canvasParent.removeEventListener('pointerdown', this._panzoom.handleDown);
        canvasParent.onpointerdown = this._handlePan.bind(this);

        // ensure pixel-perfect positioning
        this._handleResize();
        window.onresize = this._handleResize.bind(this);

        // zoom in to canvas to fit into screen
        this._panzoom.zoom(scale, { animate: true });

        // initialize grid
        this._grid = new GridAPI(this.$iApi, this._pixi);
        this._cursor = new CursorAPI(this.$iApi, this._pixi);

        this._initialized = true;

        this.$iApi.event.emit(Events.CANVAS_INITIALIZED);
    }

    destroy(): void {
        this._initialized = false;

        window.onresize = null;
        window.onwheel = null;
        window.onpointerdown = null;

        this._grid?.destroy();
        this._grid = undefined;

        this._cursor?.destroy();
        this._cursor = undefined;

        this._pixi?.destroy();
    }

    private _handlePan(event: PointerEvent) {
        if (event.button !== 1) {
            return;
        }
        this._panzoom?.handleDown(event);
    }

    private _handleZoom(event: WheelEvent, zoomOptions?: ZoomOptions) {
        this._panzoom?.zoomWithWheel(event, zoomOptions);
    }

    private _handleResize() {
        if (this._pixi) {
            const rect = this._pixi.canvas.parentElement!.getBoundingClientRect();
            const m = new WebKitCSSMatrix(this._pixi.canvas.parentElement!.style.transform);

            const w2 = Math.floor((rect.height / m.a) / 2);
            const h2 = Math.floor((rect.width / m.d) / 2);

            this._pixi.canvas.style.bottom = `${w2}px`;
            this._pixi.canvas.style.right = `${h2}px`;
        }
    }

    get initialized(): boolean {
        return this._initialized;
    }

    get grid(): GridAPI | undefined {
        return this._grid;
    }

    get cursor(): CursorAPI | undefined {
        return this._cursor;
    }

    get width(): number {
        return this._pixi?.canvas.width ?? 0;
    }

    get height(): number {
        return this._pixi?.canvas.height ?? 0;
    }

    get view(): HTMLCanvasElement | undefined {
        return this._pixi?.canvas;
    }
}
