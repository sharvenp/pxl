import { InstanceAPI, APIScope } from '.';
import { MAX_HISTORY_SIZE } from './utils';

export class HistoryAPI extends APIScope {

    private readonly _undoStack: Array<Uint8ClampedArray>;
    private readonly _redoStack: Array<Uint8ClampedArray>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._undoStack = [];
        this._redoStack = [];
    }

    push(): void {

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            // TODO: compress this to save space?
            // Push the state
            let state = new Uint8ClampedArray(grid.data.byteLength);
            state.set(grid.data);
            this._undoStack.push(state);

            if (this._redoStack.length > 0) {
                // if there's anything in the redo stack, clear it
                this._redoStack.length = 0;
            }

            // drop last state
            if (this._undoStack.length > MAX_HISTORY_SIZE) {
                this._undoStack.shift();
            }
        }
    }

    undo(): void {

        if (this._undoStack.length === 1) {
            // nothing to undo
            return;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            // get the state
            let state = this._undoStack.pop()!;
            this._redoStack.push(state);

            grid.loadData(this._undoStack[this._undoStack.length - 1]);
        }
    }

    redo(): void {

        if (this._redoStack.length === 0) {
            // nothing to redo
            return;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            // get the state
            let state = this._redoStack.pop()!;
            this._undoStack.push(state);
            grid.loadData(state);
        }
    }
}