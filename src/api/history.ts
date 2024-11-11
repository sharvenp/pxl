import { InstanceAPI, APIScope } from '.';
import { MAX_HISTORY_SIZE } from './utils';

export class HistoryAPI extends APIScope {

    private _index: number;
    private readonly _history: Array<Uint8ClampedArray>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._index = 0;
        this._history = [];
    }

    push(): void {

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            this._index++;

            // need to remove all entries after this index
            if (this._index < this._history.length - 1) {
                this._history.length = this._index + 1;
            }

            // TODO: compress this to save space?
            // Push the state
            let state = new Uint8ClampedArray(grid.data.byteLength);
            state.set(grid.data);
            this._history.push(state);

            // drop last state
            if (this._history.length > MAX_HISTORY_SIZE) {
                this._history.shift();
            }
        }

        console.log(this._history)
    }

    undo(): void {

        if (this._index === 0) {
            // nothing to undo
            return;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            this._index--;

            // get the state
            let state = this._history[this._index];
            grid.loadData(state);
        }
    }

    redo(): void {

        if (this._index === this._history.length - 1) {
            // nothing to redo
            return;
        }

        let grid = this.$iApi.canvas.grid;
        if (grid) {

            this._index++;

            // get the state
            let state = this._history[this._index];
            grid.loadData(state);
        }
    }
}