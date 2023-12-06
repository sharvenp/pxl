<template>
    <p class="p-2 text-right">X: {{ x }} Y: {{ y }}</p>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI, Events } from '../api';

let x = ref<number>(0);
let y = ref<number>(0);
const iApi = inject<InstanceAPI>('iApi');

onMounted(() => {
    iApi?.event.on(Events.CANVAS_MOUSE_MOVE, (coordinates: any) => {
        x.value = Math.floor(coordinates.coords.pixel.x) + 1;
        y.value = Math.floor(coordinates.coords.pixel.y) + 1;
    });
})

onUnmounted(() => {
    iApi?.event.off(Events.CANVAS_MOUSE_MOVE);
})

</script>


