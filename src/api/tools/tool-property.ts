
export enum ToolPropertyType {
    SLIDER = "slider"
}

export abstract class ToolProperty {

    private _propertyType: ToolPropertyType;
    private _propertyLabel: string;

    constructor(propertyType: ToolPropertyType, propertyLabel: string) {
        this._propertyType = propertyType;
        this._propertyLabel = propertyLabel;
    }

    get propertyType(): ToolPropertyType {
        return this._propertyType
    }

    get propertyLabel(): string {
        return this._propertyLabel
    }
}

export class SliderProperty extends ToolProperty {
    public value: number;
    private readonly _unit: string;
    private readonly _minValue: number;
    private readonly _maxValue: number;

    constructor(propertyLabel: string, minValue: number, maxValue: number, value?: number, unit?: string) {
        super(ToolPropertyType.SLIDER, propertyLabel);

        this.value = value ?? minValue;
        this._unit = unit ?? '';
        this._minValue = minValue;
        this._maxValue = maxValue;
    }

    get minValue(): number {
        return this._minValue;
    }

    get maxValue(): number {
        return this._maxValue;
    }

    get unit(): string {
        return this._unit;
    }
}