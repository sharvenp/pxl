<template>
    <div class="absolute rounded bg-white bg-opacity-60 border-2 top-0 right-0 m-5 z-10">
        <canvas width="100" height="100" ref="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const canvas = ref<HTMLCanvasElement>();
let handlers: Array<string> = [];

onMounted(() => {

    if (iApi?.canvas?.el && canvas.value) {
        let canvasEl = canvas.value;
        let ch = iApi.canvas.el.height;
        let cw = iApi.canvas.el.width;

        let h = 128.0;
        let w = 128.0;
        if (ch > cw) {
            h = (ch / cw) * w;
        } else if (cw > ch) {
            w = (cw / ch) * h;
        }

        canvasEl.width = w;
        canvasEl.height = h;
    }

    // TODO: this needs to be updated to work with layers
    // render the preview canvas
    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, () => {
        if (iApi?.canvas?.el && canvas.value) {
            let canvasEl = canvas.value;
            let ctx = canvasEl.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
                ctx.drawImage(iApi.canvas.el, 0, 0, canvasEl.width, canvasEl.height);
            }
        }
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
