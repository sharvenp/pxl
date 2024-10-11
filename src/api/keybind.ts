import { APIScope, InstanceAPI} from '.';
import { Events, Key, KeyAction, ToolType } from './utils';

// TODO:
// - Easily create bindings that fire a certain event
// - Bindings setup listeners on the app
// - Bindings should have ids (like event handlers) and should be removable
// - Bindings should also capture "key up" and "key down"
//
// Keep customizability in mind (i.e. bindings can be changed through user interface)

class KeyBind {
    name: string;
    onAction: KeyAction;
    mods: Array<Key>;
    keys: Array<Key>;
    disabled: boolean;
    action: () => void;

    constructor(name: string, onAction: KeyAction, mods: Array<Key>, keys: Array<Key>, action: () => void) {
        this.name = name;
        this.onAction = onAction;
        this.mods = mods;
        this.keys = keys;
        this.disabled = false;
        this.action = action;
    }
}

export class KeyBindAPI extends APIScope {

    private readonly _keyBinds: Array<KeyBind>;
    private readonly _keys: Map<string, boolean>;

    constructor(iApi: InstanceAPI) {
        super(iApi);
        this._keyBinds = [];
        this._keys = new Map();

        this.initialize();
    }

    initialize(): void {
        document.addEventListener('keydown', this._processInputDown.bind(this));
        document.addEventListener('keyup', this._processInputUp.bind(this));

        this._initiailizeDefaultKeyBinds()
    }

    destroy(): void {
        document.removeEventListener('keydown', this._processInputDown.bind(this));
        document.removeEventListener('keyup', this._processInputUp.bind(this));
    }

    private _findKeyBind(keyBindName: string): KeyBind | undefined {
        return this._keyBinds.find(kb => kb.name === keyBindName);
    }

    on(keyBindName: string, onAction: KeyAction, mods: Array<Key>, keys: Array<Key>, action: () => void): void {
        // check if name already registered
        if (this._findKeyBind(keyBindName)) {
            throw new Error('Duplicate keybind name registration: ' + keyBindName);
        }

        // register the key bind
        this._keyBinds.push(new KeyBind(keyBindName, onAction, mods, keys, action))
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

        this._keys.set(evt.key, true);
        this._matchKeyBind(KeyAction.DOWN);
    }

    private _processInputUp(evt: KeyboardEvent): void {

        this._matchKeyBind(KeyAction.UP);
        this._keys.delete(evt.key);
    }

    private _matchKeyBind(onAction: KeyAction): void {
        // look at the current state of keys and find a match
        // if match(es) found, execute them

        let candidateKeyBinds = this._keyBinds.filter(k => k.onAction === onAction);
        candidateKeyBinds = candidateKeyBinds.filter(kb => kb.keys.every(k => this._keys.has(k))
                                                        && kb.mods.every(m => this._keys.has(m)));

        if (candidateKeyBinds.length > 0) {
            console.log(candidateKeyBinds.map(k => k.name))
        }

        // fire events
        candidateKeyBinds.forEach(kb => kb.action());
    }

    private _initiailizeDefaultKeyBinds(): void {

        // TODO: make these customizable
        this.on("pencil-select", KeyAction.DOWN, [], [Key.Digit1], () => this.$iApi.tool.selectTool(ToolType.PENCIL));
        this.on("eraser-select", KeyAction.UP, [], [Key.Digit2], () => this.$iApi.tool.selectTool(ToolType.ERASER));
    }
}