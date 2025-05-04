import { InstanceAPI, APIScope } from '.';
import { UITheme } from './utils';

export class SettingsAPI extends APIScope {

    private _theme: UITheme;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        this._theme = UITheme.LIGHT; // TODO: load from settings
    }

    destroy(): void {
    }

    get theme(): UITheme {
        return this._theme;
    }
}
