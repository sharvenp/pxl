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
