<template>
    <div class="preview absolute rounded bg-white bg-opacity-60 border m-5 z-10 items-center justify-center flex">
        <canvas class="preview-canvas border" v-show="initialized" width="100" height="100" ref="previewCanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const previewCanvas = ref<HTMLCanvasElement>();
const initialized = ref(false);
let handlers: Array<string> = [];

onMounted(() => {

    // setup preview canvas
    handlers.push(iApi?.event.on(Events.APP_INITIALIZED, () => {
        if (iApi?.canvas?.view && previewCanvas.value) {
            let canvasEl = previewCanvas.value;
            let ch = iApi.canvas.height
            let cw = iApi.canvas.width;

            let h = 128;
            let w = 128;
            if (ch > cw) {
                w = (cw / ch) * h;
            } else if (cw > ch) {
                h = (ch / cw) * w;
            }

            canvasEl.width = w;
            canvasEl.height = h;
            initialized.value = true;
        }
    })!);

    handlers.push(iApi?.event.on(Events.APP_DESTROYED, () => {
        initialized.value = false;
    })!);

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
