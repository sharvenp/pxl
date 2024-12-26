import { Application, Container, Graphics, Rectangle, RenderTexture, RgbaArray } from 'pixi.js';
import { APIScope, InstanceAPI } from '.';
import { Events, PixelCoordinates, RGBAColor, Utils } from './utils';

export class GridAPI extends APIScope {

    // private _color: RGBAColor | undefined;
    private _pixi: Application;

    private _drawContainer: Container;
    private _drawLayer: Container;

    constructor(iApi: InstanceAPI, pixi: Application) {
        super(iApi);

        this._pixi = pixi;

        this._drawContainer = new Container({eventMode: 'none'});
        this._drawLayer = new Container({eventMode: 'none'});

        this._pixi.stage.addChild(this._drawContainer);
        this._drawContainer.addChild(this._drawLayer);

        this.initialize();
    }

    initialize(): void {
    }

    destroy(): void {
    }

    clear(): void {
    }

    draw(graphic: Graphics): void {
        this._drawLayer.addChild(graphic);
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
            target: this._drawContainer,
            antialias: false,
            frame: new Rectangle(coords.x, coords.y, width, height),
            resolution: 1
        });

        let data: Array<[PixelCoordinates, RGBAColor]> = [];

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const idx = (y * height + x) * 4;

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
                    c = {
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 0
                    }
                }

                data.push([{x: coords.x + x, y: coords.y + y }, c]);
            }
        }

        return data;
    }

    get drawLayer(): Container {
        return this._drawLayer;
    }

    // rect(): void {
    //     // this._drawDataRect(topLeft, width, height, fill)
    //     // console.log('rect', topLeft);

    //     // this._notify();
    // }

    // ellipse(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {
    //     this._drawDataEllipse(topLeft, width, height, fill)
    //     this._notify();
    // }

    // line(start: PixelCoordinates, end: PixelCoordinates, width: number): void {
    //     this._drawDataLine(start, end, width)
    //     this._notify();
    // }

    // floodFill(coords: PixelCoordinates, tolerance: number): void {
    //     this._dataFloodFill(coords, tolerance);
    //     this._notify();
    // }

    // getDataRect(topLeft: PixelCoordinates, width: number, height: number): Array<[PixelCoordinates, RGBAColor]> {
    //     if (!this._preserveData) {
    //         throw new Error("attempted to get data from grid with preserveData set to false");
    //     }

    //     // top left coords
    //     let tx = Math.max(topLeft.x, 0);
    //     let ty = Math.max(topLeft.y, 0);

    //     if (topLeft.x < 0) {
    //         width = width + topLeft.x;
    //     }
    //     if (topLeft.y < 0) {
    //         height = height + topLeft.y;
    //     }

    //     let data: Array<[PixelCoordinates, RGBAColor]> = [];

    //     // bottom right corner x and y
    //     let bx = Math.min(tx + width, this.pixelWidth);
    //     let by = Math.min(ty + height, this.pixelHeight);

    //     // get all pixels
    //     for (let x = tx; x < bx; x++) {
    //         for (let y = ty; y < by; y++) {
    //             let coords = {x, y};
    //             let idx = this._flattenCoords(coords);
    //             data.push([coords, {
    //                 r: this._data[idx],
    //                 g: this._data[idx + 1],
    //                 b: this._data[idx + 2],
    //                 a: this._data[idx + 3]
    //             }]);
    //         }
    //     }

    //     return data;
    // }

    // toPixelCoords(coords: CanvasCoordinates): PixelCoordinates {
    //     return {
    //         x: Math.floor(coords.x / (this._widthRatio * 1.0)),
    //         y: Math.floor(coords.y / (this._heightRatio * 1.0))
    //     }
    // }

    // toCanvasCoords(coords: PixelCoordinates): CanvasCoordinates {
    //     return {
    //         x: coords.x * this._widthRatio,
    //         y: coords.y * this._heightRatio
    //     }
    // }

    // private _drawDataRect(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {

    //     // top left coords
    //     let tx = topLeft.x;
    //     let ty = topLeft.y;

    //     // bottom right corner x and y
    //     let bx = tx + width;
    //     let by = ty + height;

    //     if (fill) {
    //         // fill all pixels
    //         for (let x = tx; x < bx; x++) {
    //             for (let y = ty; y < by; y++) {
    //                 // draw
    //                 this._setData({x, y});
    //             }
    //         }
    //     } else {
    //         // draw only perimeter
    //         for (let x = tx; x < bx; x++) {
    //             // draw horizontal sides
    //             this._setData({x, y: ty});
    //             this._setData({x, y: by - 1});
    //         }
    //         for (let y = ty + 1; y < by - 1; y++) {
    //             // draw vertical sides
    //             this._setData({x: tx, y});
    //             this._setData({x: bx - 1, y});
    //         }
    //     }
    // }

    // private _drawDataEllipse(topLeft: PixelCoordinates, width: number, height: number, fill: boolean = true): void {

    //     // use Midpoint ellipse algorithm
    //     // https://en.wikipedia.org/wiki/Midpoint_circle_algorithm

    //     // top left coords
    //     let tx = topLeft.x;
    //     let ty = topLeft.y;

    //     if (topLeft.x < 0) {
    //         width = width + topLeft.x;
    //     }
    //     if (topLeft.y < 0) {
    //         height = height + topLeft.y;
    //     }

    //     // handle base-cases quickly
    //     if (width === 1 && height === 1) {
    //         // if it is just a point, draw point and return
    //         this._setData({x: tx, y: ty});
    //         return;
    //     } else if (width === 2 && height === 2) {
    //         // if it is 2x2, then draw rect
    //         this._setData({x: tx, y: ty});
    //         this._setData({x: tx + 1, y: ty});
    //         this._setData({x: tx, y: ty + 1});
    //         this._setData({x: tx + 1, y: ty + 1});
    //         return;
    //     }

    //     // offsets for even width or height
    //     let ewo = (width + 1) % 2;
    //     let eho = (height + 1) % 2;

    //     // semi major and minor axes
    //     let rx = Math.round(width / 2.0) - (width % 2);
    //     let ry = Math.round(height / 2.0) - (height % 2);

    //     // center coord
    //     let xc = tx + rx;
    //     let yc = ty + ry;

    //     // init x and y, we use this to progressively draw the ellipse
    //     let x = 0;
    //     let y = ry;

    //     // decision parameters for region 1 of ellipse
    //     let d1 = ((ry * ry) - (rx * rx * ry) + (0.25 * rx * rx));
    //     let dx = 2 * ry * ry * x;
    //     let dy = 2 * rx * rx * y;

    //     // what follows is some number magic and idk how any of this works

    //     // draw region 1
    //     while (dx < dy) {

    //         // set points based 4 point symmetry
    //         // check if x is 0 to avoid duplication
    //         if (x === 0) {
    //             if (ewo !== 1) {
    //                 this._setData({x: x + xc - ewo, y: y + yc - eho});
    //                 this._setData({x: -x + xc, y: -y + yc});
    //             }
    //         } else {
    //             this._setData({x: x + xc - ewo, y: y + yc - eho});
    //             this._setData({x: -x + xc, y: y + yc - eho});
    //             this._setData({x: x + xc - ewo, y: -y + yc});
    //             this._setData({x: -x + xc, y: -y + yc});
    //         }

    //         if (fill) {
    //             // draw vertical scanlines
    //             for (let i = -y + yc + 1; i < y + yc - eho; i++) {

    //                 if (x === 0 && ewo === 1) continue;

    //                 this._setData({x: x + xc - ewo, y: i});

    //                 if (x !== 0) {
    //                     this._setData({x: -x + xc,  y: i});
    //                 }
    //             }
    //         }

    //         // update decision parameter
    //         if (d1 < 0) {
    //             x += 1;
    //             dx = dx + (2 * ry * ry);
    //             d1 = d1 + dx + (ry * ry);
    //         } else {
    //             x += 1;
    //             y -= 1;
    //             dx = dx + (2 * ry * ry);
    //             dy = dy - (2 * rx * rx);
    //             d1 = d1 + dx - dy + (ry * ry);
    //         }
    //     }

    //     // keep track of last x, we need this when drawing the horizontal scanlines
    //     let lx = x;

    //     // decision parameters for region 1
    //     let d2 = (((ry * ry) * ((x + 0.5) * (x + 0.5))) + ((rx * rx) * ((y - 1) * (y - 1))) - (rx * rx * ry * ry));

    //     // draw region 2
    //     while (y >= 0) {

    //         // set points based 4 point symmetry
    //         if (y === 0) {
    //             if (eho !== 1) {
    //                 this._setData({x: x + xc - ewo, y: y + yc - eho});
    //                 this._setData({x: -x + xc, y: -y + yc});
    //             }
    //         } else {
    //             this._setData({x: x + xc - ewo, y: y + yc - eho});
    //             this._setData({x: -x + xc, y: y + yc - eho});
    //             this._setData({x: x + xc - ewo, y: -y + yc});
    //             this._setData({x: -x + xc, y: -y + yc});
    //         }

    //         if (fill) {
    //             // draw horizontal scanlines
    //             let j = 0;
    //             for (let i = -x + xc + 1; i < -lx + xc + 1; i++) {

    //                 if (y === 0 && eho === 1) continue;

    //                 this._setData({x: x + xc - j - 1 - ewo, y: y + yc - eho});
    //                 this._setData({x: i, y: y + yc - eho});

    //                 if (y !== 0) {
    //                     this._setData({x: i, y: -y + yc});
    //                     this._setData({x: x + xc - j - 1 - ewo, y: -y + yc});
    //                 }

    //                 j++;
    //             }
    //         }

    //         // update decision parameter
    //         if (d2 > 0) {
    //             y -= 1;
    //             dy = dy - (2 * rx * rx);
    //             d2 = d2 + (rx * rx) - dy;
    //         } else {
    //             y -= 1;
    //             x += 1;
    //             dx = dx + (2 * ry * ry);
    //             dy = dy - (2 * rx * rx);
    //             d2 = d2 + dx - dy + (rx * rx);
    //         }
    //     }
    // }

    // private _drawDataLine(start: PixelCoordinates, end: PixelCoordinates, width: number): void {

    //     // use Bresenham's line algorithm with anti-aliasing (it's magic)
    //     // https://gist.github.com/randvoorhies/807ce6e20840ab5314eb7c547899de68

    //     let x0 = Math.max(start.x, 0);
    //     let y0 = Math.max(start.y, 0);

    //     let x1 = Math.max(end.x, 0);
    //     let y1 = Math.max(end.y, 0);

    //     let dx =  Math.abs(x1 - x0);
    //     let sx = x0 < x1 ? 1 : -1;
    //     let dy = -Math.abs(y1 - y0);
    //     let sy = y0 < y1 ? 1 : -1;
    //     let err = dx + dy
    //     let e2;

    //     while(true) {
    //         this._setData({x: x0, y: y0});
    //         // repeat the line above and below based on the width
    //         let alt = -1;
    //         let x_o = 0;
    //         let y_o = 0;
    //         for (let i = 1; i < width; i++) {
    //             if (dx < -dy) {
    //                 x_o = alt * Math.floor((i + 1) / 2);
    //             } else if (-dy <= dx) {
    //                 y_o = alt * Math.floor((i + 1) / 2);
    //             }
    //             this._setData({x: x0 + x_o, y: y0 + y_o});
    //             alt = -alt;
    //         }

    //         if (x0 === x1 && y0 === y1) {
    //             break;
    //         }

    //         e2 = 2*err;

    //         if (e2 >= dy) {
    //             err += dy;
    //             x0 += sx;
    //         }

    //         if (e2 <= dx) {
    //             err += dx;
    //             y0 += sy;
    //         }
    //     }
    // }

    floodFill(graphic: Graphics, coords: PixelCoordinates, tolerance: number): void {

        const pixelData = this._pixi.renderer.extract.pixels({
            target: this._drawContainer,
            antialias: false,
            frame: new Rectangle(0, 0, this.width, this.height),
            resolution: 1
        });

        let validCoords = (c: PixelCoordinates) => (c.x >= 0 && c.x < this.width && c.y >= 0 && c.y < this.height);
        let getPixelRGBA = (c: PixelCoordinates): RGBAColor => {
            const idx = (c.y * this.height + c.x) * 4;
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

        while(fillStack.length > 0) {

            let {x, y} = fillStack.pop()!;
            let currCellColor = getPixelRGBA({x, y});

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

            if (validCoords({x, y: y + 1})) {
                fillStack.push({x, y: y + 1});
            }
            if (validCoords({x, y: y - 1})) {
                fillStack.push({x, y: y - 1});
            }
            if (validCoords({x: x + 1, y})) {
                fillStack.push({x: x + 1, y});
            }
            if (validCoords({x: x - 1, y})) {
                fillStack.push({x: x - 1, y});
            }
        }

        this.draw(graphic);
    }

    // _setData(coords: PixelCoordinates, color: RGBAColor | undefined = undefined, overwrite: boolean = false): void {

    //     let colorToApply = color ?? this._color;

    //     // keep track of all coords to draw on
    //     // add more coords based on mirror reflection
    //     let coordsToDraw: Array<PixelCoordinates> = [coords];
    //     if (this.$iApi.tool.selectedTool?.canMirror) {
    //         if (this.$iApi.settings.mirrorX) {
    //             // reflect coords along x-axis
    //             coordsToDraw.push({x: this.pixelWidth - 1 - coords.x, y : coords.y});
    //         }

    //         if (this.$iApi.settings.mirrorY) {
    //             // reflect all coords along y-axis (including previously x-axis reflected coords)
    //             let reflectedCoords: Array<PixelCoordinates> = coordsToDraw.map(c => ({x: c.x, y: this.pixelHeight - 1 - c.y}));
    //             coordsToDraw.push(...reflectedCoords);
    //         }
    //     }

    //     // for each coord, draw pixel
    //     coordsToDraw.forEach(coord => {

    //         let idx = this._flattenCoords(coord);
    //         let canvasCoords = this.toCanvasCoords(coord);

    //         if (colorToApply) {

    //             if (this._preserveData) {

    //                 // calculate resulting color with blending formula

    //                 let a0 = colorToApply.a / 255.0;
    //                 let a1 = this._data[idx + 3] / 255.0;
    //                 let r0 = colorToApply.r;
    //                 let r1 = this._data[idx];
    //                 let g0 = colorToApply.g;
    //                 let g1 = this._data[idx + 1];
    //                 let b0 = colorToApply.b;
    //                 let b1 = this._data[idx + 2];

    //                 let aa = (1 - a0) * a1 + a0;
    //                 let rr = ((1 - a0) * a1 * r1 + a0 * r0) / aa;
    //                 let gg = ((1 - a0) * a1 * g1 + a0 * g0) / aa;
    //                 let bb = ((1 - a0) * a1 * b1 + a0 * b0) / aa;

    //                 if (overwrite) {
    //                     rr = r0;
    //                     gg = g0;
    //                     bb = b0;
    //                     aa = a0;
    //                 }

    //                 let dataColor: RGBAColor = {
    //                     r: Math.round(rr),
    //                     g: Math.round(gg),
    //                     b: Math.round(bb),
    //                     a: Math.round(aa * 255)
    //                 };

    //                 this._data[idx] = dataColor.r;
    //                 this._data[idx + 1] = dataColor.g;
    //                 this._data[idx + 2] = dataColor.b;
    //                 this._data[idx + 3] = dataColor.a;

    //                 // set color to canvas
    //                 this._ctx.fillStyle = Utils.rgbaToHex(dataColor);
    //                 this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);

    //             } else {
    //                 // set color to canvas using current color
    //                 this._ctx.fillStyle = Utils.rgbaToHex(colorToApply);
    //                 this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);
    //             }

    //         } else {

    //             if (this._preserveData) {
    //                 this._data[idx] = 0;
    //                 this._data[idx + 1] = 0;
    //                 this._data[idx + 2] = 0;
    //                 this._data[idx + 3] = 0;
    //             }

    //             // clear canvas
    //             this._ctx.clearRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);
    //         }
    //     });
    // }

    // private _refreshCanvas(): void {
    //     // clear the canvas and draw it again

    //     this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

    //     for (let x = 0; x < this._pixelWidth; x++) {
    //         for (let y = 0; y < this._pixelHeight; y++) {
    //             let idx = this._flattenCoords({x, y});
    //             let canvasCoords = this.toCanvasCoords({x, y});
    //             let dataColor: RGBAColor = {
    //                 r: this._data[idx],
    //                 g: this._data[idx + 1],
    //                 b: this._data[idx + 2],
    //                 a: this._data[idx + 3]
    //             };

    //             this._ctx.fillStyle = Utils.rgbaToHex(dataColor);
    //             this._ctx.fillRect(canvasCoords.x, canvasCoords.y, this._widthRatio, this._heightRatio);
    //         }
    //     }
    // }

    // private _flattenCoords(coords: PixelCoordinates): number {
    //     // flatten coordinates with offset of 4 [r,g,b,a]
    //     return (coords.y * this.pixelHeight + coords.x) * 4;
    // }

    // private _notify(): void {
    //     this._touched = true;
    //     if (this._notifyCanvas) {
    //         this.$iApi.event.emit(Events.CANVAS_UPDATE);
    //     }
    // }

    // coordsInBounds(coords: PixelCoordinates): boolean {
    //     return (coords.x >= 0 && coords.x < this.pixelWidth) && (coords.y >= 0 && coords.y < this.pixelHeight);
    // }

    // get widthRatio(): number {
    //     return this._widthRatio;
    // }

    // get heightRatio(): number {
    //     return this._heightRatio;
    // }

    get width(): number {
        return this._pixi.canvas.width;
    }

    get height(): number {
        return this._pixi.canvas.height;
    }

    // get canvasWidth(): number {
    //     return this._canvasWidth;
    // }

    // get canvasHeight(): number {
    //     return this._canvasHeight;
    // }

    // get ctx(): CanvasRenderingContext2D {
    //     return this._ctx;
    // }

    // get data(): Uint8ClampedArray {
    //     return this._data;
    // }

    // get color(): RGBAColor | undefined {
    //     return this._color;
    // }

    // set color(newColor: RGBAColor | undefined) {
    //     this._color = newColor;
    // }
}
