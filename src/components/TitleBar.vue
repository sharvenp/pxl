<template>
    <div class="title-bar absolute w-full grid grid-rows-2 pb-1 z-20">
        <div class="mt-1 flex flex-row text-sm justify-between">
            <span class="text-sm font-bold px-2">.pxl</span>
            <div v-show="ipcSupported" class="row-span-2 flex flex-row justify-end text-sm mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction(WindowActionType.MINIMIZE)">_</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction(WindowActionType.MAXIMIZE)">O</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction(WindowActionType.CLOSE)">X</button>
            </div>
        </div>
        <div class="mt-1 flex flex-row text-sm relative">
            <div v-for="(options, menu) in menuOptions" :key="menu" class="relative mx-1" @click="openMenu(menu)">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" :id="`title-bar-${menu}`">{{ menu }}</button>
                <div v-if="activeMenu === menu" class="absolute bg-white border mt-1 shadow-md w-max rounded" :id="`title-bar-${menu}-options`">
                    <ul>
                        <li v-for="option in options.filter(o => !ipcRequired.has(o.key) || (ipcSupported && ipcRequired.has(o.key)))"
                            :key="option.key"
                            :class="`px-4 py-1 ${option.disabled() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-stone-200 cursor-pointer' }`"
                            @click="handleOption(option.key)">
                            {{ option.label }} <span v-if="option.hotkey" class=" text-xs underline">({{ option.hotkey }})</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { InstanceAPI, OrchestratorAPI } from '../api';
import { MenuOption, MenuOptionType, PanelType, WindowActionType } from '../api/utils';

const version = __APP_VERSION__;
const iApi = inject<InstanceAPI>('iApi');
const oApi = inject<OrchestratorAPI>('oApi');
const activeMenu = ref<string | undefined>(undefined);
const menuOptions = ref<Record<string, Array<MenuOption>>>({
    File: [
        { key: MenuOptionType.NEW_PROJECT, label: 'New Project', hotkey: 'Ctrl+N', disabled: () => false },
        { key: MenuOptionType.OPEN_PROJECT, label: 'Open Project', hotkey: 'Ctrl+O', disabled: () => false },
        { key: MenuOptionType.SAVE_PROJECT, label: 'Save Project', hotkey: 'Ctrl+S', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.SAVE_PROJECT_AS, label: 'Save Project As', hotkey: '', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.EXPORT, label: 'Export', hotkey: 'Ctrl+E', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.EXIT, label: 'Exit', hotkey: '', disabled: () => false }
    ],
    Edit: [
        { key: MenuOptionType.UNDO, label: 'Undo', hotkey: 'Ctrl+Z', disabled: () => iApi?.canvas?.grid.empty ?? true },
        { key: MenuOptionType.REDO, label: 'Redo', hotkey: 'Ctrl+Y', disabled: () => iApi?.history?.canRedo ?? true }
    ],
    View: [
        { key: MenuOptionType.ZOOM_IN, label: 'Zoom In', hotkey: 'Ctrl++', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.ZOOM_OUT, label: 'Zoom Out', hotkey: 'Ctrl+-', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.RESET_VIEW, label: 'Reset View', hotkey: '', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.TOGGLE_TOOLS_PANEL, label: 'Toggle Tools', hotkey: '', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.TOGGLE_PALETTE_PANEL, label: 'Toggle Palette', hotkey: '', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.TOGGLE_LAYERS_PANEL, label: 'Toggle Layers', hotkey: '', disabled: () => !iApi?.initalized },
        { key: MenuOptionType.TOGGLE_PREVIEW_PANEL, label: 'Toggle Preview', hotkey: '', disabled: () => !iApi?.initalized  },
        { key: MenuOptionType.TOGGLE_CANVAS_SETTINGS_PANEL, label: 'Toggle Canvas Settings', hotkey: '', disabled: () => !iApi?.initalized  },
        { key: MenuOptionType.TOGGLE_ANIMATOR_PANEL, label: 'Toggle Animator', hotkey: '', disabled: () => !iApi?.initalized },
    ],
    Help: [
        { key: MenuOptionType.ABOUT, label: 'About', hotkey: 'F1', disabled: () => false }
    ]
});
const ipcRequired = new Set(['exit', 'save-project']);

