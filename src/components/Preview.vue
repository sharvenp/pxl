<template>
    <div class="absolute rounded bg-white bg-opacity-60 border-2 top-0 right-0 m-5 z-10">
        <canvas width="100" height="100" ref="previewCanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const previewCanvas = ref<HTMLCanvasElement>();
let handlers: Array<string> = [];

onMounted(() => {

    if (iApi?.canvas?.view && previewCanvas.value) {
        let canvasEl = previewCanvas.value;
        let ch = iApi.canvas.height
        let cw = iApi.canvas.width;

        let h = 128;
        let w = 128;
        if (ch > cw) {
            h = (ch / cw) * w;
        } else if (cw > ch) {
            w = (cw / ch) * h;
        }

        canvasEl.width = w;
        canvasEl.height = h;
    }

    // render the preview canvas
    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, () => {
        if (iApi?.canvas?.view && previewCanvas.value) {
            let ctx = previewCanvas.value.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;
            if (ctx) {
                ctx.clearRect(0, 0, previewCanvas.value.width, previewCanvas.value.height);
                ctx.drawImage(iApi.canvas.view, 0, 0, previewCanvas.value.width, previewCanvas.value.height);
            }
        }
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
