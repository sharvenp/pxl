<template>
    <div class="absolute bottom-40 right-5 mb-14 z-10">
        <div class="p-5 w-1 h-4 rounded-lg border-4 border-gray-200" :style="{backgroundColor: currentColor?.color  || 'rgba(0,0,0,0.05)'}"></div>
    </div>
    <div :key="pickerKey" class="absolute h-32 bottom-16 right-0 m-5 z-10 rounded border bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
        <div class="grid grid-cols-5 gap-2 p-2">
            <button button class="p-1 rounded-lg border-4 hover:border-gray-300 bg-gray-50 flex items-center justify-center" @click="addColor">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            </button>
            <button v-for="(item, idx) in palette" :key="idx" class="p-4 w-1 h-1 rounded-lg border-gray-100 border-4 hover:border-gray-300" :style="{backgroundColor: item.color}" @click="selectColor(item)"></button>
        </div>
    </div>
    <div class="absolute bottom-40 right-20 mb-14 z-10">
        <input class="w-6" type="color" v-model="lastPickerColor"/>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { Events, InstanceAPI, PaletteItem } from '../api';

const currentColor = ref();
const lastPickerColor = ref<string>("#000000");
const pickerKey = ref(0);
const iApi = inject<InstanceAPI>('iApi');

function selectColor(color: PaletteItem) {
    currentColor.value = color;
    iApi?.event.emit(Events.PALETTE_COLOR_SELECT, color);
}

function addColor() {
    let color: PaletteItem = {
        color: lastPickerColor.value
    };
    iApi?.event.emit(Events.PALETTE_COLOR_ADD, color);
    pickerKey.value += 1 % 2;
}

const palette = computed(() => iApi?.palette.palette ?? [])
</script>
