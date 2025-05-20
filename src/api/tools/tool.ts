import { Graphics } from "pixi.js";
import { ToolProperty } from ".";
import { APIScope } from "..";
import { InstanceAPI } from "../instance";
import { Events, GridMouseEvent, ToolConfiguration, ToolType } from "../utils";

export abstract class Tool extends APIScope {

    private _toolType: ToolType;
    protected _drawGraphic: Graphics;
    protected _toolProperties: Array<ToolProperty>;
    protected _toolConfiguration: ToolConfiguration;

    protected _handlers: Array<string>;

    constructor(iApi: InstanceAPI, toolType: ToolType) {
        super(iApi);
        this._toolType = toolType;
        this._drawGraphic = new Graphics({ roundPixels: true });
        this._toolProperties = [];
        this._toolConfiguration = {
            showPreviewOnInvoke: false,
            invokeOnMove: false,
            trackPixels: true,
        };

        this._handlers = [];
    }

    init(): void {
        // will be implemented by tool
    }

    previewCursor(event: GridMouseEvent): void {
        // will be implemented by tool
    }

    newGraphic(): void {
        this._drawGraphic = new Graphics({ roundPixels: true });
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

    get drawGraphic(): Graphics {
        return this._drawGraphic;
    }

    protected loadToolState(): any {
        const toolState = this.$iApi.state.loadedState?.tools?.states.find((tool: any) => tool.tool === this._toolType)?.state;
        return toolState;
    }

    // invoke the tool's action (e.g. draw a pixel)
    abstract invokeAction(mouseEvent: GridMouseEvent, event: Events): void;

    // get state of tool
    abstract getToolState(): any;

}