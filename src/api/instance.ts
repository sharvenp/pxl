import { EventAPI, CanvasAPI, PaletteAPI, ToolAPI, SettingsAPI, KeyBindAPI, HistoryAPI, StateAPI } from '.';
import { Application } from 'pixi.js';
import { Events } from './utils';

export class InstanceAPI {

    event!: EventAPI;
    canvas!: CanvasAPI;
    palette!: PaletteAPI;
    tool!: ToolAPI;
    keybind!: KeyBindAPI;
    history!: HistoryAPI;
    settings!: SettingsAPI;
    state!: StateAPI;

    initalized: boolean;

    constructor() {
        this.initalized = false;
        this.event = new EventAPI(this);
    }

    new(container: HTMLElement, config: any): void {

        if (this.initalized) {
            throw new Error('InstanceAPI: Already initialized');
        }

        // create pixi app
        const pixi = new Application();


        pixi.init({
            width: config.canvas.settings.width,
            height: config.canvas.settings.height,
            backgroundAlpha: 0,
            eventMode: 'static',
            autoDensity: true
        }).then(() => {
            container.appendChild(pixi.canvas);

            this.state = new StateAPI(this);
            this.state.loadedState = config;

            this.palette = new PaletteAPI(this);

            this.canvas = new CanvasAPI(this, pixi);

            this.tool = new ToolAPI(this);
            this.keybind = new KeyBindAPI(this);
            this.history = new HistoryAPI(this);
            this.settings = new SettingsAPI(this);

            this.initalized = true;
            this.event.emit(Events.APP_INITIALIZED);
        });
    }

    destroy(): void {
        if (!this.initalized) {
            throw new Error('InstanceAPI: Cannot destroy, not initialized.');
        }

        this.event.destroy();
        this.palette.destroy();
        this.tool.destroy();
        this.keybind.destroy();
        this.history.destroy();
        this.settings.destroy();
        this.state.destroy();
        this.canvas.destroy();

        this.initalized = false;
        this.event.emit(Events.APP_DESTROYED);
    }
}