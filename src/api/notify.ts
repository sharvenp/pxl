import { APIScope, InstanceAPI } from ".";
import { Events, NotificationConfiguration } from "./utils";

const version = __APP_VERSION__;

export class NotifyAPI extends APIScope {

    constructor(iApi: InstanceAPI) {
        super(iApi);
    }

    notify(notification: NotificationConfiguration): void {
        this.$iApi.event.emit(Events.NOTIFY_SHOW, notification);
    }

    destroy(): void {
    }

    static showNewProjectPrompt(iApi: InstanceAPI): void {
        if (iApi.$oApi) {
            iApi.notify.notify({
                title: "Create new project",
                message: "Are you sure you want to create a new project?",
                options: [
                    {
                        label: "Create",
                        callback: () => {
                            iApi.$oApi?.destroyInstance();
                        }
                    }
                ],
                showCancel: true
            });
        }
    }

    static showOpenProjectPrompt(iApi: InstanceAPI): void {
        if (iApi.$oApi) {
            iApi.notify.notify({
                title: "Open project",
                message: "Are you sure you want to open a project?",
                options: [
                    {
                        label: "Open",
                        callback: () => {
                            iApi.$oApi?.loadProject();
                        }
                    }
                ],
                showCancel: true
            });
        }
    }

    static showAboutPrompt(iApi: InstanceAPI): void {
        iApi.notify.notify({
            title: "About",
            message: `.pxl v${version}`,
            subtext: "Copyright (c) 2025 sharvenp",
            showCancel: true,
            cancelLabel: "Close",
        });
    }
}