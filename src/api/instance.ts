import { EventAPI, IPCAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
    }
}