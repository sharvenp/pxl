import { InstanceAPI, IPCAPI } from ".";
import { encode, decode } from 'cbor2';

export class OrchestratorAPI {

    readonly iApi: InstanceAPI;
    readonly ipc: IPCAPI;

    private _container: HTMLElement | undefined;

    constructor(iApi: InstanceAPI) {
        this.iApi = iApi;
        this.ipc = new IPCAPI();
    }

    saveProject(): void {
        const state = this.iApi.state.getState();
        if (state) {
            const uint8Array = new Uint8Array(encode(state));

            const blob = new Blob([uint8Array], { type: 'application/cbor' });

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.pxl'; // Set the desired file name
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    loadProject(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pxl';

        input.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                const configState = decode(new Uint8Array(arrayBuffer));

                // destroy api
                this.destroyInstance();

                // create new api
                this.newInstance(configState);
            }
        });

        // trigger dialog and remove it
        input.click();
        input.remove();
    }

    newInstance(config: any): void {

        if (this.iApi.initalized) {
            throw new Error('OrchestratorAPI: Instance needs to be destroyed first');
        }

        if (!this._container) {
            throw new Error('OrchestratorAPI: Container not set');
        }

        this.iApi.new(this._container, config);
    }

    destroyInstance(): void {
        if (this.iApi.initalized) {
            this.iApi.destroy();
        }
    }

    set container(container: HTMLElement) {
        if (this._container) {
            throw new Error('OrchestratorAPI: Container already set, cannot set again.');
        }
        this._container = container;
    }
}