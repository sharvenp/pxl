import { APIScope, InstanceAPI } from ".";
import { Events } from "./utils";

export class NotifyAPI extends APIScope {

    constructor(iApi: InstanceAPI) {
        super(iApi);
    }

    notify(message: string, type: "info" | "success" | "error" | "warning" = "info"): void {
        this.$iApi.event.emit(Events.NOTIFY_SHOW, { message, type });
    }

    destroy(): void {
    }
}