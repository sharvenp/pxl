import { InstanceAPI, APIScope } from '.';

export class SettingsAPI extends APIScope {

    private _mirrorX: boolean;
    private _mirrorY: boolean;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        // TODO: properly load from state
        this._mirrorX = false;
        this._mirrorY = false;

        this.initialize();
    }

    initialize(): void {

    }

    destroy(): void {

    }

    get mirrorX(): boolean {
        return this._mirrorX;
    }

    set mirrorX(val: boolean) {
        this._mirrorX = val;
    }

    get mirrorY(): boolean {
        return this._mirrorY;
    }

    set mirrorY(val: boolean) {
        this._mirrorY = val;
    }

}
