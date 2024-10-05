import { APIScope, Events, InstanceAPI } from '.';
import { Key } from 'ts-key-enum';

// TODO:
// - Easily create bindings that fire a certain event
// - Bindings setup listeners on the app
// - Bindings should have ids (like event handlers) and should be removable
// - Bindings should also capture "key up" and "key down"
//
// Keep customizability in mind (i.e. bindings can be changed through user interface)

class KeyBind {
    name: string;
    mods: Array<Key>;
    keys: Array<Key>;
    event: Events;
    args: Array<any>;
    disabled: boolean;

    constructor(name: string, mods: Array<Key>, keys: Array<Key>, event: Events, ...args: Array<any>) {
        this.name = name;
        this.mods = mods;
        this.keys = keys;
        this.event = event;
        this.args = args;
        this.disabled = false;
    }
}

export class KeyboardAPI extends APIScope {

    private readonly _keyBinds: Array<KeyBind>;

    constructor(iApi: InstanceAPI) {
        super(iApi);
        this._keyBinds = [];
    }

    private findKeyBind(keyBindName: string): KeyBind | undefined {
        return this._keyBinds.find(kb => kb.name === keyBindName);
    }

    on(keyBindName: string, mods: Array<Key>, keys: Array<Key>, event: Events, ...args: Array<any>): void {
        // check if name already registered
        if (this.findKeyBind(keyBindName)) {
            throw new Error('Duplicate keybind name registration: ' + keyBindName);
        }

        // register the key bind
        this._keyBinds.push(new KeyBind(keyBindName, mods, keys, event, args))
    }

    toggle(keyBindName: string): void {
        // check if name exists
        const kb = this.findKeyBind(keyBindName);

        if (kb) {
            // toggle it
            kb.disabled = !kb.disabled;
        }
    }

    processInput(): void {
        // TODO: listen for keyboard input and match with closest keybind
    }
}