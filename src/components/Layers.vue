<template>
    <div class="canvas-layers absolute border bg-white m-5 flex flex-col p-1 z-10">
        <div class="flex flex-col text-xs h-72 overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
            <div v-for="(layer, i) in layers" :key="i" :class="`flex flex-row border m-1 p-1 ${selectedIdx === i ? 'bg-stone-100' : ''}`">
                <div class="flex flex-row items-center">
                    <input type="checkbox" class="ms-1 me-2" v-model="layer.visible">
                    <canvas width="30" height="30" class="border bg-white" v-on:dblclick="selectLayer(i)"></canvas>
                    <span class="ml-2">Layer {{ i + 1 }}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="canvas-layers-actions absolute border bg-white m-5 flex flex-col z-10">
        <div class="flex flex-row justify-around p-1">
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT" @click="toggleAll(true)">👁️</button>
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT" @click="toggleAll(false)">👀</button>
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT" @click="addLayer">➕</button>
            <button class="p-1 border text-xs" :disabled="layers.length  <= 1" @click="removeLayer">🗑️</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, MAX_LAYER_COUNT } from '../api/utils';
import { Container } from 'pixi.js';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let selectedIdx = ref<number>(0);
let layers = ref<Array<Container>>([]);

onMounted(() => {
    handlers.push(iApi?.event.on(Events.CANVAS_LAYER_SELECTED, () => {
        selectedIdx.value = iApi?.canvas.grid?.activeIndex!;
    })!);

    handlers.push(iApi?.event.on(Events.CANVAS_LAYER_ADDED, () => {
        updateLayerList();
    })!);

    handlers.push(iApi?.event.on(Events.CANVAS_LAYER_REMOVED, () => {
        updateLayerList();
    })!);

    handlers.push(iApi?.event.on(Events.CANVAS_INITIALIZED, () => {
        updateLayerList();
    })!);

    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, () => {
        // todo: update active layer canvas
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

function updateLayerList() {
    layers.value = [...iApi?.canvas.grid?.drawLayers!];
}

function selectLayer(layerIdx: number) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.setActiveLayer(layerIdx);
    }
}

function addLayer() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.addLayer();
    }
}

function removeLayer() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.removeLayer();
    }
}

function toggleAll(value: boolean) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        layers.value.forEach(layer => {
            layer.visible = value;
        })
    }
}

</script>
