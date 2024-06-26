import { InstanceAPI, APIScope, CURSOR_PREVIEW_COLOR, GridAPI, Utils } from '.';

export class CursorAPI extends APIScope {

    private _grid: GridAPI | undefined;

    private _initialized: boolean;
    private _el: HTMLCanvasElement | undefined;
    private readonly _previewColor = Utils.hexToRGBA(CURSOR_PREVIEW_COLOR);

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._initialized = false;
    }

    initialize(el: HTMLCanvasElement, width: number, height: number, pxWidth: number, pxHeight: number): void {

        this._el = el;
        this._el.width = width;
        this._el.height = height;

        this._grid = new GridAPI(this.$iApi, this._el, pxWidth, pxHeight, false, false);
        this._grid.color = this._previewColor;

        this.clearCursor();

        this._initialized = true;
    }

    destroy(): void {
        this._initialized = false;
        this._grid?.destroy();
        this._grid = undefined;

        this._el = undefined;
    }

    clearCursor(): void {
        this._grid?.clear();
    }

    get initialized(): boolean {
        return this._initialized;
    }

    get grid(): GridAPI | undefined {
        return this._grid;
    }
}