const ipcSupported = computed(() => {
  return oApi?.ipc?.ipcAPISupported() ?? false;
})

function openMenu(menu: string) {
    activeMenu.value = menu;
}

function handleClick(evt: MouseEvent) {

    // keep menu open if clicked inside
    let menu = document.getElementById(`title-bar-${activeMenu.value}`);
    let menuOptions = document.getElementById(`title-bar-${activeMenu.value}-options`);
    if ((menu && menu.contains(evt.target as Node)) || (menuOptions && menuOptions.contains(evt.target as Node))) {
        return;
    }

    // close menu if clicked outside
    activeMenu.value = undefined;
}

onMounted(() => {
    document.addEventListener('click', handleClick);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClick);
});

function windowAction(action: string) {
    switch (action) {
        case WindowActionType.MINIMIZE:
            // TODO
            // iApi?.minimizeWindow();
            break;
            case WindowActionType.MAXIMIZE:
            // TODO
            // iApi?.maximizeWindow();
            break;
        case WindowActionType.CLOSE:
            // TODO
            // iApi?.closeWindow();
            break;
    }
}

function handleOption(key: string) {
    // handle the selected key here
    switch (key) {
        case MenuOptionType.NEW_PROJECT:
            iApi?.notify.notify({
                title: "Create new project",
                message: "Are you sure you want to create a new project?",
                options: [
                    {
                        label: "Create",
                        callback: () => {
                            oApi?.destroyInstance();
                        }
                    }
                ],
                showCancel: true
            });
            break;
        case MenuOptionType.OPEN_PROJECT:
            iApi?.notify.notify({
                title: "Open project",
                message: "Are you sure you want to open a project?",
                options: [
                    {
                        label: "Open",
                        callback: () => {
                            oApi?.loadProject();
                        }
                    }
                ],
                showCancel: true
            });
            break;
        case MenuOptionType.SAVE_PROJECT:
            oApi?.saveProject();
            break;
        case MenuOptionType.SAVE_PROJECT_AS:
            oApi?.saveProject();
            break;
        case MenuOptionType.EXPORT:
            iApi?.canvas?.grid.exportImage();
            break;
        case MenuOptionType.EXIT:
            // TODO
            break;
        case MenuOptionType.UNDO:
            iApi?.history.undo();
            break;
        case MenuOptionType.REDO:
            iApi?.history.redo();
            break;
        case MenuOptionType.ZOOM_IN:
            iApi?.canvas?.zoomIn();
            break;
        case MenuOptionType.ZOOM_OUT:
            iApi?.canvas?.zoomOut();
            break;
        case MenuOptionType.RESET_VIEW:
            iApi?.canvas?.resetZoom();
            break;
        case MenuOptionType.TOGGLE_TOOLS_PANEL:
            iApi?.panel.toggle(PanelType.TOOLS);
            break;
        case MenuOptionType.TOGGLE_PALETTE_PANEL:
            iApi?.panel.toggle(PanelType.PALETTE);
            break;
        case MenuOptionType.TOGGLE_LAYERS_PANEL:
            iApi?.panel.toggle(PanelType.LAYERS);
            break;
        case MenuOptionType.TOGGLE_PREVIEW_PANEL:
            iApi?.panel.toggle(PanelType.PREVIEW);
            break;
        case MenuOptionType.TOGGLE_CANVAS_SETTINGS_PANEL:
            iApi?.panel.toggle(PanelType.CANVAS_SETTINGS);
            break;
        case MenuOptionType.TOGGLE_ANIMATOR_PANEL:
            iApi?.panel.toggle(PanelType.ANIMATOR);
            break;
        case MenuOptionType.ABOUT:
            iApi?.notify.notify({
                title: "About",
                message: `.pxl v${version}`,
                subtext: "Copyright (c) 2025 sharvenp",
                showCancel: true,
                cancelLabel: "Close",
            });
            break;
    }

    // close the menu
    activeMenu.value = undefined;
}
</script>