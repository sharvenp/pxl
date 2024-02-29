<template>
    <div class="flex flex-row">
        <p class="p-2 text-left">{{ currentTool }}</p>
        <p class="p-2 text-right ms-auto">X: {{ x }} Y: {{ y }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI, Events } from '../api';
import { Tools } from '../api/tools';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let x = ref<number>(0);
let y = ref<number>(0);
let currentTool = ref<string>("");

onMounted(() => {
    handlers.push(iApi?.event.on(Events.CANVAS_MOUSE_MOVE, (coordinates: any) => {
        x.value = Math.floor(coordinates.coords.pixel.x) + 1;
        y.value = Math.floor(coordinates.coords.pixel.y) + 1;
    })!);

    handlers.push(iApi?.event.on(Events.TOOL_SELECT, (tool: Tools) => {
        currentTool.value = tool;
    })!);

    currentTool.value = iApi?.tool.selectedTool?.toolType ?? '';
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
