import { GridAPI, PixelCoordinates } from '../grid';
import { Tool, ToolProperty } from './tool'

export class Pencil extends Tool {

    constructor(grid: GridAPI) {
        super(grid);
    }

    invoke(pixelCoords: PixelCoordinates): void {
        let color = this.$iApi.palette.selectedColor?.color;
        if (color) {
            this._grid.ctx.fillStyle = color;
            this._grid.ctx.fillRect(pixelCoords.x * this._grid.offsetX, pixelCoords.y * this._grid.offsetY, this._grid.offsetX, this._grid.offsetY);

            this.notify();
        }
    }

    getToolProperties(): Array<ToolProperty> {
        return [];
    }
}