import { ToolProperty } from ".";
import { PixelCoordinates, Events, APIScope } from "..";
import { InstanceAPI } from "../instance";

export enum ToolType {
    PENCIL = "Pencil",
    ERASER = "Eraser"
}

export abstract class Tool extends APIScope {

    private _toolType: ToolType;
    protected _toolProperties: Array<ToolProperty>;

    constructor(iApi: InstanceAPI, toolType: ToolType) {
        super(iApi);
        this._toolType = toolType;
        this._toolProperties = [];
    }

    protected notify(): void {
        this.$iApi.event.emit(Events.CANVAS_UPDATE);
    }

    get toolProperties(): Array<ToolProperty> {
        return this._toolProperties;
    }

    get toolType(): ToolType {
        return this._toolType;
    }

    // invoke the tool's action (e.g. draw a pixel)
    abstract invokeAction(pixelCoords: PixelCoordinates): void;

    // render the cursor preview of the tool
    abstract previewCursor(pixelCoords: PixelCoordinates): void;
}