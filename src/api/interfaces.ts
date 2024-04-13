
export interface CanvasCoordinates {
    x: number;
    y: number;
}

export interface PixelCoordinates {
    x: number;
    y: number;
}

export interface Coordinates {
    canvas: CanvasCoordinates,
    pixel: PixelCoordinates
}

export interface GridMouseEvent {
    coords: Coordinates,
    isDragging: boolean
}

export interface PaletteItem {
    colorHex: string,
    colorRGBA: RGBAColor
}

export interface RGBAColor {
    r: number,
    g: number,
    b: number,
    a: number
}