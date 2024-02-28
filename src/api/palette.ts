import { APIScope, InstanceAPI, Events } from '.';

export interface PaletteItem {
    color: string
}

export class PaletteAPI extends APIScope {

    private _palette: Array<PaletteItem>;
    private _selectedColor: PaletteItem | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._palette = [];

        this.initialize();
    }

    initialize(): void {
    }

    destroy(): void {
    }

    selectColor(color: PaletteItem): void {
        this._selectedColor = color;
    }

    addColor(color: PaletteItem): void {
        if (!this._palette.some(c => c.color === color.color)) {
            this._palette.push(color);
            this.$iApi.event.emit(Events.PALETTE_COLOR_ADD, color);
        }
    }

    removeColor(color: PaletteItem): void {
        this._palette = [...this._palette.filter(c => c.color !== color.color)]
        this.$iApi.event.emit(Events.PALETTE_COLOR_REMOVE, color);
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
