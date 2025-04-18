import { ToolProperty } from ".";
import { APIScope, PxlGraphic } from "..";
import { InstanceAPI } from "../instance";
import { Events, GridMouseEvent, ToolConfiguration, ToolType } from "../utils";

export abstract class Tool extends APIScope {

    private _toolType: ToolType;
    protected _drawGraphic: PxlGraphic;
    protected _toolProperties: Array<ToolProperty>;
    protected _toolConfiguration: ToolConfiguration;

    protected _handlers: Array<string>;

    constructor(iApi: InstanceAPI, toolType: ToolType) {
        super(iApi);
        this._toolType = toolType;
        this._drawGraphic = new PxlGraphic({ roundPixels: true });
        this._toolProperties = [];
        this._toolConfiguration = {
            showPreviewOnInvoke: false,
            invokeOnMove: false,
            trackPixels: true,
        };

        this._handlers = [];
    }

    get toolConfiguration(): ToolConfiguration {
        return this._toolConfiguration;
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
        this._drawGraphic = new PxlGraphic({ roundPixels: true });
    }

    // invoke the tool's action (e.g. draw a pixel)
    abstract invokeAction(mouseEvent: GridMouseEvent, event: Events): void;
}