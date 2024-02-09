import { APIScope, InstanceAPI, Events } from '.';

export interface PaletteItem {
    color: string
}

export class Palette extends APIScope {

    private _palette: Array<PaletteItem>;
    private _selectedColor: PaletteItem | undefined;

    private _handlers: Array<string>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._handlers = [];

        this._palette = [
            {
                color: '#000000',
            },
            {
                color: '#FF0000',
            },
            {
                color: '#00FF00',
            },
            {
                color: '#0000FF',
            },
            {
                color: '#F000FF',
            },
            {
                color: '#00F0FF',
            },
            {
                color: '#A0F0FF',
            },
            {
                color: '#ABF0FF',
            },
        ];

        this.initialize();


    }

    initialize(): void {
        this._handlers.push(this.$iApi.event.on(Events.COLOR_SELECT, (color: PaletteItem) => {
            this._selectedColor = color;
        }));
    }

    destroy(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
    }

    get selectedColor(): PaletteItem | undefined {
        return this._selectedColor;
    }

    set palette(newPalette: Array<PaletteItem>)  {
        this._palette = newPalette;
    }

    get palette(): Array<PaletteItem> {
        return this._palette;
    }
}
