import { Application, Container, ContainerChild, Graphics, Rectangle } from 'pixi.js';
import { APIScope, InstanceAPI } from '.';
import { Events, MAX_LAYER_COUNT, PixelCoordinates, RGBAColor, Utils } from './utils';

export class GridAPI extends APIScope {

    private _pixi: Application;

    private _drawContainer: Container;
    private _previewContainer: Container;
    private _drawLayers: Array<Container>;
    private _activeLayer: Container;
    private _activeIndex: number;

    constructor(iApi: InstanceAPI, pixi: Application) {
        super(iApi);

        this._pixi = pixi;

        this._drawContainer = new Container({ eventMode: 'none' });

        this._activeLayer = new Container({ eventMode: 'none' });
        this._drawContainer.addChild(this._activeLayer);
        this._pixi.stage.addChild(this._drawContainer);

        this._drawLayers = [this._activeLayer];
        this._activeIndex = 0;

        this._previewContainer = new Container({ eventMode: 'none' });
        this._pixi.stage.addChild(this._previewContainer);

        this.initialize();
    }

    initialize(): void {
    }

    destroy(): void {
    }

    clear(): void {
    }

    getPixel(coords: PixelCoordinates): RGBAColor {

        // Use extract to get the pixel data
        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._drawContainer,
            antialias: false,
            frame: new Rectangle(coords.x, coords.y, 1, 1),
            resolution: 1
        });

        const premultiplyFactor = (pixelData.pixels[3] / 255);

        if (premultiplyFactor !== 0) {
            return {
                r: Math.round(pixelData.pixels[0] / premultiplyFactor),
                g: Math.round(pixelData.pixels[1] / premultiplyFactor),
                b: Math.round(pixelData.pixels[2] / premultiplyFactor),
                a: pixelData.pixels[3]
            }
        } else {
            return {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            }
        }
    }

    getPixelFrame(coords: PixelCoordinates, width: number, height: number): Array<[PixelCoordinates, RGBAColor]> {

        // Use extract to get the pixel data
        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._activeLayer,
            antialias: false,
            frame: new Rectangle(coords.x, coords.y, width, height),
            resolution: 1
        });

        let data: Array<[PixelCoordinates, RGBAColor]> = [];

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const idx = (y * width + x) * 4;

                const premultiplyFactor = (pixelData.pixels[idx + 3] / 255);
                let c: RGBAColor | undefined = undefined;
                if (premultiplyFactor !== 0) {
                    c = {
                        r: Math.round(pixelData.pixels[idx] / premultiplyFactor),
                        g: Math.round(pixelData.pixels[idx + 1] / premultiplyFactor),
                        b: Math.round(pixelData.pixels[idx + 2] / premultiplyFactor),
                        a: pixelData.pixels[idx + 3]
                    }
                } else {
                    c = { r: 0, g: 0, b: 0, a: 0 }
                }

                data.push([{ x: coords.x + x, y: coords.y + y }, c]);
            }
        }

        return data;
    }

    draw(graphic: Graphics | Container): void {
        if (graphic.parent === this._activeLayer) {
            return;
        }

        this._activeLayer.addChild(graphic);
    }

    pop(): ContainerChild {
        let child = this._activeLayer.removeChildAt<ContainerChild>(this._activeLayer.children.length - 1);
        return child;
    }

    floodFill(graphic: Graphics, coords: PixelCoordinates, tolerance: number): void {

        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._drawContainer,
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });

        let validCoords = (c: PixelCoordinates) => (c.x >= 0 && c.x < this.width && c.y >= 0 && c.y < this.height);
        let getPixelRGBA = (c: PixelCoordinates): RGBAColor => {
            const idx = (c.y * this.width + c.x) * 4;
            const premultiplyFactor = (pixelData.pixels[idx + 3] / 255);
            return {
                r: premultiplyFactor === 0 ? 0 : Math.round(pixelData.pixels[idx] / premultiplyFactor),
                g: premultiplyFactor === 0 ? 0 : Math.round(pixelData.pixels[idx + 1] / premultiplyFactor),
                b: premultiplyFactor === 0 ? 0 : Math.round(pixelData.pixels[idx + 2] / premultiplyFactor),
                a: pixelData.pixels[idx + 3]
            }
        };


        // color to check similarity against
        let targetColor = getPixelRGBA(coords);

        // use bfs to fill neighboring colors
        let fillStack: Array<PixelCoordinates> = [];
        fillStack.push(coords);

        // keep track of seen colors to prevent revisiting the same cell
        let visited: Record<string, boolean> = {};

        while (fillStack.length > 0) {

            let { x, y } = fillStack.pop()!;
            let currCellColor = getPixelRGBA({ x, y });

            // check current cell has been visited
            if (visited[`${x}-${y}`]) {
                continue;
            }

            // tolerance is the threshold for the color similarity of neighboring cells     as a percentage
            // check current cell color is above threshold
            // if it is, continue
            if (Utils.getColorSimilarity(currCellColor, targetColor) > tolerance) {
                continue;
            }

            // fill color
            graphic.rect(x, y, 1, 1);
            visited[`${x}-${y}`] = true;

            if (validCoords({ x, y: y + 1 })) {
                fillStack.push({ x, y: y + 1 });
            }
            if (validCoords({ x, y: y - 1 })) {
                fillStack.push({ x, y: y - 1 });
            }
            if (validCoords({ x: x + 1, y })) {
                fillStack.push({ x: x + 1, y });
            }
            if (validCoords({ x: x - 1, y })) {
                fillStack.push({ x: x - 1, y });
            }
        }

        this.draw(graphic);
    }

    contains(coords: PixelCoordinates): boolean {
        return (coords.x >= 0 && coords.x < this.width) && (coords.y >= 0 && coords.y < this.height);
    }

    containsGraphic(graphic: Graphics): boolean {
        return this._activeLayer.children.some(g => g === graphic);
    }

    render(): void {
        this._notify();
    }

    reflectCoordinates(coords: PixelCoordinates, offsetX: number = 0, offsetY: number = 0): Array<PixelCoordinates> {
        let reflectedCoords = [coords];
        if (this.$iApi.settings.mirrorX) {
            // reflect coords along x-axis
            reflectedCoords.push({ x: this.width - 1 + offsetX - coords.x, y: coords.y });
        }
        if (this.$iApi.settings.mirrorY) {
            // reflect all coords along y-axis (including previously x-axis reflected coords)
            let newCoords = reflectedCoords.map(c => ({ x: c.x, y: this.height - 1 + offsetY - c.y }));
            reflectedCoords.push(...newCoords);
        }
        return reflectedCoords;
    }

    setActiveLayer(layerIdx: number): void {
        if (layerIdx < 0 || layerIdx > this._drawLayers.length - 1) {
            return;
        }
        this._activeLayer = this._drawLayers[layerIdx];
        this._activeIndex = layerIdx;

        this.$iApi.event.emit(Events.CANVAS_LAYER_SELECTED);
    }

    addLayer(): void {
        if (this._drawLayers.length >= MAX_LAYER_COUNT) {
            return;
        }

        let newLayer = new Container({ eventMode: 'none' });
        this._drawContainer.addChild(newLayer);
        this._drawLayers.push(newLayer);

        this.$iApi.event.emit(Events.CANVAS_LAYER_ADDED);

        // select the new layer
        this.setActiveLayer(this._drawLayers.length - 1);
    }

    removeLayer(): void {
        if (this._drawLayers.length <= 1) {
            // at least one layer is needed
            return;
        }

        let indexToRemove = this._activeIndex;
        let layerToRemove = this._activeLayer;

        this.setActiveLayer(this._activeIndex - 1);

        this._drawContainer.removeChild(layerToRemove);
        this._drawLayers.splice(indexToRemove, 1);
        layerToRemove.destroy();

        this.$iApi.event.emit(Events.CANVAS_LAYER_REMOVED);

        this._notify();
    }

    private _notify(): void {
        // render the update
        this._pixi.renderer.render(this._drawContainer);
        this.$iApi.event.emit(Events.CANVAS_UPDATE);
    }

    get drawLayers(): Array<Container> {
        return this._drawLayers;
    }

    get activeLayer(): Container {
        return this._activeLayer;
    }

    get activeIndex(): number {
        return this._activeIndex;
    }

    get previewContainer(): Container {
        return this._previewContainer;
    }

    get width(): number {
        return this._pixi.canvas.width;
    }

    get height(): number {
        return this._pixi.canvas.height;
    }

    get empty(): boolean {
        return this._activeLayer.children.length === 0;
    }
}
