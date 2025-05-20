import { AlphaFilter, Filter } from 'pixi.js';
import { APIScope, CanvasAPI, InstanceAPI, PaletteAPI, SettingsAPI, ToolAPI } from '.';
import { LayerFilterType, ToolType } from './utils';

export class StateAPI extends APIScope {

    private _loadedState: any | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._loadedState = undefined;
    }

    destroy(): void {
        this._loadedState = undefined;
    }

    /**
     * Process the current state of the application and return it as a JSON object.
    **/

    getState(): any {
        return {
            version: __APP_VERSION__,
            preferences: this._processSettings(this.$iApi.settings),
            tools: this._processTools(this.$iApi.tool),
            palette: this._processPalette(this.$iApi.palette),
            canvas: this._processCanvas(this.$iApi.canvas)
        };
    }

    get loadedState(): any {
        if (this._loadedState === undefined) {
            this._loadedState = this.getState();
        }

        return this._loadedState;
    }

    private _processSettings(settingsApi: SettingsAPI): any {
        const settingsState = {
            theme: settingsApi.theme,
        }

        return settingsState;
    }

    private _processTools(toolApi: ToolAPI): any {
        const tools = toolApi.tools;

        const toolState = {
            selectedTool: toolApi.selectedTool.toolType ?? ToolType.PENCIL,
            states: tools.map(tool =>
            ({
                tool: tool.toolType,
                state: tool.getToolState()
            })),
        };

        return toolState;
    }

    private _processPalette(paletteApi: PaletteAPI): any {

        const paletteState = {
            selectedColor:
            {
                colorHex: paletteApi.selectedColor?.colorHex ?? "#000000ff",
                colorRGBA: paletteApi.selectedColor?.colorRGBA ?? { r: 0, g: 0, b: 0, a: 255 }
            },
            colors: paletteApi.palette.map((color) => {
                return {
                    colorHex: color.colorHex,
                    colorRGBA: {
                        r: color.colorRGBA.r,
                        g: color.colorRGBA.g,
                        b: color.colorRGBA.b,
                        a: color.colorRGBA.a
                    }
                };
            })
        };

        return paletteState;
    }

    private _processCanvas(canvasApi: CanvasAPI): any {

        // helper to map filters to a serializable format
        const _processFilters = (filter: Filter | Array<Filter>) => {
            if (filter instanceof Filter) {
                return _processFilters([filter]);
            }
            else {
                return filter.map((filter: Filter) => {
                    switch (filter.constructor) {
                        case AlphaFilter:
                            return { type: LayerFilterType.ALPHA, alpha: (filter as AlphaFilter).alpha };
                        default:
                            return undefined;
                    }
                }).filter((f: any) => f !== undefined);
            }
        };

        const canvasState = {
            settings: {
                width: canvasApi.width,
                height: canvasApi.height,
                mirrorX: canvasApi.mirrorX,
                mirrorY: canvasApi.mirrorY
            },
            layers: {
                selectedLayer: canvasApi.grid?.activeIndex ?? 0,
                states: canvasApi.grid?.drawLayers.map((layer, i) => ({
                    label: layer.label,
                    visible: layer.visible,
                    alpha: layer.alpha,
                    blendMode: layer.blendMode,
                    filters: _processFilters(layer.filters),
                    data: canvasApi.grid?.extractPixels(i)
                }))
            }
        };

        return canvasState;
    }

    /**
     * Consume the state config and apply it to the current instance.
    **/

    set loadedState(state: any) {
        this._loadedState = state;
    }
}