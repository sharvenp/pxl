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

        this._palette = [];

        this.initialize();
    }

    initialize(): void {
        this._handlers.push(this.$iApi.event.on(Events.PALETTE_COLOR_SELECT, (color: PaletteItem) => {
            this._selectedColor = color;
        }));

        this._handlers.push(this.$iApi.event.on(Events.PALETTE_COLOR_ADD, (color: PaletteItem) => {
            this.addColor(color);
        }));
    }

    destroy(): void {
        this._handlers.forEach(h => this.$iApi.event.off(h));
    }

    addColor(color: PaletteItem) {
        if (!this._palette.some(c => c.color === color.color)) {
            this._palette.push(color);
        }
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
