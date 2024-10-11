import { ToolPropertyType } from "../../utils";
import { ToolProperty } from "./tool-property";

export class SliderProperty extends ToolProperty {
    public value: number;
    private readonly _unit: string;
    private readonly _minValue: number;
    private readonly _maxValue: number;
    private readonly _step: number;

    constructor(propertyLabel: string, minValue: number, maxValue: number, value?: number, unit?: string, step?: number) {
        super(ToolPropertyType.SLIDER, propertyLabel);

        this.value = value ?? minValue;
        this._unit = unit ?? '';
        this._step = step ?? 1;
        this._minValue = minValue;
        this._maxValue = maxValue;
    }

    get minValue(): number {
        return this._minValue;
    }

    get maxValue(): number {
        return this._maxValue;
    }

    get step(): number {
        return this._step;
    }

    get unit(): string {
        return this._unit;
    }
}
