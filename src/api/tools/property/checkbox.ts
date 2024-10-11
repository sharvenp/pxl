import { ToolPropertyType } from "../../utils";
import { ToolProperty } from "./tool-property";

export class CheckboxProperty extends ToolProperty {
    public value: boolean;

    constructor(propertyLabel: string, value?: boolean) {
        super(ToolPropertyType.CHECK_BOX, propertyLabel);

        this.value = value ?? false;
    }
}