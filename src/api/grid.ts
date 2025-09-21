import { AlphaFilter, Application, Container, ContainerChild, Graphics, Rectangle } from 'pixi.js';
import { APIScope, InstanceAPI } from '.';
import { Events, LayerFilterType, MAX_LAYER_COUNT, MAX_FRAME_COUNT, PixelCoordinates, DataRectangle, RGBAColor, Utils, PxlSpecialGraphicType } from './utils';

export class GridAPI extends APIScope {

    private _pixi: Application;

    private _frames: Array<Container>;
    private _activeFrame: Container;
    private _frameIndex: number;
    private _onionSkin: boolean;

    private _previewContainer: Container;

    private _drawLayers: { [frame: string]: Array<Container>; };
    private _activeLayer: Container;
    private _activeIndex: number;

    constructor(iApi: InstanceAPI, pixi: Application) {
        super(iApi);

        this._pixi = pixi;

        this._activeFrame = new Container({ eventMode: 'none', blendMode: 'normal', label: Utils.getRandomId() });
        this._frames = [this._activeFrame];
        this._frameIndex = 0;
        this._onionSkin = false;

        this._pixi.stage.addChild(this._activeFrame);

        this._previewContainer = new Container({ eventMode: 'none' });
        this._pixi.stage.addChild(this._previewContainer);

        const layerConfig = iApi.state.loadedState?.canvas.layers;

        this._drawLayers = {};

        if (layerConfig) {
            // TODO: remove
            this._activeLayer = new Container({ eventMode: 'none', label: Utils.getRandomId() });
            this._activeIndex = 0;

            // TODO: fix config
            // layerConfig.states.forEach((layerState: any) => {
            //     const newLayer = new Container({
            //         eventMode: 'none',
            //         label: layerState.label,
            //         visible: layerState.visible,
            //         alpha: layerState.alpha,
            //         blendMode: layerState.blendMode,
            //         filters: layerState.filters.map((filter: any) => {
            //             switch (filter.type) {
            //                 case LayerFilterType.ALPHA:
            //                     return new AlphaFilter({ alpha: filter.alpha });
            //                 default:
            //                     return undefined;
            //             }
            //         }).filter((f: any) => f !== undefined)
            //     });

            //     // draw the pixel data rectangles
            //     const graphic = new Graphics({ roundPixels: true, label: PxlSpecialGraphicType.FROM_LOAD_STATE });
            //     layerState.data.forEach((rect: DataRectangle) => {
            //         graphic.rect(rect.x, rect.y, rect.width, rect.height).fill(rect.color);
            //     });
            //     newLayer.addChild(graphic);

            //     this._activeFrame.addChild(newLayer);
            //     this._drawLayers.push(newLayer);
            // });
            // this._activeLayer = this._drawLayers[layerConfig.selectedLayer];
            // this._activeIndex = layerConfig.selectedLayer;
        } else {
            this._activeLayer = new Container({ eventMode: 'none', label: Utils.getRandomId() });
            this._activeLayer.filters = [new AlphaFilter({ alpha: 1 })];
            this._activeFrame.addChild(this._activeLayer);

            this._drawLayers[this._activeFrame.label] = [this._activeLayer];
            this._activeIndex = 0;
        }
    }

    destroy(): void {
        this._previewContainer.destroy();

        // clear draw layers
        for (const key in this._drawLayers) {
            if (Array.isArray(this._drawLayers[key])) {
                this._drawLayers[key].forEach(layer => layer.destroy({ children: true }));
            }
        }
        this._drawLayers = {};
        this._activeIndex = 0;

        // clear frames
        this._frames.forEach(frame => frame.destroy({ children: true }));
        this._frameIndex = 0;
        this._frames.length = 0;
    }

