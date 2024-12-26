import { EventAPI, IPCAPI, CanvasAPI, PaletteAPI, ToolAPI, CursorAPI, SettingsAPI, KeyBindAPI, HistoryAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;
    readonly palette: PaletteAPI;
    readonly tool: ToolAPI;
    readonly keybind: KeyBindAPI;
    readonly history: HistoryAPI;
    readonly settings: SettingsAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.palette = new PaletteAPI(this);
        this.canvas = new CanvasAPI(this);
        this.tool = new ToolAPI(this);
        this.keybind = new KeyBindAPI(this);
        this.history = new HistoryAPI(this);
        this.settings = new SettingsAPI(this);
    }
}