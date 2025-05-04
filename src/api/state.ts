import { AlphaFilter, Filter } from 'pixi.js';
import { APIScope, CanvasAPI, InstanceAPI, PaletteAPI, SettingsAPI, ToolAPI } from '.';
import { ToolType } from './utils';

export class StateAPI extends APIScope {

    private currentState: any | undefined;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this.currentState = undefined;
    }

    destroy(): void {
        this.currentState = undefined;
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

    getCurrentState(): any {
        if (this.currentState === undefined) {
            this.currentState = this.getState();
        }

        return this.currentState;
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
            "selected-tool": toolApi.selectedTool?.toolType ?? ToolType.PENCIL,
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
            "selected-color": paletteApi.selectedColor?.colorHex ?? "#000000ff",
            colors: paletteApi.palette.map(c => c.colorHex)
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
                            return { type: "alpha", alpha: (filter as AlphaFilter).alpha };
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
                "mirror-x": canvasApi.mirrorX,
                "mirror-y": canvasApi.mirrorY
            },
            layers: {
                "selected-layer": canvasApi.grid?.activeIndex ?? 0,
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

    setState(state: any): void {
        this.currentState = state;
    }
}