import { InstanceAPI, APIScope } from '.';

export class CursorAPI extends APIScope {

    private _pixelWidth: number;
    private _pixelHeight: number;
    private _canvasWidth: number;
    private _canvasHeight: number;
    private _el: HTMLCanvasElement | undefined;
    private _ctx: CanvasRenderingContext2D | undefined;

    private _cursorActive: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._pixelWidth = 1;
        this._pixelHeight = 1;
        this._canvasWidth = 1;
        this._canvasHeight = 1;

        this._cursorActive = true;
    }

    initialize(el: HTMLCanvasElement, canvasWidth: number, canvasHeight: number, width: number, height: number): void {
        this._el = el;

        this._el.width = canvasWidth;
        this._el.height = canvasHeight;

        this._pixelWidth = width;
        this._pixelHeight = height;
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._ctx = this._el.getContext("2d")!;

        this.clearCursor();
    }

    destroy(): void {
        this._ctx = undefined;
        this._el = undefined;
    }

    clearCursor(): void {
        if (this._cursorActive && this._ctx) {
            this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
            this._cursorActive = false;
        }
    }

    get offsetX(): number {
        return Math.floor(this._canvasWidth * 1.0 / this._pixelWidth);
    }

    get offsetY(): number {
        return Math.floor(this._canvasHeight * 1.0 / this._pixelHeight);
    }

    get cursorActive(): boolean {
        return this._cursorActive
    }

    set cursorActive(cursorActive: boolean) {
        this._cursorActive = cursorActive;
    }

    get ctx(): CanvasRenderingContext2D | undefined {
        return this._ctx;
    }
}
