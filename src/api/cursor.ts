import { InstanceAPI, Events, GridAPI } from '.';

export class CursorAPI extends GridAPI {

    private _cursorActive: boolean;

    constructor(iApi: InstanceAPI, el: HTMLCanvasElement, width: number, height: number) {
        super(iApi, el, width, height);

        this._cursorActive = true;

        this.initialize();
    }

    initialize(): void {
        this.clearCursor();
    }

    destroy(): void {
        this._el!.onmousemove = null;
        this._el!.onmouseenter = null;
        this._el!.onmouseleave = null;
    }

    clearCursor(): void {
        if (this._cursorActive) {
            this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
            this._cursorActive = false;
        }
    }

    get cursorActive(): boolean {
        return this._cursorActive
    }

    set cursorActive(cursorActive: boolean) {
        this._cursorActive = cursorActive;
    }
}
