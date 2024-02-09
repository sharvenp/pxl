import { EventAPI, IPCAPI, CanvasAPI, Palette } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;
    readonly palette: Palette;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.canvas = new CanvasAPI(this);
        this.palette = new Palette(this);
    }
}