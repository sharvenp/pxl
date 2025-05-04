import { APIScope, InstanceAPI } from '.';
import { Events, PaletteItem } from './utils';

export class PaletteAPI extends APIScope {

    private _palette: Array<PaletteItem>;
    private _selectedColor: PaletteItem;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        if (this.$iApi.state.loadedState?.palette) {
            // load from state
            this._palette = this.$iApi.state.loadedState.palette.colors.map((color: PaletteItem) => {
                return {
                    colorHex: color.colorHex,
                    colorRGBA: color.colorRGBA,
                };
            });
            this._selectedColor = this.$iApi.state.loadedState.palette.selectedColor;
        } else {
            // default palette to black
            this._selectedColor = {
                colorHex: '#000000ff',
                colorRGBA: { r: 0, g: 0, b: 0, a: 255 },
            }
            this._palette = [
                this._selectedColor
            ];
        }
    }

    destroy(): void {
        this._palette.length = 0;
    }

    selectColor(color: PaletteItem): void {
        this._selectedColor = color;
        this.$iApi.event.emit(Events.PALETTE_COLOR_SELECT, color);
    }

    addColor(color: PaletteItem): void {
        if (!this._palette.some(c => c.colorHex === color.colorHex)) {
            this._palette.unshift(color);
            this.$iApi.event.emit(Events.PALETTE_COLOR_ADD, color);
        }
    }

    removeColor(color: PaletteItem): void {
        this._palette = [...this._palette.filter(c => c.colorHex !== color.colorHex)]
        this.$iApi.event.emit(Events.PALETTE_COLOR_REMOVE, color);
    }

    set palette(newPalette: Array<PaletteItem>) {
        this._palette = newPalette;
    }

    get palette(): Array<PaletteItem> {
        return this._palette;
    }

    get selectedColor(): PaletteItem {
        return this._selectedColor;
    }
}
