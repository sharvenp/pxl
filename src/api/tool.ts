import { APIScope, Events, InstanceAPI, PixelCoordinates } from ".";
import { Eraser, Pencil, Tool, Tools } from "./tools";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.initialize();
    }

    initialize(): void {
        // TODO: load correct tool from save state
        // default to pencil
        this.createAndSelectTool(Tools.PENCIL);
    }

    destroy(): void {
    }

    invoke(pixelCoords: PixelCoordinates): void {
        if (this._selectedTool) {
            this._selectedTool.invoke(pixelCoords);
        }
    }

    createAndSelectTool(tool: Tools): void {
        this.selectTool(this.createTool(tool));
    }

    selectTool(tool: Tool): void {
        this._selectedTool = tool;
        this.$iApi.event.emit(Events.TOOL_SELECT, tool.toolType);
    }

    get selectedTool(): Tool | undefined {
        return this._selectedTool;
    }

    createTool(tool: Tools): Tool {
        switch (tool)
        {
            case Tools.PENCIL:
                return new Pencil(this.$iApi)
            case Tools.ERASER:
                return new Eraser(this.$iApi)
            default:
                throw new Error(`Unexpected tool: ${tool}`);
        }
    }
}