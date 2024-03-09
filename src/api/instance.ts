import { EventAPI, IPCAPI, CanvasAPI, PaletteAPI, ToolAPI, CursorAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;
    readonly cursor: CursorAPI;
    readonly palette: PaletteAPI;
    readonly tool: ToolAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.canvas = new CanvasAPI(this);
        this.palette = new PaletteAPI(this);
        this.tool = new ToolAPI(this);
        this.cursor = new CursorAPI(this);
    }
}