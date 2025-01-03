import { ContainerChild } from 'pixi.js';
import { InstanceAPI, APIScope } from '.';
import { Events, MAX_HISTORY_SIZE } from './utils';

export class HistoryAPI extends APIScope {

    private readonly _historyStack: Array<ContainerChild>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._historyStack = [];
    }

    update(): void {

        // erase redo history since we've started drawing again
        if (this._historyStack.length > 0) {
            this._historyStack.forEach(c => c.destroy());
            this._historyStack.length = 0;
        }
    }

    undo(): void {
        let grid = this.$iApi.canvas.grid;
        if (grid) {

            const drawLayer = grid.drawLayer;

            if (drawLayer.children.length > 0) {
                const topMostGraphic = drawLayer.removeChildAt(drawLayer.children.length - 1);
                this._historyStack.push(topMostGraphic);

                this.$iApi.event.emit(Events.UNDO);
            }
        }
    }

    redo(): void {
        let grid = this.$iApi.canvas.grid;
        if (grid && this._historyStack.length > 0) {

            const drawLayer = grid.drawLayer;
            const child = this._historyStack.pop()!;

            drawLayer.addChild(child);

            this.$iApi.event.emit(Events.REDO);
        }
    }
}