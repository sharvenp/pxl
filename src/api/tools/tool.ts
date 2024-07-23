import { ToolProperty } from ".";
import { APIScope, GridMouseEvent, Events } from "..";
import { InstanceAPI } from "../instance";

export enum ToolType {
    PENCIL = "Pencil",
    ERASER = "Eraser",
    PICKER = "Picker",
    FILL = "Fill",
    RECTANGLE = "Rectangle",
    ELLIPSE = "Ellipse",
    LINE = "Line",
    SHADE = "Shade"
}

export abstract class Tool extends APIScope {

    private _toolType: ToolType;
    protected _toolProperties: Array<ToolProperty>;
    protected _showPreviewOnInvoke: boolean;
    protected _invokeOnMove: boolean;

    constructor(iApi: InstanceAPI, toolType: ToolType) {
        super(iApi);
        this._toolType = toolType;
        this._toolProperties = [];
        this._showPreviewOnInvoke = false;
        this._invokeOnMove = false;
    }

    get showPreviewOnInvoke(): boolean {
        return this._showPreviewOnInvoke;
    }

    get invokeOnMove(): boolean {
        return this._invokeOnMove;
    }

    get toolProperties(): Array<ToolProperty> {
        return this._toolProperties;
    }

    get toolType(): ToolType {
        return this._toolType;
    }

    // invoke the tool's action (e.g. draw a pixel)
    abstract invokeAction(mouseEvent: GridMouseEvent, event: Events): void;

    // render the cursor preview of the tool
    abstract previewCursor(event: GridMouseEvent): void;
}