<template>
    <div class="title-bar absolute w-full grid grid-rows-2 pb-1 z-20">
        <div class="mt-1 flex flex-row text-sm justify-between">
            <span class="text-sm font-bold px-2">.pxl</span>
            <!-- TODO: only show this if in desktop mode~~~ -->
            <div v-show="ipcSupported" class="row-span-2 flex flex-row justify-end text-sm mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('minimize')">_</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('maximize-restore')">O</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="windowAction('close')">X</button>
            </div>
        </div>
        <div class="mt-1 flex flex-row text-sm relative">
            <div v-for="(options, menu) in menuOptions" :key="menu" class="relative mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu(menu)" @blur="closeMenu()">{{ menu }}</button>
                <div v-if="activeMenu === menu" class="absolute bg-white border mt-1 shadow-md w-max">
                    <ul>
                        <li v-for="option in options.filter(o => (ipcSupported && o.ipcRequired) || !o.ipcRequired)" :key="option.key" class="px-4 py-1 hover:bg-stone-200 cursor-pointer" @click="handleOption(option.key)">
                            {{ option.text }} <span v-if="option.hotkey" class="text-gray-500 text-xs underline">({{ option.hotkey }})</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { InstanceAPI } from '../api';

const iApi = inject<InstanceAPI>('iApi');
const activeMenu = ref<string | undefined>(undefined);
const menuOptions = ref({
    File: [
        { key: 'new-project', text: 'New Project', hotkey: '', ipcRequired: false },
        { key: 'open-project', text: 'Open Project', hotkey: '', ipcRequired: false },
        { key: 'save', text: 'Save', hotkey: 'Ctrl+S', ipcRequired: false },
        { key: 'save-as', text: 'Save As', hotkey: 'Ctrl+Shift+S', ipcRequired: false },
        { key: 'exit', text: 'Exit', hotkey: '', ipcRequired: true }
    ],
    Edit: [
        { key: 'undo', text: 'Undo', hotkey: 'Ctrl+Z', ipcRequired: false },
        { key: 'redo', text: 'Redo', hotkey: 'Ctrl+Y', ipcRequired: false }
    ],
    View: [
        { key: 'zoom-in', text: 'Zoom In', hotkey: 'Ctrl++', ipcRequired: false },
        { key: 'zoom-out', text: 'Zoom Out', hotkey: 'Ctrl+-', ipcRequired: false },
        { key: 'reset-view', text: 'Reset View', hotkey: '', ipcRequired: false }
    ],
    Help: [
        { key: 'about', text: 'About', hotkey: 'F1', ipcRequired: false }
    ]
});

const ipcSupported = computed(() => {
  return iApi?.ipc.ipcAPISupported() ?? false;
})

function openMenu(menu: string) {
    activeMenu.value = activeMenu.value === menu ? undefined : menu;
}

function closeMenu() {
    activeMenu.value = undefined;
}

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
    console.log(key)
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
}
</script>