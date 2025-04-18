import { Graphics, FillInput, StrokeInput } from 'pixi.js';
import { PxlGraphicLogEntry, PxlGraphicMethodType } from './utils';

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

    private _logDrawCall(method: string, params: any[]) {
        this._callLog.push({ method, params });
    }

    get callLog(): Array<PxlGraphicLogEntry> {
        return this._callLog;
    }
}