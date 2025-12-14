import { ref } from 'vue';
import { APIScope, InstanceAPI } from '.';

export class PanelAPI extends APIScope {
    // needs to be a ref to ensure reactivity in Vue components
    private readonly _panels = ref<Record<string, boolean>>({});

    constructor(iApi: InstanceAPI) {
        super(iApi);

        //TODO: Load config
    }

    register(name: string | Array<string>, defaultVisible = true): void {
        const panels = this._panels.value;
        (Array.isArray(name) ? name : [name]).forEach(panel => {
            panels[panel] = defaultVisible;
        });
    }

    unregister(name: string | Array<string>): void {
        const panels = this._panels.value;
        (Array.isArray(name) ? name : [name]).forEach(panel => {
            delete panels[panel];
        });
    }

    toggle(panels: string | Array<string>, visibility?: boolean | undefined): void {
        this._setVisibility(panels, visibility === undefined ? !this.isVisible(panels as string) : visibility);
    }

    toggleAll(visibility?: boolean | undefined): void {
        Object.keys(this._panels.value).forEach(panel => {
            this._panels.value[panel] = visibility === undefined ? !this.isVisible(panel) : visibility;
        });
    }

    isVisible(panel: string): boolean {
        return this._panels.value[panel] ?? false;
    }

    private _setVisibility(panels: string | string[], visible: boolean): void {
        const names = Array.isArray(panels) ? panels : [panels];
        names.forEach(panel => {
            if (panel in this._panels.value) {
                this._panels.value[panel] = visible;
            }
        });
    }

    destroy(): void {
        const panels = Object.keys(this._panels.value);
        panels.forEach(panel => {
            delete this._panels.value[panel];
        });
    }
}