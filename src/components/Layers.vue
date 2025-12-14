<template>
    <div v-show="visible" class="canvas-layers absolute border bg-white m-5 flex flex-col p-1 z-10">
        <div
            class="flex flex-col text-xs overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
            <draggable class="w-full" :list="layers" @change="syncOrder">
                <div v-for="(layer, i) in layers" :key="i"
                    :class="`flex flex-row border m-1 p-1 ${layer.label === selectedId ? 'bg-stone-100 border-orange-200' : ''}`">
                    <div class="flex flex-row items-center" v-on:dblclick="selectLayer(i)">
                        <input type="checkbox" class="ms-1 me-2" v-model="layer.visible"
                            @change="notifyVisibilityChange()">
                        <canvas :id="layer.label" width="30" height="30" class="border bg-white"></canvas>
                        <span class="ml-2">Layer {{ i + 1 }}</span>
                        <!-- <span class="ml-2">{{ layer.label }}</span> -->
                    </div>
                </div>
            </draggable>
        </div>
    </div>
    <div v-show="visible" class="canvas-layers-actions absolute border bg-white m-5 flex flex-col z-10">
        <div class="flex flex-row justify-around p-1">
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT"
                @click="toggleAll(true)">👁️</button>
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT"
                @click="toggleAll(false)">👀</button>
            <button class="p-1 border text-xs" :disabled="layers.length >= MAX_LAYER_COUNT" @click="addLayer">➕</button>
            <button class="p-1 border text-xs" :disabled="layers.length <= 1" @click="removeLayer">🗑️</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted, nextTick, computed } from 'vue'
import { InstanceAPI } from '../api';
import { Events, MAX_LAYER_COUNT, PanelType } from '../api/utils';
import { Container } from 'pixi.js';
import { VueDraggableNext as draggable } from "vue-draggable-next";

const iApi = inject<InstanceAPI>('iApi');
const handlers: Array<string> = [];
const selectedId = ref<string>('');
const layers = ref<Array<Container>>([]);

const visible = computed(() => iApi?.panel.isVisible(PanelType.LAYERS));

onMounted(() => {

    handlers.push(iApi?.event.on(Events.CANVAS_LAYER_SELECTED, () => {
        selectedId.value = iApi?.canvas.grid.activeLayer.label!;
    })!);

    handlers.push(...(iApi?.event.ons([
        Events.APP_INITIALIZED,
        Events.CANVAS_LAYER_ADDED,
        Events.CANVAS_LAYER_REMOVED,
        Events.CANVAS_LAYER_REORDERED,
        Events.CANVAS_FRAME_SELECTED],
        () => {
            updateLayerList();
        }))!)

    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, () => {
        updateLayerPreview(iApi?.canvas.grid.activeLayer as Container);
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

function updateLayerList() {
    layers.value = [...(iApi?.canvas.grid.activeFrameLayers ?? [])].reverse();
    selectedId.value = iApi?.canvas.grid.activeLayer.label!;
    nextTick().then(() => {
        // need to do this on next tick to ensure canvas is rendered
        updateLayerPreviews();
    });
}

function updateLayerPreviews() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        layers.value.forEach(l => {
            updateLayerPreview(l as Container);
        });
    }
}

function updateLayerPreview(layer: Container) {
    let grid = iApi?.canvas.grid;
    if (grid && layer) {
        if (!grid.activeFrameLayers.some(l => l.label === layer.label)) {
            return;
        }
        let activeLayerCanvas = document.getElementById(layer.label) as HTMLCanvasElement;
        if (activeLayerCanvas) {
            let ctx = activeLayerCanvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;
            if (ctx) {
                ctx.clearRect(0, 0, activeLayerCanvas.width, activeLayerCanvas.height);
                ctx.drawImage(grid.getContainerPreview(layer), 0, 0, activeLayerCanvas.width, activeLayerCanvas.height);
            }
        }
    }
}

function selectLayer(layerIdx: number) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        // reverse layerIdx
        layerIdx = layers.value.length - layerIdx - 1;
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

function syncOrder() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.reorderLayers(layers.value.reverse() as Array<Container>);
        selectedId.value = iApi?.canvas.grid.activeLayer.label!;
    }
}

function toggleAll(value: boolean) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        layers.value.forEach(layer => {
            layer.visible = value;
        })
        notifyVisibilityChange();
    }
}

function notifyVisibilityChange() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.render();
    }
}

</script>
