import { InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolProperty, Tools } from './tool'

export class Pencil extends Tool {

    constructor(iApi: InstanceAPI) {
        super(iApi, Tools.PENCIL);
    }

    invoke(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        let color = this.$iApi.palette.selectedColor?.color;
        if (color && grid) {
            grid.ctx.fillStyle = color;
            grid.ctx.fillRect(pixelCoords.x * grid.offsetX, pixelCoords.y * grid.offsetY, grid.offsetX, grid.offsetY);

            this.notify();
        }
    }

    getToolProperties(): Array<ToolProperty> {
        return [];
    }
}