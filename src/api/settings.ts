import { InstanceAPI, APIScope } from '.';
import { UITheme } from './utils';

export class SettingsAPI extends APIScope {

    private _theme: UITheme;

    constructor(iApi: InstanceAPI) {
        super(iApi);

        if (this.$iApi.state.loadedState?.preferences) {
            this._theme = this.$iApi.state.loadedState.preferences.theme;
        } else {
            this._theme = UITheme.LIGHT;
        }
    }

    destroy(): void {
    }

    get theme(): UITheme {
        return this._theme;
    }
}
