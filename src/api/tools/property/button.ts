import { Events } from "../../event";
import { ToolProperty, ToolPropertyType } from "./tool-property";

export class ButtonProperty extends ToolProperty {

    private readonly _event: Events;

    constructor(propertyLabel: string, event: Events) {
        super(ToolPropertyType.BUTTON, propertyLabel);

        this._event = event;
    }

    get event(): Events {
        return this._event;
    }
}