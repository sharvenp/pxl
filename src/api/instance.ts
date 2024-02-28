import { EventAPI, IPCAPI, CanvasAPI, PaletteAPI, ToolAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;
    readonly palette: PaletteAPI;
    readonly tool: ToolAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.canvas = new CanvasAPI(this);
        this.palette = new PaletteAPI(this);
        this.tool = new ToolAPI(this);
    }
}