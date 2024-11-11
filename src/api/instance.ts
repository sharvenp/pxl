import { EventAPI, IPCAPI, CanvasAPI, PaletteAPI, ToolAPI, CursorAPI, SettingsAPI, KeyBindAPI, HistoryAPI } from '.';

export class InstanceAPI {

    readonly ipc: IPCAPI;
    readonly event: EventAPI;
    readonly canvas: CanvasAPI;
    readonly cursor: CursorAPI;
    readonly palette: PaletteAPI;
    readonly tool: ToolAPI;
    readonly settings: SettingsAPI;
    readonly keybind: KeyBindAPI;
    readonly history: HistoryAPI;

    constructor() {
        this.event = new EventAPI(this);
        this.ipc = new IPCAPI(this);
        this.tool = new ToolAPI(this);
        this.palette = new PaletteAPI(this);
        this.canvas = new CanvasAPI(this);
        this.cursor = new CursorAPI(this);
        this.keybind = new KeyBindAPI(this);
        this.history = new HistoryAPI(this);
        this.settings = new SettingsAPI(this);
    }
}