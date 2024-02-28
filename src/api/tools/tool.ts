import { PixelCoordinates, Events, APIScope } from "..";
import { InstanceAPI } from "../instance";

export enum Tools {
    PENCIL = "Pencil",
    ERASER = "Eraser"
}

export interface ToolProperty {
    // TODO: implement tool properties like brush width, and stuff
}

export abstract class Tool extends APIScope {

    private _toolType: Tools;

    constructor(iApi: InstanceAPI, toolType: Tools) {
        super(iApi);
        this._toolType = toolType;
    }

    protected notify(): void {
        this.$iApi.event.emit(Events.CANVAS_UPDATE);
    }

    abstract invoke(pixelCoords: PixelCoordinates): void;

    abstract getToolProperties(): Array<ToolProperty>;

    get toolType(): Tools {
        return this._toolType;
    }
}