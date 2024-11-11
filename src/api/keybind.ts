import { APIScope, InstanceAPI} from '.';
import { Key, KeyAction, ToolType } from './utils';

class KeyBind {
    name: string;
    onAction: KeyAction;
    keys: Array<Key>;
    disabled: boolean;
    action: () => void;

    constructor(name: string, onAction: KeyAction, keys: Array<Key>, action: () => void) {
        this.name = name;
        this.onAction = onAction;
        this.keys = keys;
        this.disabled = false;
        this.action = action;
    }
}

export class KeyBindAPI extends APIScope {

    private readonly _keyBinds: Array<KeyBind>;
    private readonly _keys: Array<string>;

    constructor(iApi: InstanceAPI) {
        super(iApi);
        this._keyBinds = [];
        this._keys = [];

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

    on(keyBindName: string, onAction: KeyAction, keys: Array<Key>, action: () => void): void {
        // check if name already registered
        if (this._findKeyBind(keyBindName)) {
            throw new Error('Duplicate keybind name registration: ' + keyBindName);
        }

        // register the key bind
        this._keyBinds.push(new KeyBind(keyBindName, onAction, keys, action))
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

        // prevent firing repeatedly when held down
        if (evt.repeat) {
            return
        }

        let key = <Key>evt.key;

        this._keys.push(key);

        let matchKeys = (keys: Array<Key>) => {
            if (keys.length != this._keys.length) {
                return false;
            }
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] !== this._keys[i]) {
                    return false;
                }
            }
            return true;
        };

        let candidateKeyBinds = this._keyBinds.filter(k => k.onAction === KeyAction.DOWN);
        candidateKeyBinds = candidateKeyBinds.filter(kb => matchKeys(kb.keys));

        // trigger actions
        candidateKeyBinds.forEach(kb => {
            kb.action();
        });
    }

    private _processInputUp(evt: KeyboardEvent): void {

        let key = <Key>evt.key;

        let candidateKeyBinds = this._keyBinds.filter(k => k.onAction === KeyAction.UP && k.keys.includes(key));

        // trigger actions
        candidateKeyBinds.forEach(kb => {
            kb.action();
        });

        const index = this._keys.indexOf(key);
        if (index > -1) {
            this._keys.splice(index, 1);
        }
    }

    private _initiailizeDefaultKeyBinds(): void {

        // TODO: make these customizable and load them from user preferences

        // Tools
        this.on("pencil-select", KeyAction.DOWN, [Key.Digit1], () => this.$iApi.tool.selectTool(ToolType.PENCIL));
        this.on("eraser-select", KeyAction.DOWN, [Key.Digit2], () => this.$iApi.tool.selectTool(ToolType.ERASER));
        this.on("picker-select", KeyAction.DOWN, [Key.Digit3], () => this.$iApi.tool.selectTool(ToolType.PICKER));
        this.on("fill-select", KeyAction.DOWN, [Key.Digit4], () => this.$iApi.tool.selectTool(ToolType.FILL));
        this.on("rectangle-select", KeyAction.DOWN, [Key.Digit5], () => this.$iApi.tool.selectTool(ToolType.RECTANGLE));
        this.on("ellipse-select", KeyAction.DOWN, [Key.Digit6], () => this.$iApi.tool.selectTool(ToolType.ELLIPSE));
        this.on("line-select", KeyAction.DOWN, [Key.Digit7], () => this.$iApi.tool.selectTool(ToolType.LINE));
        this.on("shade-select", KeyAction.DOWN, [Key.Digit8], () => this.$iApi.tool.selectTool(ToolType.SHADE));
        this.on("select-select", KeyAction.DOWN, [Key.Digit9], () => this.$iApi.tool.selectTool(ToolType.SELECT));

        // Picker alt-click
        let currTool: ToolType | undefined = undefined;
        this.on("picker-alt-down", KeyAction.DOWN, [Key.Backquote], () => {
            currTool = this.$iApi.tool.selectedTool?.toolType;
            this.$iApi.tool.selectTool(ToolType.PICKER);
        });
        this.on("picker-alt-up", KeyAction.UP, [Key.Backquote], () => {
            if (currTool !== undefined) {
                this.$iApi.tool.selectTool(currTool)
            }
        });

        // Toggle tool alt mode
        this.on("tool-alt-mode-down", KeyAction.DOWN, [Key.Shift], () => this.$iApi.tool.toggleAltMode(true));
        this.on("tool-alt-mode-up", KeyAction.UP, [Key.Shift], () => this.$iApi.tool.toggleAltMode(false));

        // Undo
        this.on("undo", KeyAction.DOWN, [Key.Control, Key.z], () => this.$iApi.history.undo());

        // Redo
        this.on("redo", KeyAction.DOWN, [Key.Control, Key.y], () => this.$iApi.history.redo());

        // TODO: Open
        this.on("open", KeyAction.DOWN, [Key.Control, Key.o], () => { });
    }
}