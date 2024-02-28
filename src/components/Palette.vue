<template>
    <div class="absolute bottom-40 right-5 mb-14 z-10">
        <div class="p-5 w-1 h-4 rounded-lg border-4 border-gray-200" :style="{backgroundColor: currentColor?.color  || 'rgba(0,0,0,0.05)'}"></div>
    </div>
    <div class="absolute h-32 bottom-16 right-0 m-5 z-10 rounded border bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
        <div class="grid grid-cols-5 gap-2 p-2">
            <button button class="p-1 rounded-lg border-4 hover:border-gray-300 bg-gray-50 flex items-center justify-center" @click="addColor">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            </button>
            <button v-for="(item, idx) in palette" :key="idx" class="p-4 w-1 h-1 rounded-lg border-gray-100 border-4 hover:border-gray-300" :style="{backgroundColor: item.color}" @click.left="selectColor(item)" @click.right="removeColor(item)"></button>
        </div>
    </div>
    <div class="absolute bottom-40 right-20 mb-14 z-10">
        <input class="w-6" type="color" v-model="lastPickerColor"/>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { InstanceAPI, PaletteItem } from '../api';

const lastPickerColor = ref<string>("#000000");
const iApi = inject<InstanceAPI>('iApi');

const palette = computed(() => iApi?.palette.palette ?? [])
const currentColor = computed(() => iApi?.palette.selectedColor)

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
    iApi?.palette.addColor(color);
}
</script>
