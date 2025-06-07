<template>
    <div ref="container" class="grid place-content-center row-span-3 cursor-pointer scale-1">

        <!-- PIXI Canvas will get injected here -->

        <div v-if="!initialized" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 border-stone-300 border-2 w-96 text-center p-5 rounded-xl">
            <h2 class="text-lg font-bold mb-4">Canvas Setup</h2>
            <p class="text-sm text-gray-600 mb-4">Enter the dimensions for your canvas below</p>
            <div class="flex flex-col space-y-3">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label for="width" class="text-sm font-medium text-gray-700 mb-1">Width</label>
                        <input id="width" v-model="width" class="appearance-none border rounded-lg p-2 w-full" type="number" min="2" max="512" placeholder="Width">
                    </div>
                    <div class="flex flex-col">
                        <label for="height" class="text-sm font-medium text-gray-700 mb-1">Height</label>
                        <input id="height" v-model="height" class="appearance-none border rounded-lg p-2 w-full" type="number" min="2" max="512" placeholder="Height">
                    </div>
                </div>
            </div>
            <button class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-4 w-full" @click="initializeCanvas">
                Create Canvas
            </button>
            <p v-if="error" class="text-red-600 font-bold text-sm mt-3">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from 'vue'
import { OrchestratorAPI } from '../api';

const container = ref();
const oApi = inject<OrchestratorAPI>('oApi');
let width = ref(undefined);
let height = ref(undefined);
let error = ref("");
let initialized = ref(false);

function initializeCanvas() {
    if (!validateDimensions()) {
        return;
    }

    const config = {
        canvas: {
            settings: {
                width: width.value,
                height: height.value
            }
        }
    }

    oApi!.container = container.value;

    oApi!.newInstance(config).then(()=> {
        initialized.value = true;
    })
}

function validateDimensions(): boolean {
    error.value = "";
    if (!width.value || width.value < 0 || !height.value || height.value < 0) {
        error.value = "Please enter valid dimensions.";
        return false;
    }
    if (width.value < 2 || height.value < 2) {
        error.value = "Canvas size must be at least 2x2 pixels.";
        return false;
    }
    if (width.value > 512 || height.value > 512) {
        error.value = "Canvas size must be at most 512x512 pixels.";
        return false;
    }
    return true;
}

onMounted(() => {
})

onUnmounted(() => {
    oApi?.destroyInstance();
    initialized.value = false;
})


</script>
