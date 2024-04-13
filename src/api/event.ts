import { TinyEmitter } from 'tiny-emitter';
import { APIScope, InstanceAPI } from '.';

class EventHandler {
    eventName: string;
    handlerName: string;
    handlerFunc: Function;

    constructor(eName: string, hName: string, handler: Function) {
        this.eventName = eName;
        this.handlerName = hName;
        this.handlerFunc = handler;
    }
}

export enum Events {
    CANVAS_MOUSE_MOVE = "canvas_mouse_move",
    CANVAS_MOUSE_DRAG_START = "canvas_mouse_drag_start",
    CANVAS_MOUSE_DRAG_STOP = "canvas_mouse_drag_stop",
    CANVAS_MOUSE_ENTER = "canvas_mouse_enter",
    CANVAS_MOUSE_LEAVE = "canvas_mouse_leave",
    CANVAS_UPDATE = "canvas_update",
    TOOL_SELECT = "tool_select",
    PALETTE_COLOR_SELECT = "palette_color_select",
    PALETTE_COLOR_ADD = "palette_color_add",
    PALETTE_COLOR_REMOVE = "palette_color_remove",
}

export class EventAPI extends APIScope {

    private readonly _eventBus: any;

    private readonly _eventRegister: Array<EventHandler>;

    private readonly _nameRegister: Array<string>;

    private _funCounter: number;

    constructor(iApi: InstanceAPI) {
        super(iApi);
        this._eventBus = new TinyEmitter();
        this._eventRegister = [];
        this._nameRegister = [];
        this._funCounter = 1;
    }

    private findHandler(handlerName: string): EventHandler | undefined {
        return this._eventRegister.find(eh => eh.handlerName === handlerName);
    }

    private handlerNamer(eventName: string): string {
        this._funCounter++;
        return eventName.replace(/\//g, '_') + this._funCounter.toString();
    }

    registerEventName(names: string | Array<string>): void {
        const arr = Array.isArray(names) ? names : [names];
        arr.forEach(n => {
            // don't add if name is already registered
            if (this._nameRegister.indexOf(n) === -1) {
                this._nameRegister.push(n);
            }
        });
    }

    eventNames(): Array<string> {
        return this._nameRegister.slice();
    }

    on(event: string, callback: Function, handlerName = ''): string {
        // check if name already registered
        if (this.findHandler(handlerName)) {
            throw new Error(
                'Duplicate handler name registration: ' + handlerName
            );
        }

        if (!handlerName) {
            handlerName = this.handlerNamer(event);
        }

        // track the event, register with main event bus
        const eh = new EventHandler(event, handlerName, callback);
        this._eventRegister.push(eh);
        this._eventBus.on(event, callback);

        return handlerName;
    }

    off(handlerName: string): void {
        // check if name exists. if not... do nothing? console warn? error?
        const eh = this.findHandler(handlerName);

        if (eh) {
            // remove from event bus and the registry
            this._eventRegister.splice(this._eventRegister.indexOf(eh), 1);
            this._eventBus.off(eh.eventName, eh.handlerFunc);
        }
    }

    offAll(event = ''): void {
        const active: Array<string> = this.activeHandlers(event);
        active.forEach(h => this.off(h));
    }

    emit(event: string, ...args: any[]): void {
        this._eventBus.emit(event, ...args, event);
    }

    once(event: string, callback: Function, handlerName = ''): string {
        // need to do this here and upfront, so we have the name for the unregistration.
        // otherwise we would let the .on() call do its naming thing
        if (!handlerName) {
            handlerName = this.handlerNamer(event);
        }

        const secretCallback = (...args: any[]) => {
            // run the original function. unregister our one-time handler
            callback(...args);
            this.off(handlerName);
        };

        return this.on(event, secretCallback, handlerName);
    }

    activeHandlers(event = ''): Array<string> {
        // add a filter if we implement disabled events

        if (event === '') {
            return this._eventRegister.map(eh => eh.handlerName);
        }
        return this._eventRegister
            .filter(eh => eh.eventName === event)
            .map(eh => eh.handlerName);
    }
}