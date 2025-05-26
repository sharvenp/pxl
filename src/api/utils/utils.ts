import { RGBAColor, Rectangle } from "./interfaces";

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

    static gridToRectangles(grid: Uint8ClampedArray): Array<Rectangle> {
        const width = (globalThis as any).GRID_WIDTH;
        const height = (globalThis as any).GRID_HEIGHT;
        const finalRects: Rectangle[] = [];
        type RectKey = string;
        type ActiveRect = {
            x: number;
            yStart: number;
            width: number;
            height: number;
            value: [number, number, number, number];
        };
        let activeRects: Record<RectKey, ActiveRect> = {};

        function pixelKey(offset: number): [number, number, number, number] | null {
            const r = grid[offset];
            const g = grid[offset + 1];
            const b = grid[offset + 2];
            const a = grid[offset + 3];
            if (a === 0) return null;
            return [r, g, b, a];
        }

        function makeRectKey(x: number, width: number, value: [number, number, number, number]): string {
            return `${x},${width},${value.join(",")}`;
        }

        for (let y = 0; y < height; y++) {
            const newActive: Record<RectKey, ActiveRect> = {};
            let x = 0;
            while (x < width) {
                const offset = (y * width + x) * 4;
                const key = pixelKey(offset);
                if (!key) {
                    x++;
                    continue;
                }
                const startX = x;
                while (
                    x < width &&
                    (() => {
                        const off = (y * width + x) * 4;
                        const k = pixelKey(off);
                        return k && k[0] === key[0] && k[1] === key[1] && k[2] === key[2] && k[3] === key[3];
                    })()
                ) {
                    x++;
                }
                const runWidth = x - startX;
                const rectKey = makeRectKey(startX, runWidth, key);

                if (activeRects[rectKey]) {
                    const rect = activeRects[rectKey];
                    rect.height += 1;
                    newActive[rectKey] = rect;
                } else {
                    const rect: ActiveRect = {
                        x: startX,
                        yStart: y,
                        width: runWidth,
                        height: 1,
                        value: key
                    };
                    newActive[rectKey] = rect;
                }
            }
            for (const rectKey in activeRects) {
                if (!(rectKey in newActive)) {
                    const rect = activeRects[rectKey];
                    finalRects.push({
                        x: rect.x,
                        y: rect.yStart,
                        width: rect.width,
                        height: rect.height,
                        color: {
                            r: rect.value[0],
                            g: rect.value[1],
                            b: rect.value[2],
                            a: rect.value[3]
                        }
                    });
                }
            }
            activeRects = newActive;
        }
        for (const rect of Object.values(activeRects)) {
            finalRects.push({
                x: rect.x,
                y: rect.yStart,
                width: rect.width,
                height: rect.height,
                color: {
                    r: rect.value[0],
                    g: rect.value[1],
                    b: rect.value[2],
                    a: rect.value[3]
                }
            });
        }
        return finalRects;
    }
}