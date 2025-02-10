import { Graphics } from "pixi.js";
import { ToolProperty } from ".";
import { APIScope } from "..";
import { InstanceAPI } from "../instance";
import { Events, GridMouseEvent, ToolType } from "../utils";

export abstract class Tool extends APIScope {

    private _toolType: ToolType;
    protected _drawGraphic: Graphics;
    protected _toolProperties: Array<ToolProperty>;
    protected _showPreviewOnInvoke: boolean;
    protected _invokeOnMove: boolean;
    protected _trackPixels: boolean;
    protected _canMirror: boolean;

    protected _handlers: Array<string>;

    constructor(iApi: InstanceAPI, toolType: ToolType) {
        super(iApi);
        this._toolType = toolType;
        this._drawGraphic = new Graphics({ roundPixels: true });
        this._toolProperties = [];
        this._showPreviewOnInvoke = false;
        this._invokeOnMove = false;
        this._trackPixels = true;
        this._canMirror = true;

        this._handlers = [];
    }

    get showPreviewOnInvoke(): boolean {
        return this._showPreviewOnInvoke;
    }

    get invokeOnMove(): boolean {
        return this._invokeOnMove;
    }

    get trackPixels(): boolean {
        return this._trackPixels;
    }

    get canMirror(): boolean {
        return this._canMirror;
    }

    get toolProperties(): Array<ToolProperty> {
        return this._toolProperties;
    }

    get toolType(): ToolType {
        return this._toolType;
    }

    initialize(): void {
        // will be implemented by tool
    }

    dispose(): void {
        // will be implemented by tool
    }

    previewCursor(event: GridMouseEvent): void {
        // will be implemented by tool
    }

    newGraphic(): void {
        this._drawGraphic = new Graphics({ roundPixels: true });
    }

    // invoke the tool's action (e.g. draw a pixel)
    abstract invokeAction(mouseEvent: GridMouseEvent, event: Events): void;
}