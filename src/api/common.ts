
import type { InstanceAPI } from '.';

export class APIScope {
    readonly $iApi: InstanceAPI;

    constructor(iApi: InstanceAPI) {
        this.$iApi = iApi;
    }
}