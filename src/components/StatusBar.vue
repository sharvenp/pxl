<template>
    <div class="flex flex-row">
        <p class="p-1 text-right ms-auto text-xs h-6">
            <template v-if="isOnCanvas">
                X: {{x}} Y: {{y}}
            </template>
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, GridMouseEvent } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let x = ref<number>(0);
let y = ref<number>(0);
let isOnCanvas = ref<boolean>(false);

onMounted(() => {
    handlers.push(iApi?.event.on(Events.MOUSE_MOVE, (evt: GridMouseEvent) => {
        if (evt.isOnCanvas) {
            x.value = Math.floor(evt.coords.pixel.x) + 1;
            y.value = Math.floor(evt.coords.pixel.y) + 1;
            isOnCanvas.value = true;
        } else {
            isOnCanvas.value = false;
        }
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
