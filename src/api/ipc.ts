import { APIScope, InstanceAPI } from '.';

export class IPCAPI extends APIScope {

    constructor(iApi: InstanceAPI) {
        super(iApi);
    }

    destroy(): void {
        // do nothing
    }

    call(channel: string, ...data: any): void {
        if (this.ipcAPISupported()) {
            //@ts-ignore
            window.ipcAPI.call(channel, ...data)
        }
    }

    ipcAPISupported(): boolean {
        //@ts-ignore
        return !!window.ipcAPI;
    }
}