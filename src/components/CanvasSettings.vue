<template>
    <div class="canvas-settings absolute border bg-white m-5 flex flex-col p-4 z-10">
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
import { ref, inject } from 'vue'
import { InstanceAPI } from '../api';

const iApi = inject<InstanceAPI>('iApi');
const mirrorX = ref<boolean>(iApi?.canvas.mirrorX ?? false);
const mirrorY = ref<boolean>(iApi?.canvas.mirrorY ?? false);

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

</script>
