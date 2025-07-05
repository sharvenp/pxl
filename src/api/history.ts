import { ContainerChild } from 'pixi.js';
import { InstanceAPI, APIScope } from '.';
import { Events, MAX_HISTORY_SIZE, PxlSpecialGraphicType } from './utils';

export class HistoryAPI extends APIScope {

    private readonly _historyStack: Array<ContainerChild>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._historyStack = [];
    }

    destroy(): void {
        this._clearHistory();
    }

    update(): void {

        // erase redo history since we've started drawing again
        if (this._historyStack.length > 0) {
            this._clearHistory();
        }
    }

    undo(): void {

        if (this._historyStack.length === MAX_HISTORY_SIZE) {
            return;
        }

        const grid = this.$iApi.canvas.grid;
        if (grid && !grid.empty) {
            let topMostGraphic = grid.peek();

            // if the top most graphic is a special graphic, don't undo it
            if (topMostGraphic.label === PxlSpecialGraphicType.FROM_LOAD_STATE) {
                return;
            }

            topMostGraphic = grid.pop();
            this._historyStack.push(topMostGraphic);

            grid.render();
            this.$iApi.event.emit(Events.UNDO);
        }
    }

    redo(): void {
        const grid = this.$iApi.canvas.grid;
        if (grid && this._historyStack.length > 0) {

            const child = this._historyStack.pop()!;

            grid.draw(child);
            grid.render();

            this.$iApi.event.emit(Events.REDO);
        }
    }

    private _clearHistory(): void {
        this._historyStack.forEach(c => c.destroy());
        this._historyStack.length = 0;
    }

    get canUndo(): boolean {
        const grid = this.$iApi.canvas.grid;
        if (grid && !grid.empty) {
            const topMostGraphic = grid.peek();

            // if the top most graphic is a special graphic, don't undo it
            if (topMostGraphic.label === PxlSpecialGraphicType.FROM_LOAD_STATE) {
                return false;
            }

            return true;
        }

        return false;
    }

    get canRedo(): boolean {
        return this._historyStack.length > 0;
    }
}