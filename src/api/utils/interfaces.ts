
export interface PixelCoordinates {
    x: number;
    y: number;
}

export interface GridMouseEvent {
    coords: PixelCoordinates,
    isDragging: boolean,
    isOnCanvas: boolean
}

export interface PaletteItem {
    colorHex: string,
    colorRGBA: RGBAColor
}

export interface SelectedRegionData {
    originalCoords: PixelCoordinates;
    currentCoords: PixelCoordinates;
    lastCoords: PixelCoordinates;
    color: string;
}

export interface RGBAColor {
    r: number,
    g: number,
    b: number,
    a: number
}

export interface ToolConfiguration {
    showPreviewOnInvoke: boolean,
    invokeOnMove: boolean,
    trackPixels: boolean
}