<template>
  <div
    ref="container"
    class="grid place-content-center row-span-3 cursor-pointer scale-1"
  >
    <!-- PIXI Canvas will get injected here -->

    <div
      v-if="!initialized"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 border-stone-300 pixel-border w-96 text-center p-5"
    >
      <h1 class="text-4xl font-bold mb-4">.pxl</h1>
      <p class="text-sm text-gray-600 mb-4">
        Enter the dimensions for your canvas
      </p>
      <div class="flex flex-col space-y-3">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex flex-col">
            <input
              id="width"
              v-model="width"
              class="appearance-none pixel-border p-2 w-full"
              type="number"
              min="2"
              max="512"
              placeholder="Width"
            />
          </div>
          <div class="flex flex-col">
            <input
              id="height"
              v-model="height"
              class="appearance-none pixel-border p-2 w-full"
              type="number"
              min="2"
              max="512"
              placeholder="Height"
            />
          </div>
        </div>
      </div>
      <!-- Common Dimensions -->
      <div class="flex flex-col space-y-3 mt-5 text-sm">
        <div class="flex justify-around flex-wrap gap-2">
          <button
            v-for="dims in COMMON_CANVAS_DIMENSIONS"
            class="bg-gray-200 hover:bg-gray-300 font-bold py-1 px-3"
            @click="setAndInitialize(dims[0], dims[1])"
            :key="`${dims[0]}x${dims[1]}`"
          >
            {{ dims[0] }}x{{ dims[1] }}
          </button>
        </div>
      </div>
      <button
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 mt-4 w-full"
        @click="initializeCanvas"
      >
        Create Canvas
      </button>
      <p v-if="error" class="text-red-600 font-bold text-sm mt-3">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from "vue";
import { InstanceAPI, OrchestratorAPI } from "../api";
import { COMMON_CANVAS_DIMENSIONS, Events } from "../api/utils";

const container = ref();
const iApi = inject<InstanceAPI>("iApi");
const oApi = inject<OrchestratorAPI>("oApi");
let width = ref<number | undefined>(undefined);
let height = ref<number | undefined>(undefined);
let error = ref("");
let initialized = ref(false);
const handlers: Array<string> = [];

// use to bypass initialization
const BYPASS_INIT = false;

onMounted(() => {
  handlers.push(
    iApi?.event.on(Events.APP_INITIALIZED, () => {
      initialized.value = true;
    })!,
  );

  handlers.push(
    iApi?.event.on(Events.APP_DESTROYED, () => {
      initialized.value = false;
    })!,
  );

  oApi!.container = container.value;

  if (BYPASS_INIT) {
    width.value = 32;
    height.value = 32;
    initializeCanvas();
  }
});
onUnmounted(() => {
  handlers.forEach((h) => iApi?.event.off(h));

  oApi?.destroyInstance();
  initialized.value = false;
});

function setAndInitialize(w: number, h: number) {
  width.value = w;
  height.value = h;
  initializeCanvas();
}

function initializeCanvas() {
  if (!validateDimensions()) {
    return;
  }

  const config = {
    canvas: {
      settings: {
        width: width.value,
        height: height.value,
      },
    },
  };

  oApi!.newInstance(config);

  width.value = undefined;
  height.value = undefined;
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
</script>
