<template>
    <div class="absolute bottom-36 right-5 mb-14 z-10">
        <div class="p-5 w-1 h-1 rounded-lg" :style="{backgroundColor: currentColor?.color  || 'rgba(0,0,0,0.05)'}"></div>
    </div>
    <div class="absolute h-32 rounded bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3 bottom-10 right-0 m-5 z-10">
        <div class="grid grid-cols-5 gap-2 p-2">
            <button v-for="(item, idx) in palette" :key="idx" class="p-4 w-1 h-1 rounded-lg border-transparent border-4 hover:border-black" :style="{backgroundColor: item.color}" @click="selectColor(item)"></button>
            <button class="p-4 w-1 h-1 rounded-lg bg-slate-300">+</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { Events, InstanceAPI, PaletteItem } from '../api';

let palette = ref<Array<PaletteItem>>([]);
const currentColor = ref();
const iApi = inject<InstanceAPI>('iApi');

function selectColor(color: PaletteItem) {
    currentColor.value = color;
    iApi?.event.emit(Events.COLOR_SELECT, color);
}

onMounted(() => {
    palette.value = iApi?.palette.palette ?? [];
})
</script>
