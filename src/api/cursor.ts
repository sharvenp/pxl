import { Application, Container, Graphics } from 'pixi.js';
import { InstanceAPI, APIScope } from '.';
import { CURSOR_PREVIEW_COLOR } from './utils';

export class CursorAPI extends APIScope {

    private _pixi: Application;
    private _cursorLayer: Container;
    private _cursorGraphic: Graphics;

    constructor(iApi: InstanceAPI, pixi: Application) {
        super(iApi);

        this._pixi = pixi;

        this._cursorLayer = new Container({alpha: 0.25, eventMode: 'none'});
        this._cursorGraphic = new Graphics({roundPixels: true});

        this._cursorLayer.addChild(this._cursorGraphic);
        this._pixi.stage.addChild(this._cursorLayer);

        this.initialize();
    }

    initialize(): void {
        this.clearCursor();
    }

    destroy(): void {
        this._cursorGraphic.destroy();
        this._cursorLayer.destroy();
    }

    clearCursor(): void {
        this._cursorGraphic.clear();
    }

    get cursorGraphic(): Graphics {
        return this._cursorGraphic;
    }
}
