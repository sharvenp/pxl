import { InstanceAPI, APIScope } from '.';
import { MAX_HISTORY_SIZE } from './utils';

export class HistoryAPI extends APIScope {

    private _index: number;
    private readonly _history: Array<???>;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._index = 0;
        this._history = [];
    }

    push(): void {

        this._index++;

        // need to remove all entries after this index
        if (this._index < this._history.length - 1) {
            this._history.length = this._index + 1;
        }

        // TODO: push the canvas state
        // Parse the state into a compressed form
        // Push the compressed form into the history stack

        // drop last state
        if (this._history.length > MAX_HISTORY_SIZE) {
            this._history.shift();
        }
    }

    revert(): void {

        if (this._index === 0) {
            // nothing to revert
            return;
        }

        this._index--;

        // TODO: revert canvas state
        // Get the last state in compressed form
        // Parse and restore state (directly set the )

    }
}