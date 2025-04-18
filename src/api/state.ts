import { APIScope, CanvasAPI, InstanceAPI, PaletteAPI, SettingsAPI, ToolAPI } from '.';
import { PxlGraphic, ToolType } from './utils';

export class StateAPI extends APIScope {

    constructor(iApi: InstanceAPI) {
        super(iApi);
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
                state: tool.toolState()
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
        const canvasState = {
            settings: {
                width: canvasApi.width,
                height: canvasApi.height,
                "mirror-x": canvasApi.mirrorX,
                "mirror-y": canvasApi.mirrorY
            },
            layers: {
                "selected-layer": canvasApi.grid?.activeIndex ?? 0,
                states: canvasApi.grid?.drawLayers.map(layer => ({
                    label: layer.label,
                    visible: layer.visible,
                    alpha: layer.alpha,
                    data: layer.children.map(graphic => graphic as PxlGraphic).map(pxlGraphic => ({
                        blendMode: pxlGraphic.blendMode,
                        alpha: pxlGraphic.alpha,
                        drawLog: pxlGraphic.drawLog
                    }))
                }))
            }
        };

        return canvasState;
    }

    // TODO
    /**
     * Consume the state config and apply it to the current instance.
    **/

}