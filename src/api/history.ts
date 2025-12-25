import { ContainerChild } from 'pixi.js';
import { InstanceAPI, APIScope } from '.';
import { Events, MAX_HISTORY_SIZE, PxlSpecialGraphicType } from './utils';

export class HistoryAPI extends APIScope {

    // Store the frame and layer the graphic was on
    private readonly _historyStack: Record<string, Record<string, Array<ContainerChild>>>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._historyStack = {};
    }

    destroy(): void {
        const { frameId, layerId } = this._getCurrentGridState();
        this._clearHistory(frameId, layerId);
    }

    update(): void {

        const { frameId, layerId } = this._getCurrentGridState();

        // erase redo history since we've started drawing again
        if (this._historyStack[frameId] && this._historyStack[frameId][layerId]) {
            this._clearHistory(frameId, layerId);
        }
    }

    undo(): void {

        const { frameId, layerId } = this._getCurrentGridState();

        if (this._historyStack[frameId] && this._historyStack[frameId][layerId] && this._historyStack[frameId][layerId].length === MAX_HISTORY_SIZE) {
            return;
        }

        const grid = this.$iApi.canvas.grid;
        if (grid && !grid.empty) {
            let topMostGraphic = grid.peek();

            // if the top most graphic is a special graphic, don't undo it
            if (topMostGraphic.label === PxlSpecialGraphicType.FROM_LOAD_STATE || topMostGraphic.label === PxlSpecialGraphicType.FROM_CLONE) {
                return;
            }

            const { frameId, layerId } = this._getCurrentGridState();

            topMostGraphic = grid.pop();

            if (!this._historyStack[frameId]) {
                this._historyStack[frameId] = {};
            }

            if (!this._historyStack[frameId][layerId]) {
                this._historyStack[frameId][layerId] = [];
            }

            this._historyStack[frameId][layerId].push(topMostGraphic);

            grid.render();
            this.$iApi.event.emit(Events.UNDO);
        }
    }

    redo(): void {
        const grid = this.$iApi.canvas.grid;
        const { frameId, layerId } = this._getCurrentGridState();
        if (grid && this._historyStack[frameId][layerId].length > 0) {

            const { frameId, layerId } = this._getCurrentGridState();

            const child = this._historyStack[frameId][layerId].pop()!;

            grid.draw(child);
            grid.render();

            this.$iApi.event.emit(Events.REDO);
        }
    }

    private _clearHistory(frameId: string, layerId: string): void {
        this._historyStack[frameId][layerId].forEach(c => c.destroy());
        this._historyStack[frameId][layerId].length = 0;
    }

    private _getCurrentGridState(): { frameId: string; layerId: string } {
        const frame = this.$iApi.canvas.grid.activeFrame.label;
        const layer = this.$iApi.canvas.grid.activeLayer.label;
        return { frameId: frame, layerId: layer };
    }

    get canUndo(): boolean {
        const grid = this.$iApi.canvas.grid;
        if (!grid || grid.empty) {
            return false;
        }

        return grid.peek().label !== PxlSpecialGraphicType.FROM_LOAD_STATE && grid.peek().label !== PxlSpecialGraphicType.FROM_CLONE;
    }

    get canRedo(): boolean {
        const { frameId, layerId } = this._getCurrentGridState();
        return this._historyStack[frameId][layerId].length > 0;
    }
}