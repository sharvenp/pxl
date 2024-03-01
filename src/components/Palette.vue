<template>
    <div class="absolute bottom-40 right-5 mb-14 z-10">
        <div :key="currentColor?.color" class="p-5 w-1 h-4 rounded-lg border-4 border-gray-200" :style="{backgroundColor: currentColor?.color  || 'rgba(0,0,0,0.05)'}"></div>
    </div>
    <div class="absolute h-32 bottom-16 right-0 m-5 z-10 rounded border bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
        <div class="grid grid-cols-5 gap-2 p-2">
            <button v-if="palette.length < MAX_PALETTE_SIZE" button class="p-1 rounded-lg border-4 hover:border-gray-300 bg-gray-50 flex items-center justify-center" @click="addColor">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            </button>
            <template v-for="item in palette">
                <button v-if="item.color !== currentColor?.color" class="p-4 w-1 h-1 rounded-lg border-gray-100 border-4 hover:border-gray-300" :style="{backgroundColor: item.color}" @click.left="selectColor(item)" @click.right="removeColor(item)"></button>
                <button v-else class="p-4 w-1 h-1 rounded-lg border-orange-200 border-4" :style="{backgroundColor: item.color}" @click.left="selectColor(item)" @click.right="removeColor(item)"></button>
            </template>
        </div>
    </div>
    <div v-if="palette.length < MAX_PALETTE_SIZE" class="absolute bottom-40 right-20 mb-14 z-10">
        <input class="w-6" type="color" v-model="lastPickerColor"/>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { Events, InstanceAPI, PaletteItem, MAX_PALETTE_SIZE } from '../api';

const iApi = inject<InstanceAPI>('iApi');
const lastPickerColor = ref<string>("#000000");
let handlers: Array<string> = [];
const palette = ref<Array<PaletteItem>>([]);
const currentColor = ref<PaletteItem>();

onMounted(() => {
    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_SELECT, (color: PaletteItem) => {
        currentColor.value = color;
    })!);

    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_ADD, () => {
        // refresh
        palette.value = [...iApi?.palette.palette] ?? [];
    })!);

    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_REMOVE, () => {
        // refresh
        palette.value = [...iApi?.palette.palette] ?? [];
    })!);

    currentColor.value = iApi?.palette.selectedColor;
    palette.value = iApi?.palette.palette ?? [];
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

function selectColor(color: PaletteItem) {
    iApi?.palette.selectColor(color);
}

function addColor() {
    let color: PaletteItem = {
        color: lastPickerColor.value
    };
    iApi?.palette.addColor(color);
}

function removeColor(color: PaletteItem) {
    iApi?.palette.removeColor(color);
}
</script>
