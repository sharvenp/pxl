import { EventAPI, IPCAPI, CanvasAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.canvas = new CanvasAPI(this);
    }
}