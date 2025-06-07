import { InstanceAPI } from "./instance";

export class OrchestratorAPI {

    readonly $iApi: InstanceAPI;
    private _container: HTMLElement | undefined;

    constructor(iApi: InstanceAPI) {
        this.$iApi = iApi;
    }

    newInstance(config: any): Promise<void> {
        if (!this._container) {
            console.warn('OrchestratorAPI: Container not set, cannot create new instance.');
            return Promise.reject(new Error('OrchestratorAPI: Container not set'));
        }

        return this.$iApi.new(this._container, config);
    }

    destroyInstance(): void {
        this.$iApi.destroy();
    }

    set container(container: HTMLElement) {
        if (this._container) {
            console.warn('OrchestratorAPI: Container already set, cannot set again.');
            return;
        }
        this._container = container;
    }
}