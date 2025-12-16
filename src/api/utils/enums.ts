
export enum Events {
    APP_INITIALIZED = "app_initialized",
    APP_DESTROYED = "app_destroyed",
    MOUSE_MOVE = "canvas_mouse_move",
    MOUSE_DRAG_START = "canvas_mouse_drag_start",
    MOUSE_DRAG_STOP = "canvas_mouse_drag_stop",
    CANVAS_MOUSE_ENTER = "canvas_mouse_enter",
    CANVAS_MOUSE_LEAVE = "canvas_mouse_leave",
    CANVAS_UPDATE = "canvas_update",
    CANVAS_LAYER_ADDED = "canvas_layer_added",
    CANVAS_LAYER_REMOVED = "canvas_layer_removed",
    CANVAS_LAYER_SELECTED = "canvas_layer_selected",
    CANVAS_LAYER_REORDERED = "canvas_layer_reordered",
    CANVAS_FRAME_ADDED = "canvas_frame_added",
    CANVAS_FRAME_REMOVED = "canvas_frame_removed",
    CANVAS_FRAME_SELECTED = "canvas_frame_selected",
    CANVAS_FRAME_REORDERED = "canvas_frame_reordered",
    CANVAS_FRAME_DUPLICATED = "canvas_frame_duplicated",
    TOOL_SELECT = "tool_select",
    TOOL_ALT_MODE_UPDATE = "tool_alt_mode_update",
    PALETTE_COLOR_SELECT = "palette_color_select",
    PALETTE_COLOR_ADD = "palette_color_add",
    PALETTE_COLOR_REMOVE = "palette_color_remove",
    SELECT_TOOL_RESET = "select_tool_reset",
    CLONE_TOOL_RESET = "clone_tool_reset",
    UNDO = "undo",
    REDO = "redo",
    NOTIFY_SHOW = "notify_show",
}

export enum PanelType {
    TOOLS = "tools",
    PALETTE = "palette",
    LAYERS = "layers",
    PREVIEW = "preview",
    ANIMATOR = "animator",
    CANVAS_SETTINGS = "canvas_settings",
}

export enum MenuOptionType {
    NEW_PROJECT = "new_project",
    OPEN_PROJECT = "open_project",
    SAVE_PROJECT = "save_project",
    SAVE_PROJECT_AS = "save_project_as",
    EXPORT = "export",
    EXPORT_FRAMES = "export_frames",
    EXIT = "exit",
    UNDO = "undo",
    REDO = "redo",
    ZOOM_IN = "zoom_in",
    ZOOM_OUT = "zoom_out",
    RESET_VIEW = "reset_view",
    TOGGLE_TOOLS_PANEL = "toggle_tools",
    TOGGLE_PALETTE_PANEL = "toggle_palette",
    TOGGLE_LAYERS_PANEL = "toggle_layers",
    TOGGLE_PREVIEW_PANEL = "toggle_preview",
    TOGGLE_CANVAS_SETTINGS_PANEL = "toggle_canvas_settings",
    TOGGLE_ANIMATOR_PANEL = "toggle_animator",
    ABOUT = "about"
}

export enum WindowActionType {
    MINIMIZE = "minimize",
    MAXIMIZE = "maximize",
    CLOSE = "close"
}


export enum ShadeMode {
    LIGHTEN = "Lighten",
    DARKEN = "Darken"
}

export enum ToolPropertyType {
    SLIDER = "slider",
    CHECK_BOX = "check_box",
    RADIO = 'radio',
    BUTTON = 'button'
}

export enum ToolType {
    PENCIL = "Pencil",
    ERASER = "Eraser",
    PICKER = "Picker",
    FILL = "Fill",
    RECTANGLE = "Rectangle",
    ELLIPSE = "Ellipse",
    LINE = "Line",
    SHADE = "Shade",
    SELECT = "Select",
    CLONE = "Clone",
}

export enum KeyAction {
    DOWN = 'down',
    UP = 'up'
}

export enum PxlGraphicMethodType {
    RECT = 'rect',
    ELLIPSE = 'ellipse',
    MOVE_TO = 'moveTo',
    LINE_TO = 'lineTo',
    STROKE = 'stroke',
    FILL = 'fill'
}

export enum PxlSpecialGraphicType {
    FROM_LOAD_STATE = 'from_load_state',
    FROM_CLONE = 'from_clone',
}

export enum LayerFilterType {
    ALPHA = 'alpha'
}

export enum UITheme {
    LIGHT = 'light',
    DARK = 'dark'
}

export enum Key {
    SHIFT = 'SHIFT',
    CONTROL = 'CONTROL',
    ALT = 'ALT',
    DIGIT_0 = '0',
    DIGIT_1 = '1',
    DIGIT_2 = '2',
    DIGIT_3 = '3',
    DIGIT_4 = '4',
    DIGIT_5 = '5',
    DIGIT_6 = '6',
    DIGIT_7 = '7',
    DIGIT_8 = '8',
    DIGIT_9 = '9',
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H',
    I = 'I',
    J = 'J',
    K = 'K',
    L = 'L',
    M = 'M',
    N = 'N',
    O = 'O',
    P = 'P',
    Q = 'Q',
    R = 'R',
    S = 'S',
    T = 'T',
    U = 'U',
    V = 'V',
    W = 'W',
    X = 'X',
    Y = 'Y',
    Z = 'Z',
    F1 = 'F1',
    F2 = 'F2',
    F3 = 'F3',
    F4 = 'F4',
    F5 = 'F5',
    F6 = 'F6',
    F7 = 'F7',
    F8 = 'F8',
    F9 = 'F9',
    F10 = 'F10',
    F11 = 'F11',
    F12 = 'F12',
    PLUS = '+',
    MINUS = '-',
    EQUAL = '=',
    BACKQUOTE = '`'
}