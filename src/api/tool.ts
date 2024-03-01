import { APIScope, Events, InstanceAPI, PixelCoordinates } from ".";
import { Eraser, Pencil, Tool, ToolType } from "./tools";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;
    private readonly _tools: Record<string, Tool> = {};

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.initialize();
    }

    initialize(): void {

        this._tools[ToolType.PENCIL] = new Pencil(this.$iApi)
        this._tools[ToolType.ERASER] = new Eraser(this.$iApi)

        // default to pencil
        // TODO: load correct tool from save state
        this.selectTool(ToolType.PENCIL);
    }

    destroy(): void {
    }

    invoke(pixelCoords: PixelCoordinates): void {
        if (this._selectedTool) {
            this._selectedTool.invoke(pixelCoords);
        }
    }

    selectTool(tool: ToolType): void {
        this._selectedTool = this._tools[tool];
        this.$iApi.event.emit(Events.TOOL_SELECT, tool);
    }

    get selectedTool(): Tool | undefined {
        return this._selectedTool;
    }
}