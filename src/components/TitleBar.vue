<template>
    <div class="title-bar absolute w-full grid grid-rows-2 pb-1 z-20">
        <div class="mt-1 flex flex-row text-sm justify-between">
            <span class="text-sm font-bold px-2">.pxl</span>
            <!-- TODO: only show this if in desktop mode~~~ -->
            <div class="row-span-2 flex flex-row justify-end text-sm mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">_</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">O</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">X</button>
            </div>
        </div>
        <div class="mt-1 flex flex-row text-sm relative">
            <div v-for="(options, menu) in menuOptions" :key="menu" class="relative mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu(menu)">{{ menu }}</button>
                <div v-if="activeMenu === menu" class="absolute bg-white border mt-1 shadow-md w-max">
                    <ul>
                        <li v-for="option in options" :key="option" class="px-4 py-1 hover:bg-stone-200 cursor-pointer text-xs">
                            {{ option }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { InstanceAPI } from '../api';

const iApi = inject<InstanceAPI>('iApi');
const activeMenu = ref<string | undefined>(undefined);
const menuOptions = ref({
    File: ['New Project', 'Open Project', 'Save', 'Save As', 'Exit'],
    Edit: ['Undo', 'Redo'],
    View: ['Zoom In', 'Zoom Out', 'Reset View'],
    Help: ['About']
});

function openMenu(menu: string) {
    activeMenu.value = activeMenu.value === menu ? undefined : menu;
}
</script>