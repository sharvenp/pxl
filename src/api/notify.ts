import { APIScope, InstanceAPI } from ".";
import { Events, NotificationConfiguration } from "./utils";

export class NotifyAPI extends APIScope {

    constructor(iApi: InstanceAPI) {
        super(iApi);
    }

    notify(notification: NotificationConfiguration): void {
        this.$iApi.event.emit(Events.NOTIFY_SHOW, notification);
    }

    destroy(): void {
    }
}