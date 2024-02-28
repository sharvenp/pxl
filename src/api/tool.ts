import { APIScope, Events, InstanceAPI, PixelCoordinates } from ".";
import { Eraser, Pencil, Tool, Tools } from "./tools";

export class ToolAPI extends APIScope {

    private _selectedTool: Tool | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.initialize();
    }

    initialize(): void {
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

    get tool(): Tool {
        return this.tool;
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