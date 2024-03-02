<template>
    <div class="flex flex-row">
        <p class="p-2 text-right ms-auto">X: {{ x }} Y: {{ y }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI, Events } from '../api';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let x = ref<number>(0);
let y = ref<number>(0);

onMounted(() => {
    handlers.push(iApi?.event.on(Events.CANVAS_MOUSE_MOVE, (evt: any) => {
        x.value = Math.floor(evt.coords.pixel.x) + 1;
        y.value = Math.floor(evt.coords.pixel.y) + 1;
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
