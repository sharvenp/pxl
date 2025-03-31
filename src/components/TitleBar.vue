<template>
    <div class="title-bar absolute w-full grid grid-rows-2 pb-1 z-20">
        <div class="mt-1 flex flex-row text-sm justify-between">
            <span class="text-sm font-bold px-2">.pxl</span>
            <div v-show="ipcSupported" class="row-span-2 flex flex-row justify-end text-sm mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('minimize')">_</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('maximize-restore')">O</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('close')">X</button>
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
import { InstanceAPI } from '../api';
import { MenuOption } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const activeMenu = ref<string | undefined>(undefined);
const menuOptions = ref<Record<string, MenuOption[]>>({
    File: [
        { key: 'new-project', label: 'New Project', hotkey: 'Ctrl+N', disabled: () => false },
        { key: 'open-project', label: 'Open Project', hotkey: 'Ctrl+O', disabled: () => false },
        { key: 'save-project', label: 'Save Project', hotkey: 'Ctrl+S', disabled: () => false },
        { key: 'save-project-as', label: 'Save Project As', hotkey: '', disabled: () => false },
        { key: 'export', label: 'Export', hotkey: 'Ctrl+E', disabled: () => false },
        { key: 'exit', label: 'Exit', hotkey: '', disabled: () => false }
    ],
    Edit: [
        { key: 'undo', label: 'Undo', hotkey: 'Ctrl+Z', disabled: () => iApi?.canvas.grid?.empty ?? true },
        { key: 'redo', label: 'Redo', hotkey: 'Ctrl+Y', disabled: () => !iApi?.history.canRedo }
    ],
    View: [
        { key: 'zoom-in', label: 'Zoom In', hotkey: 'Ctrl++', disabled: () => false },
        { key: 'zoom-out', label: 'Zoom Out', hotkey: 'Ctrl+-', disabled: () => false },
        { key: 'reset-view', label: 'Reset View', hotkey: '', disabled: () => false }
    ],
    Help: [
        { key: 'about', label: 'About', hotkey: 'F1', disabled: () => false }
    ]
});
const ipcRequired = new Set(['exit']);

const ipcSupported = computed(() => {
  return iApi?.ipc.ipcAPISupported() ?? false;
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
        case 'minimize':
            // iApi?.minimizeWindow();
            break;
        case 'maximize-restore':
            // iApi?.maximizeWindow();
            break;
        case 'close':
            // iApi?.closeWindow();
            break;
    }
}

function handleOption(key: string) {
    // handle the selected key here
    switch (key) {
        case 'new-project':
            // TODO
            break;
        case 'open-project':
            // TODO
            break;
        case 'save':
            // TODO
            break;
        case 'save-as':
            // TODO
            break;
        case 'exit':
            // TODO
            break;
        case 'undo':
            iApi?.history.undo();
            break;
        case 'redo':
            iApi?.history.redo();
            break;
        case 'zoom-in':
            // TODO
            break;
        case 'zoom-out':
            // TODO
            break;
        case 'reset-view':
            // TODO
            break;
        case 'about':
            // TODO
            break;
    }

    // close the menu
    activeMenu.value = undefined;
}
</script>