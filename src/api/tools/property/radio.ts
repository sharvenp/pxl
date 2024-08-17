import { ToolProperty, ToolPropertyType } from "./tool-property";

export class RadioProperty extends ToolProperty {
    public value: string;
    private readonly _options: Array<string>;

    constructor(propertyLabel: string, options: Array<string>, value?: string) {
        super(ToolPropertyType.RADIO, propertyLabel);

        this._options = options;
        this.value = value ?? '';
    }

    get options(): Array<string> {
        return this._options;
    }
}