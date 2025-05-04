
import type { InstanceAPI } from '.';

export abstract class APIScope {
    readonly $iApi: InstanceAPI;

    constructor(iApi: InstanceAPI) {
        this.$iApi = iApi;
    }

    abstract destroy(): void;
}