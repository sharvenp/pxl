import { APIScope, InstanceAPI, NotifyAPI } from '.';
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

        document.addEventListener('keydown', this._processInputDown.bind(this));
        document.addEventListener('keyup', this._processInputUp.bind(this));
        window.addEventListener('blur', this._processBlur.bind(this));

        this._initiailizeDefaultKeyBinds()

    }

    destroy(): void {

        document.removeEventListener('keydown', this._processInputDown.bind(this));
        document.removeEventListener('keyup', this._processInputUp.bind(this));
        window.removeEventListener('blur', this._processBlur.bind(this));

        this._keyBinds.length = 0;
        this._keys.length = 0;
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

        const key = <Key>evt.key.toUpperCase();

        this._keys.push(key);

        console.log(this._keys);

        const matchKeys = (keys: Array<Key>) => {
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

        const key = <Key>evt.key.toUpperCase();

        const candidateKeyBinds = this._keyBinds.filter(k => k.onAction === KeyAction.UP && k.keys.includes(key));

        // trigger actions
        candidateKeyBinds.forEach(kb => {
            kb.action();
        });

        const index = this._keys.indexOf(key);
        if (index > -1) {
            this._keys.splice(index, 1);
        }

        console.log(this._keys);
    }

    private _processBlur(): void {
        // clear the keys
        this._keys.length = 0;
    }

    private _initiailizeDefaultKeyBinds(): void {

        // Tools
        this.on("pencil-select", KeyAction.DOWN, [Key.DIGIT_1], () => this.$iApi.tool.selectTool(ToolType.PENCIL));
        this.on("eraser-select", KeyAction.DOWN, [Key.DIGIT_2], () => this.$iApi.tool.selectTool(ToolType.ERASER));
        this.on("picker-select", KeyAction.DOWN, [Key.DIGIT_3], () => this.$iApi.tool.selectTool(ToolType.PICKER));
        this.on("fill-select", KeyAction.DOWN, [Key.DIGIT_4], () => this.$iApi.tool.selectTool(ToolType.FILL));
        this.on("rectangle-select", KeyAction.DOWN, [Key.DIGIT_5], () => this.$iApi.tool.selectTool(ToolType.RECTANGLE));
        this.on("ellipse-select", KeyAction.DOWN, [Key.DIGIT_6], () => this.$iApi.tool.selectTool(ToolType.ELLIPSE));
        this.on("line-select", KeyAction.DOWN, [Key.DIGIT_7], () => this.$iApi.tool.selectTool(ToolType.LINE));
        this.on("shade-select", KeyAction.DOWN, [Key.DIGIT_8], () => this.$iApi.tool.selectTool(ToolType.SHADE));
        this.on("select-select", KeyAction.DOWN, [Key.DIGIT_9], () => this.$iApi.tool.selectTool(ToolType.SELECT));

        // Picker alt-click
        let currTool: ToolType | undefined = undefined;
        this.on("picker-alt-down", KeyAction.DOWN, [Key.BACKQUOTE], () => {
            currTool = this.$iApi.tool.selectedTool.toolType;
            this.$iApi.tool.selectTool(ToolType.PICKER);
        });
        this.on("picker-alt-up", KeyAction.UP, [Key.BACKQUOTE], () => {
            if (currTool !== undefined) {
                this.$iApi.tool.selectTool(currTool)
            }
        });

        // Toggle tool alt mode
        this.on("tool-alt-mode-down", KeyAction.DOWN, [Key.SHIFT], () => this.$iApi.tool.toggleAltMode(true));
        this.on("tool-alt-mode-up", KeyAction.UP, [Key.SHIFT], () => this.$iApi.tool.toggleAltMode(false));

        // Create new project
        this.on("new", KeyAction.DOWN, [Key.CONTROL, Key.N], () => {
            NotifyAPI.showNewProjectPrompt(this.$iApi);
        });

        // Open project
        this.on("open", KeyAction.DOWN, [Key.CONTROL, Key.O], () => {
            NotifyAPI.showOpenProjectPrompt(this.$iApi);
        });

        // Save
        this.on("save", KeyAction.DOWN, [Key.CONTROL, Key.S], () => {
            if (this.$iApi.initalized && this.$iApi.$oApi) {
                this.$iApi.$oApi?.saveProject();
            }
        });

        // Save as
        this.on("save-as", KeyAction.DOWN, [Key.CONTROL, Key.SHIFT, Key.S], () => {
            if (this.$iApi.initalized && this.$iApi.$oApi) {
                this.$iApi.$oApi?.saveProject();
            }
        });

        // Export image
        this.on("export", KeyAction.DOWN, [Key.CONTROL, Key.E], () => {
            if (this.$iApi.initalized) {
                this.$iApi.canvas.grid.exportImage();
            }
        });

        // Export frames
        this.on("export-frames", KeyAction.DOWN, [Key.CONTROL, Key.SHIFT, Key.E], () => {
            if (this.$iApi.initalized) {
                this.$iApi.canvas.grid.exportFrames();
            }
        });

        // Undo
        this.on("undo", KeyAction.DOWN, [Key.CONTROL, Key.Z], () => this.$iApi.history.undo());

        // Redo
        this.on("redo", KeyAction.DOWN, [Key.CONTROL, Key.Y], () => this.$iApi.history.redo());

        // Zoom in
        this.on("zoom-in", KeyAction.DOWN, [Key.CONTROL, Key.EQUAL], () => {
            if (this.$iApi.initalized) {
                this.$iApi.canvas.zoomIn();
            }
        });

        // Zoom out
        this.on("zoom-out", KeyAction.DOWN, [Key.CONTROL, Key.MINUS], () => {
            if (this.$iApi.initalized) {
                this.$iApi.canvas.zoomOut();
            }
        });

        // Help
        this.on("open-help", KeyAction.DOWN, [Key.F1], () => {
            NotifyAPI.showAboutPrompt(this.$iApi);
        });
    }
}