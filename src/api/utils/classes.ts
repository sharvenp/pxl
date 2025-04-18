import { PxlGraphicLogEntry, PxlGraphicMethodType, SelectedRegionData } from ".";
import { Graphics, FillInput, StrokeInput } from 'pixi.js';

export class SelectedRegion {

    private _originalX: number;
    private _originalY: number;
    private _x: number;
    private _y: number;
    private _lastX: number;
    private _lastY: number;
    private _width: number;
    private _height: number

    private _pixels: Array<SelectedRegionData>;

    constructor(originalX: number, originalY: number, width: number, height: number, pixels: Array<SelectedRegionData>) {
        this._originalX = originalX;
        this._originalY = originalY;
        this._x = originalX;
        this._y = originalY;
        this._width = width;
        this._height = height;

        this._lastX = -1;
        this._lastY = -1;

        this._pixels = pixels;
    }

    transform(dx: number, dy: number) {
        // keep track of previous x,y values
        if (this._lastX === -1) {
            this._lastX = this._x;
        }
        if (this._lastY === -1) {
            this._lastY = this._y;
        }

        // transform in delta direction
        this._x = this._lastX + dx;
        this._y = this._lastY + dy;

        this._pixels.forEach(pair => {

            // keep track of previous x,y values
            if (pair.lastCoords.x === -1) {
                pair.lastCoords.x = pair.currentCoords.x;
            }
            if (pair.lastCoords.y === -1) {
                pair.lastCoords.y = pair.currentCoords.y;
            }

            // move the position
            pair.currentCoords.x = pair.lastCoords.x + dx;
            pair.currentCoords.y = pair.lastCoords.y + dy;

        });
    }

    stopTransform() {
        this._lastX = -1;
        this._lastY = -1;

        this._pixels.forEach(pair => {
            pair.lastCoords.x = -1;
            pair.lastCoords.y = -1;
        });
    }

    revertTransform() {
        this._x = this._originalX;
        this._y = this._originalY;

        this._pixels.forEach(pair => {
            pair.currentCoords.x = pair.originalCoords.x;
            pair.currentCoords.y = pair.originalCoords.y;
        });
        this.stopTransform();
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get pixels(): Array<SelectedRegionData> {
        return this._pixels;
    }
}

export class PxlGraphic extends Graphics {

    private _callLog: Array<PxlGraphicLogEntry>;

    constructor(...args: ConstructorParameters<typeof Graphics>) {
        super(...args);

        this._callLog = [];
    }

    rect(x: number, y: number, width: number, height: number): this {
        this._logDrawCall(PxlGraphicMethodType.RECT, [x, y, width, height]);
        return super.rect(x, y, width, height);
    }

    ellipse(x: number, y: number, width: number, height: number): this {
        this._logDrawCall(PxlGraphicMethodType.ELLIPSE, [x, y, width, height]);
        return super.ellipse(x, y, width, height);
    }

    moveTo(x: number, y: number): this {
        this._logDrawCall(PxlGraphicMethodType.MOVE_TO, [x, y]);
        return super.moveTo(x, y);
    }

    lineTo(x: number, y: number): this {
        this._logDrawCall(PxlGraphicMethodType.LINE_TO, [x, y]);
        return super.lineTo(x, y);
    }

    stroke(style?: StrokeInput): this {
        this._logDrawCall(PxlGraphicMethodType.STROKE, [style]);
        return super.stroke(style);
    }

    fill(style?: FillInput): this {
        this._logDrawCall(PxlGraphicMethodType.FILL, [style]);
        return super.fill(style);
    }

    private _logDrawCall(method: PxlGraphicMethodType, params: any[]) {
        this._callLog.push({ method, params });
    }

    get callLog(): Array<PxlGraphicLogEntry> {
        return this._callLog;
    }
}