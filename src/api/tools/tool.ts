import { GridAPI, PixelCoordinates } from "../grid";
import { InstanceAPI } from "../instance";

export enum Tools {
    PENCIL = "Pencil",
    ERASER = "Eraser"
}

export interface ToolProperty {
    // TODO: implement tool properties like brush width, and stuff
}

export abstract class Tool {

    protected _grid: GridAPI;

    constructor(grid: GridAPI) {
        this._grid = grid;
    }

    protected get $iApi(): InstanceAPI {
        return this._grid.$iApi;
    }

    abstract invoke(pixelCoords: PixelCoordinates): void;

    abstract getToolProperties(): Array<ToolProperty>;
}