export class IPCAPI {

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