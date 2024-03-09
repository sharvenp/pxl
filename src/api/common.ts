
import type { InstanceAPI, RGBAColor } from '.';

export class APIScope {
    readonly $iApi: InstanceAPI;

    constructor(iApi: InstanceAPI) {
        this.$iApi = iApi;
    }
}

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

        if (rs.length == 1)
            rs = "0" + rs;
        if (gs.length == 1)
            gs = "0" + gs;
        if (bs.length == 1)
            bs = "0" + bs;
        if (as.length == 1)
            as = "0" + as;

        return "#" + rs + gs + bs + as;

    }

    // for dummy data
    static getRandomColor(): string {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 8; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}