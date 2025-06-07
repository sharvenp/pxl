import { RGBAColor, DataRectangle } from "./interfaces";

export class Utils {

    static hexToRGBA(hex: string): {
        r: number,
        g: number,
        b: number,
        a: number
    } {
        const r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16),
            a = parseInt(hex.slice(7, 9), 16);

        return { r, g, b, a }
    }

    static rgbaToHex(color: RGBAColor): string {
        let rs = color.r.toString(16);
        let gs = color.g.toString(16);
        let bs = color.b.toString(16);
        let as = color.a.toString(16);

        if (rs.length === 1)
            rs = "0" + rs;
        if (gs.length === 1)
            gs = "0" + gs;
        if (bs.length === 1)
            bs = "0" + bs;
        if (as.length === 1)
            as = "0" + as;

        return "#" + rs + gs + bs + as;

    }

    static rgbaToString(color: RGBAColor): string {
        return `${color.r}-${color.g}-${color.b}-${color.a}`;
    }

    static isSameColor(color: RGBAColor, other: RGBAColor): boolean {
        return other.r === color.r
            && other.g === color.g
            && other.b === color.b
            && other.a === color.a
    }

    static getColorSimilarity(color: RGBAColor, other: RGBAColor): number {
        // calculate color "distance"
        const dis = Math.sqrt(
            Math.pow(color.r - other.r, 2) +
            Math.pow(color.g - other.g, 2) +
            Math.pow(color.b - other.b, 2) +
            Math.pow(color.a - other.a, 2)
        )
        // divide by max distance
        const norm = dis / 441.67295593
        return norm;
    }

    static copyColor(color: RGBAColor): RGBAColor {
        return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a,
        }
    }

    static isEmptyColor(color: RGBAColor): boolean {
        return color.r + color.g + color.b + color.a === 0;
    }

    // for dummy data
    static getRandomColor(solidRate: number): string {
        const letters = '0123456789abcdef';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        if (Math.random() < solidRate) {
            color += 'ff';
        } else {
            color += letters[Math.floor(Math.random() * 16)].concat(letters[Math.floor(Math.random() * 16)]);
        }

        return color;
    }

    static getRandomId(): string {
        return Math.random().toString(16).slice(2);
    }

    static gridToRectangles(grid: Uint8ClampedArray, width: number, height: number): Array<DataRectangle> {
        const finalRects: Array<DataRectangle> = [];
        let activeRects: Record<string, {
            x: number;
            yStart: number;
            width: number;
            height: number;
            value: [number, number, number, number];
        }> = {};

        const getPixel = (x: number, y: number): [number, number, number, number] | undefined => {
            const offset = (y * width + x) * 4;
            const r = grid[offset];
            const g = grid[offset + 1];
            const b = grid[offset + 2];
            const a = grid[offset + 3];
            // skip transparent pixels
            if (a === 0) return undefined;
            return [r, g, b, a];
        }

        const makeRectKey = (x: number, width: number, value: [number, number, number, number]): string => `${x},${width},${value.join(",")}`;

        for (let y = 0; y < height; y++) {
            const newActive: any = {};
            let x = 0;

            // scan the entire row
            while (x < width) {
                const key = getPixel(x, y);

                // if the pixel is transparent, skip it and keep going right
                if (!key) {
                    x++;
                    continue;
                }

                const startX = x;

                // extend the run to the right
                while (x < width) {
                    const k = getPixel(x, y);
                    if (!(k && k[0] === key[0] && k[1] === key[1] && k[2] === key[2] && k[3] === key[3])) {
                        break;
                    }
                    x++;
                }

                // calculate the width of the run and create a rectangle key
                const runWidth = x - startX;
                const rectKey = makeRectKey(startX, runWidth, key);

                // if the rectangle already exists, extend its height
                // otherwise, create a new rectangle
                if (activeRects[rectKey]) {
                    const rect = activeRects[rectKey];
                    rect.height += 1;
                    newActive[rectKey] = rect;
                } else {
                    const rect: any = {
                        x: startX,
                        yStart: y,
                        width: runWidth,
                        height: 1,
                        value: key
                    };
                    newActive[rectKey] = rect;
                }
            }

            // iterate over all rectangles that were active in the previous row
            for (const rectKey in activeRects) {
                // if a rectangle is not continued in the current row, finalize it
                if (!(rectKey in newActive)) {
                    const rect = activeRects[rectKey];
                    // push the completed rectangle to the finalRects array
                    finalRects.push({
                        x: rect.x,
                        y: rect.yStart,
                        width: rect.width,
                        height: rect.height,
                        color: new Uint8Array([
                            rect.value[0],
                            rect.value[1],
                            rect.value[2],
                            rect.value[3]
                        ])
                    });
                }
            }
            // update activeRects to the new active rectangles
            activeRects = newActive;
        }

        // finalize any remaining rectangles in activeRects
        for (const rect of Object.values(activeRects)) {
            finalRects.push({
                x: rect.x,
                y: rect.yStart,
                width: rect.width,
                height: rect.height,
                color: new Uint8Array([
                    rect.value[0],
                    rect.value[1],
                    rect.value[2],
                    rect.value[3]
                ])
            });
        }
        return finalRects;
    }
}