import { InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolProperty, Tools } from './tool'

export class Eraser extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, Tools.ERASER);
    }

    invoke(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid) {
            grid.ctx.clearRect(pixelCoords.x * grid.offsetX, pixelCoords.y * grid.offsetY, grid.offsetX, grid.offsetY);
            this.notify();
        }
    }

    getToolProperties(): Array<ToolProperty> {
        return [];
    }
}