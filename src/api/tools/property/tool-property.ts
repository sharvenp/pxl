
export enum ToolPropertyType {
    SLIDER = "slider",
    CHECK_BOX = "check_box",
    RADIO = 'radio'
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