    getPixel(coords: PixelCoordinates): RGBAColor {

        // Use extract to get the pixel data
        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._activeFrame,
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

    extractPixels(layerIdx: number | undefined = undefined): Uint8ClampedArray {
        const pixelData = this._pixi.renderer.extract.pixels({
            target: layerIdx === undefined ? this._activeLayer : this._drawLayers[this._activeFrame.label][layerIdx],
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });

        return pixelData.pixels;
    }

    getPixelFrame(coords: PixelCoordinates, width: number, height: number): Array<[PixelCoordinates, RGBAColor]> {

        // Use extract to get the pixel data
        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._activeLayer,
            antialias: false,
            frame: new Rectangle(coords.x, coords.y, width, height),
            resolution: 1
        });

        const data: Array<[PixelCoordinates, RGBAColor]> = [];

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

    exportImage(frameIndex?: number): void {

        let frame = this._activeFrame;
        if (frameIndex !== undefined && frameIndex >= 0 && frameIndex < this._frames.length) {
            frame = this._frames[frameIndex];
        }

        this._pixi.renderer.extract.download({
            filename: "pxl-image.png",
            target: frame,
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });
    }

    exportImageBase64(frameIndex?: number): Promise<string> {

        let frame = this._activeFrame;
        if (frameIndex !== undefined && frameIndex >= 0 && frameIndex < this._frames.length) {
            frame = this._frames[frameIndex];
        }

        return this._pixi.renderer.extract.base64({
            target: frame,
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });
    }

    getContainerPreview(container: Container): HTMLCanvasElement {
        return this._pixi.renderer.extract.canvas(
            {
                target: container,
                antialias: false,
                frame: new Rectangle(0, 0, this._pixi.canvas.width, this._pixi.canvas.height),
                resolution: 1
            }) as HTMLCanvasElement;
    }

    draw(graphic: Graphics | Container): void {
        if (graphic.parent === this._activeLayer) {
            return;
        }

        this._activeLayer.addChild(graphic);
    }

    peek(): ContainerChild {
        const child = this._activeLayer.getChildAt<ContainerChild>(this._activeLayer.children.length - 1);
        return child;
    }

    pop(): ContainerChild {
        const child = this._activeLayer.removeChildAt<ContainerChild>(this._activeLayer.children.length - 1);
        return child;
    }

