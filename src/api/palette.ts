import { APIScope, InstanceAPI, Events, PaletteItem } from '.';

export class PaletteAPI extends APIScope {

    private _palette: Array<PaletteItem>;
    private _selectedColor: PaletteItem;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        // TODO: load correct palette from save state
        let startingColor = {
            colorHex: '#000000ff',
            colorRGBA: { r: 0, g: 0, b: 0, a: 255},
        }
        this._palette = [
            startingColor
        ];

        // for debugging
        // for (let x = 0; x < 80; x++) {
        //     let rcolor = Utils.getRandomColor();
        //     this._palette.push({
        //         colorHex: rcolor,
        //         colorRGBA: Utils.hexToRGBA(rcolor)
        //     })
        // }

        this._selectedColor = startingColor;

        this.initialize();
    }

    initialize(): void {
    }

    destroy(): void {
    }

    selectColor(color: PaletteItem): void {
        this._selectedColor = color;
        this.$iApi.event.emit(Events.PALETTE_COLOR_SELECT, color);
    }

    addColor(color: PaletteItem): void {
        if (!this._palette.some(c => c.colorHex === color.colorHex)) {
            this._palette.push(color);
            this.$iApi.event.emit(Events.PALETTE_COLOR_ADD, color);
        }
    }

    removeColor(color: PaletteItem): void {
        this._palette = [...this._palette.filter(c => c.colorHex !== color.colorHex)]
        this.$iApi.event.emit(Events.PALETTE_COLOR_REMOVE, color);
    }

    set palette(newPalette: Array<PaletteItem>)  {
        this._palette = newPalette;
    }

    get palette(): Array<PaletteItem> {
        return this._palette;
    }

    get selectedColor(): PaletteItem {
        return this._selectedColor;
    }
}
