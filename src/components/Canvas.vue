<template>
    <div class="grid place-content-center row-span-3">
        <div class="relative">
            <div class="absolute bg-white w-full h-full -z-10">
                <canvas v-show="initialized" class="bg-white pixel-canvas" ref="bgCanvas"></canvas>
            </div>
            <canvas v-show="initialized" class="pixel-canvas" ref="canvas"></canvas>
            <!-- TODO: use iterator here to add more layers -->
        </div>
        <div v-if="!initialized" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 w-80 text-center p-5 rounded-xl">
            <p>Enter canvas dimensions</p>
            <div class="flex flex-row justify-center mt-2">
                <input v-model="width" class="appearance-none border rounde m-2 p-2 focus:outline-none" type="number" min="1" max="256" placeholder="Width">
                <input  class="appearance-none border rounded m-2 p-2 focus:outline-none" type="number" min="1" max="256" placeholder="Height">
            </div>
            <button class="bg-indigo-300 hover:bg-indigo-400 font-bold py-2 px-4 rounded mt-2" @click="initializeCanvas">
                Create
            </button>
            <p class="text-red-400 mt-5">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from 'vue'
import { InstanceAPI } from '../api';

const canvas = ref();
const bgCanvas = ref();
const iApi = inject<InstanceAPI>('iApi');
let width = ref(32);
let height = ref(32);
let error = ref("");
let initialized = ref(false);

function initializeCanvas() {
    error.value = "";
    if (!width.value || width.value < 0 || !height.value || height.value < 0) {
        error.value = "Please enter valid dimensions";
        return;
    }

    iApi?.canvas.initialize(canvas.value, bgCanvas.value, width.value, height.value);
    initialized.value = true;
}

onMounted(() => {
    initializeCanvas();
})

onUnmounted(() => {
    iApi?.canvas.destroy();
    initialized.value = false;
})


</script>
