<template>
    <div class="status-bar absolute w-full flex flex-row z-10">
        <p class="p-1 px-2 text-xs h-6">
            <template v-if="isOnCanvas">
                X: {{x}} Y: {{y}}
            </template>
        </p>
        <p class="text-xs p-1 text-gray-500 ms-auto">
            <span>{{ version }}</span>
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, GridMouseEvent } from '../api/utils';

const version = __APP_VERSION__;
const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let x = ref<number>(0);
let y = ref<number>(0);
let isOnCanvas = ref<boolean>(false);

onMounted(() => {
    handlers.push(iApi?.event.on(Events.MOUSE_MOVE, (evt: GridMouseEvent) => {
        x.value = Math.floor(evt.coords.x) + 1;
        y.value = Math.floor(evt.coords.y) + 1;
        isOnCanvas.value = true;
    })!);

    handlers.push(iApi?.event.on(Events.CANVAS_MOUSE_LEAVE, () => {
        isOnCanvas.value = false;
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
