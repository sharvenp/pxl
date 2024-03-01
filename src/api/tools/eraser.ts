import { InstanceAPI, PixelCoordinates } from '..';
import { Tool, ToolType, SliderProperty} from '.'

export class Eraser extends Tool {

    private _eraserWidthProperty: SliderProperty;

    constructor(iApi: InstanceAPI) {
        super(iApi, ToolType.ERASER);

        this._eraserWidthProperty = new SliderProperty("Eraser Size", 1, 10, 1, 'px')

        this._toolProperties = [
            this._eraserWidthProperty
        ]
    }

    invoke(pixelCoords: PixelCoordinates): void {
        let grid = this.$iApi.canvas.grid!;
        if (grid) {

            let pxWidth = this._eraserWidthProperty.value;

            let x = pixelCoords.x;
            let y = pixelCoords.y;

            if (pxWidth >= 3 && pxWidth % 2 === 1) {
                x -= 1;
                y -= 1;
            }

            grid.ctx.clearRect(x * grid.offsetX, y * grid.offsetY, grid.offsetX * pxWidth, grid.offsetY * pxWidth);
            this.notify();
        }
    }
}