    floodFill(graphic: Graphics, coords: PixelCoordinates, tolerance: number): void {

        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._activeLayer,
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });

        const validCoords = (c: PixelCoordinates) => (c.x >= 0 && c.x < this.width && c.y >= 0 && c.y < this.height);
        const getPixelRGBA = (c: PixelCoordinates): RGBAColor => {
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
        const targetColor = getPixelRGBA(coords);

        // use bfs to fill neighboring colors
        const fillStack: Array<PixelCoordinates> = [];
        fillStack.push(coords);

        // keep track of seen colors to prevent revisiting the same cell
        const visited: Record<string, boolean> = {};

        while (fillStack.length > 0) {

            const { x, y } = fillStack.pop()!;
            const currCellColor = getPixelRGBA({ x, y });

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
        const reflectedCoords = [coords];
        if (this.$iApi.canvas.mirrorX) {
            // reflect coords along x-axis
            reflectedCoords.push({ x: this.width - 1 + offsetX - coords.x, y: coords.y });
        }
        if (this.$iApi.canvas.mirrorY) {
            // reflect all coords along y-axis (including previously x-axis reflected coords)
            const newCoords = reflectedCoords.map(c => ({ x: c.x, y: this.height - 1 + offsetY - c.y }));
            reflectedCoords.push(...newCoords);
        }
        return reflectedCoords;
    }

    setActiveLayer(layerIdx: number): void {
        if (layerIdx < 0 || layerIdx > this._drawLayers[this._activeFrame.label].length - 1) {
            return;
        }
        this._activeLayer = this._drawLayers[this._activeFrame.label][layerIdx];
        this._activeIndex = layerIdx;

        this.$iApi.event.emit(Events.CANVAS_LAYER_SELECTED);
    }

    addLayer(): void {
        if (this._drawLayers[this._activeFrame.label].length >= MAX_LAYER_COUNT) {
            return;
        }

        const newLayer = new Container({ eventMode: 'none' });
        let id = Utils.getRandomId();
        while (this._drawLayers[this._activeFrame.label].some(l => l.label === id)) {
            // ensure unique id
            id = Utils.getRandomId();
        }
        newLayer.label = id
        newLayer.filters = [new AlphaFilter({ alpha: 1 })];

        this._activeFrame.addChild(newLayer);
        this._drawLayers[this._activeFrame.label].push(newLayer);

        this.$iApi.event.emit(Events.CANVAS_LAYER_ADDED);

        // select the new layer
        this.setActiveLayer(this._drawLayers[this._activeFrame.label].length - 1);
    }

    removeLayer(): void {
        if (this._drawLayers[this._activeFrame.label].length <= 1) {
            // at least one layer is needed
            return;
        }

        const indexToRemove = this._activeIndex;
        const layerToRemove = this._activeLayer;

        this.setActiveLayer(this._activeIndex - 1);

        this._activeFrame.removeChild(layerToRemove);
        this._drawLayers[this._activeFrame.label].splice(indexToRemove, 1);
        layerToRemove.destroy();

        this.$iApi.event.emit(Events.CANVAS_LAYER_REMOVED);

        this._notify();
    }

    reorderLayers(layerOrder: Array<Container>): void {

        // remove all children
        this._activeFrame.removeChildren(0, this._activeFrame.children.length);
        this._drawLayers[this._activeFrame.label] = [];

        // add them back in the new order
        layerOrder.forEach((l, i) => {
            this._activeFrame.addChild(l);
            this._drawLayers[this._activeFrame.label].push(l);

            if (l === this._activeLayer) {
                this._activeIndex = i;
            }
        });

        this.$iApi.event.emit(Events.CANVAS_LAYER_REORDERED);

        this._notify();
    }

    setActiveFrame(frameIdx: number): void {
        if (frameIdx < 0 || frameIdx > this._frames.length - 1) {
            return;
        }

        this._activeFrame = this._frames[frameIdx];
        this._frameIndex = frameIdx;

        this._updateFrameVisibility();

        this.$iApi.event.emit(Events.CANVAS_FRAME_SELECTED);

        this.setActiveLayer(0);

        this._notify();
    }

    addFrame(): void {
        if (this._frames.length >= MAX_FRAME_COUNT) {
            return;
        }

        const newFrame = new Container({ eventMode: 'none', blendMode: 'normal', label: Utils.getRandomId() });
        this._frames.push(newFrame);

        this._pixi.stage.addChild(newFrame);

        const newFrameLayer = new Container({ eventMode: 'none', label: Utils.getRandomId() });
        newFrameLayer.filters = [new AlphaFilter({ alpha: 1 })];
        newFrame.addChild(newFrameLayer);

        this._drawLayers[newFrame.label] = [newFrameLayer];

        this.$iApi.event.emit(Events.CANVAS_FRAME_ADDED);

        // select the new layer
        this.setActiveFrame(this._frames.length - 1);
    }

    removeFrame(frameIndex: number): void {
        //TODO: delete the frame
    }

    reorderFrame(frameOrder: Array<Container>): void {
        //TODO: reorder frames
    }

    toggleOnionSkin(enabled: boolean): void {
        this._onionSkin = enabled;
        this._updateFrameVisibility();
    }

    private _updateFrameVisibility(): void {

        // turn off all frames except the active one
        this._frames.forEach((f, i) => {
            f.visible = i === this._frameIndex;
            f.alpha = 1;
        });

        if (this._frameIndex > 0 && this._onionSkin) {
            this._frames[this._frameIndex - 1].visible = true;
            this._frames[this._frameIndex - 1].alpha = 0.2;
        }
    }

    private _notify(): void {
        // render the update
        this._pixi.renderer.render(this._activeFrame);
        this.$iApi.event.emit(Events.CANVAS_UPDATE);
    }

    get drawLayers(): Array<Container> {
        return this._drawLayers[this._activeFrame.label];
    }

    get activeLayer(): Container {
        return this._activeLayer;
    }

    get activeIndex(): number {
        return this._activeIndex;
    }

    get frames(): Array<Container> {
        return this._frames;
    }

    get activeFrame(): Container {
        return this._activeFrame;
    }

    get activeFrameIndex(): number {
        return this._frameIndex;
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
