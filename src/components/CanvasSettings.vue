<template>
    <div v-show="visible" class="canvas-settings absolute rounded border bg-white m-5 flex flex-col p-4 z-10">
        <div class="flex flex-row items-center text-xs">
            <input type="checkbox" v-model="mirrorX" @change="updateMirrorX">
            <span class="ms-2">Mirror X</span>
        </div>
        <div class="flex flex-row items-center text-xs mt-2">
            <input type="checkbox" v-model="mirrorY" @change="updateMirrorY">
            <span class="ms-2">Mirror Y</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { InstanceAPI } from '../api';
import { Events, PanelType } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const mirrorX = ref<boolean>(false);
const mirrorY = ref<boolean>(false);
const handlers: Array<string> = [];

const visible = computed(() => iApi?.panel.isVisible(PanelType.CANVAS_SETTINGS));

const updateMirrorX = () => {
    if (iApi) {
        iApi.canvas.mirrorX = mirrorX.value;
    }
};

const updateMirrorY = () => {
    if (iApi) {
        iApi.canvas.mirrorY = mirrorY.value;
    }
};

onMounted(() => {
    handlers.push(iApi?.event.on(Events.APP_INITIALIZED, () => {
        mirrorX.value = iApi?.canvas.mirrorX ?? false;
        mirrorY.value = iApi?.canvas.mirrorY ?? false;
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})
</script>
