import { APIScope, InstanceAPI, GridAPI, CursorAPI } from '.';
import Panzoom, { PanzoomObject, ZoomOptions } from "@panzoom/panzoom";
import { Application, FederatedMouseEvent } from 'pixi.js';
import { Events, PixelCoordinates } from './utils';

export class CanvasAPI extends APIScope {

    private _grid: GridAPI;
    private _cursor: CursorAPI;

    private _panzoom: PanzoomObject;
    private _pixi: Application;

    private _mirrorX: boolean;
    private _mirrorY: boolean;

    constructor(iApi: InstanceAPI, pixi: Application) {
        super(iApi);

        this._mirrorX = iApi.state.loadedState?.canvas.settings.mirrorX ?? false;
        this._mirrorY = iApi.state.loadedState?.canvas.settings.mirrorY ?? false;

        this._pixi = pixi;

        this._pixi.renderer.clear();

        // set up pixi handlers
        pixi.canvas.classList.add("pxl-canvas"); // add the style class

        let isDragging = false;
        let lastCell: PixelCoordinates | undefined = undefined;
        const getCoords = (event: FederatedMouseEvent) => {
            const localPos = event.getLocalPosition(pixi.stage, { x: event.globalX, y: event.globalY })
            return { x: Math.abs(Math.floor(localPos.x)), y: Math.abs(Math.floor(localPos.y)) };
        }

        pixi.stage.eventMode = 'static';
        pixi.stage.hitArea = pixi.screen;

        pixi.stage
            .on('pointerdown', (event) => {
                const coords = getCoords(event);
                if (event.button === 0) {
                    isDragging = true;
                    this.$iApi.event.emit(Events.MOUSE_DRAG_START, { coords, isDragging, isOnCanvas: true });
                    lastCell = { x: coords.x, y: coords.y };
                }
            })
            .on('pointerup', (event) => {
                const coords = getCoords(event);
                if (event.button === 0) {
                    isDragging = false;
                    this.$iApi.event.emit(Events.MOUSE_DRAG_STOP, { coords, isDragging, isOnCanvas: true });
                }
            })
            .on('pointerupoutside', (event) => {
                const coords = getCoords(event);
                if (event.button === 0) {
                    isDragging = false;
                    this.$iApi.event.emit(Events.MOUSE_DRAG_STOP, { coords, isDragging, isOnCanvas: false });
                }
            })
            .on('pointermove', (event) => {
                const coords = getCoords(event);
                if (!(coords.x === lastCell?.x && coords.y === lastCell?.y)) {
                    this.$iApi.event.emit(Events.MOUSE_MOVE, { coords, isDragging, isOnCanvas: true });
                    lastCell = { x: coords.x, y: coords.y };
                }
            })
            .on('pointerout', () => {
                this.$iApi.event.emit(Events.CANVAS_MOUSE_LEAVE);
            })
            .on('pointerenter', () => {
                this.$iApi.event.emit(Events.CANVAS_MOUSE_ENTER);
            });

        // set up panzoom

        const canvasParent = pixi.canvas.parentElement!;
        const pbr = canvasParent.getBoundingClientRect();

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

        if (this.$iApi.state.loadedState?.canvas) {
            this._mirrorX = this.$iApi.state.loadedState.canvas.settings.mirrorX ?? false;
            this._mirrorY = this.$iApi.state.loadedState.canvas.settings.mirrorY ?? false;
        }
    }

    destroy(): void {

        window.onresize = null;
        window.onwheel = null;
        window.onpointerdown = null;

        this._grid.destroy();

        this._cursor.destroy();

        this._panzoom.destroy();

        this._pixi.destroy();
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

    get grid(): GridAPI {
        return this._grid;
    }

    get cursor(): CursorAPI {
        return this._cursor;
    }

    get width(): number {
        return this._pixi.canvas.width;
    }

    get height(): number {
        return this._pixi.canvas.height;
    }

    get view(): HTMLCanvasElement {
        return this._pixi.canvas;
    }

    get mirrorX(): boolean {
        return this._mirrorX;
    }

    set mirrorX(val: boolean) {
        this._mirrorX = val;
    }

    get mirrorY(): boolean {
        return this._mirrorY;
    }

    set mirrorY(val: boolean) {
        this._mirrorY = val;
    }
}
