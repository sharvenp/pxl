import { APIScope, Events, InstanceAPI } from '.';
import { Key } from 'ts-key-enum';

// TODO:
// - Easily create bindings that fire a certain event
// - Bindings setup listeners on the app
// - Bindings should have ids (like event handlers) and should be removable
// - Bindings should also capture "key up" and "key down"
//
// Keep customizability in mind (i.e. bindings can be changed through user interface)

enum KeyAction {
    DOWN = 'down',
    UP = 'up'
}

class KeyBind {
    name: string;
    onAction: KeyAction;
    mods: Array<Key>;
    keys: Array<Key>;
    event: Events;
    args: Array<any>;
    disabled: boolean;

    constructor(name: string, onAction: KeyAction, mods: Array<Key>, keys: Array<Key>, event: Events, ...args: Array<any>) {
        this.name = name;
        this.onAction = onAction;
        this.mods = mods;
        this.keys = keys;
        this.event = event;
        this.args = args;
        this.disabled = false;
    }
}

export class KeyboardAPI extends APIScope {

    private readonly _keyBinds: Array<KeyBind>;
    private readonly _keys: Map<Key, boolean>;

    constructor(iApi: InstanceAPI) {
        super(iApi);
        this._keyBinds = [];
        this._keys = new Map();

        this.initialize();
    }

    initialize(): void {
        document.addEventListener('keydown', this._processInputDown);
        document.addEventListener('keyup', this._processInputUp);
    }

    destroy(): void {
        document.removeEventListener('keydown', this._processInputDown);
        document.removeEventListener('keyup', this._processInputUp);
    }

    private _findKeyBind(keyBindName: string): KeyBind | undefined {
        return this._keyBinds.find(kb => kb.name === keyBindName);
    }

    on(keyBindName: string, onAction: KeyAction, mods: Array<Key>, keys: Array<Key>, event: Events, ...args: Array<any>): void {
        // check if name already registered
        if (this._findKeyBind(keyBindName)) {
            throw new Error('Duplicate keybind name registration: ' + keyBindName);
        }

        // register the key bind
        this._keyBinds.push(new KeyBind(keyBindName, onAction, mods, keys, event, args))
    }

    toggle(keyBindName: string): void {
        // check if name exists
        const kb = this._findKeyBind(keyBindName);

        if (kb) {
            // toggle it
            kb.disabled = !kb.disabled;
        }
    }

    private _processInputDown(evt: KeyboardEvent): void {

        let key = <Key>evt.key;
        this._keys.set(key, true);

        this._matchKeyBind(KeyAction.DOWN);

    }

    private _processInputUp(evt: KeyboardEvent): void {

        this._matchKeyBind(KeyAction.UP);

        let key = <Key>evt.key;
        this._keys.delete(key);

    }

    private _matchKeyBind(onAction: KeyAction) {
        // look at the current state of keys and find a match
        // if match(es) found, execute them

        let candidateKeyBinds = this._keyBinds.filter(k => k.onAction === onAction);

        // TODO: how to match this? Ask AI ?

        // fire events
        candidateKeyBinds.forEach(kb => {
            this.$iApi.event.emit(kb.event, ...kb.args);
        });
    }
}