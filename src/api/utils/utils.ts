import { RGBAColor } from "./interfaces";

export class Utils {

    static hexToRGBA(hex: string): {
        r: number,
        g: number,
        b: number,
        a: number
    } {
        var r = parseInt(hex.slice(1, 3), 16),
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
        // TODO: make this more efficient?
        // calculate color "distance"
        let dis = Math.sqrt(
                    Math.pow(color.r - other.r, 2) +
                    Math.pow(color.g - other.g, 2) +
                    Math.pow(color.b - other.b, 2) +
                    Math.pow(color.a - other.a, 2)
                    )
        // divide by max distance
        let norm = dis / 441.67295593
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
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        if (Math.random() < solidRate) {
            color += 'FF';
        } else {
            color += letters[Math.floor(Math.random() * 16)].concat(letters[Math.floor(Math.random() * 16)]);
        }

        return color;
    }
}