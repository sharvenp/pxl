import { GridAPI, PixelCoordinates } from '../grid';
import { Tool, ToolProperty } from './tool'

export class Eraser extends Tool {

    constructor(grid: GridAPI) {
        super(grid);
    }

    invoke(pixelCoords: PixelCoordinates): void {
        this._grid.ctx.clearRect(pixelCoords.x * this._grid.offsetX, pixelCoords.y * this._grid.offsetY, this._grid.offsetX, this._grid.offsetY);
    }

    getToolProperties(): Array<ToolProperty> {
        return [];
    }
}