<template>
    <div ref="container" class="grid place-content-center row-span-3 cursor-pointer scale-1">

        <!-- PIXI Canvas will get injected here -->

        <div v-if="!initialized" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 w-80 text-center p-5 rounded-xl">
            <p>Enter canvas dimensions</p>
            <div class="flex flex-row justify-center mt-2">
                <input v-model="width" class="appearance-none border rounde m-2 p-2 focus:outline-none" type="number" min="1" max="256" placeholder="Width">
                <input  class="appearance-none border rounded m-2 p-2 focus:outline-none" type="number" min="1" max="256" placeholder="Height">
            </div>
            <button class="bg-indigo-300 hover:bg-indigo-400 font-bold py-2 px-4 rounded mt-2" @click="initializeCanvas">
                Create
            </button>
            <p class="text-red-400 mt-5">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, PixelCoordinates } from '../api/utils';
import { Application, FederatedMouseEvent } from 'pixi.js';

const container = ref();
const iApi = inject<InstanceAPI>('iApi');
let width = ref(32);
let height = ref(32);
let error = ref("");
let initialized = ref(false);

function initializeCanvas() {
    error.value = "";
    if (!width.value || width.value < 0 || !height.value || height.value < 0) {
        error.value = "Please enter valid dimensions";
        return;
    }

    let pixi = new Application();
    pixi.init({
        width: width.value,
        height: height.value,
        backgroundAlpha: 0,
        eventMode: 'static',
        autoDensity: true
    }).then(() => {
        container.value.appendChild(pixi.canvas);
        pixi.canvas.classList.add("pxl-canvas"); // add the style class

        let isDragging = false;
        let lastCell: PixelCoordinates | undefined = undefined;
        let getCoords = (event: FederatedMouseEvent) => {
            const localPos = event.getLocalPosition(pixi.stage, { x: event.globalX, y: event.globalY })
            return {x: Math.abs(Math.floor(localPos.x)), y: Math.abs(Math.floor(localPos.y))};
        }

        pixi.stage.eventMode = 'static';
        pixi.stage.hitArea = pixi.screen;

        pixi.stage
        .on('pointerdown', (event) => {
            const coords = getCoords(event);
            if (event.button === 0) {
                isDragging = true;
                iApi?.event.emit(Events.MOUSE_DRAG_START, { coords , isDragging, isOnCanvas: true });
                lastCell = {x: coords.x, y: coords.y};
            }
        })
        .on('pointerup', (event) => {
            const coords = getCoords(event);
            if (event.button === 0) {
                isDragging = false;
                iApi?.event.emit(Events.MOUSE_DRAG_STOP, { coords, isDragging, isOnCanvas: true });
            }
        })
        .on('pointerupoutside', (event) => {
            const coords = getCoords(event);
            if (event.button === 0) {
                isDragging = false;
                iApi?.event.emit(Events.MOUSE_DRAG_STOP, {coords, isDragging, isOnCanvas: false });
            }
        })
        .on('pointermove', (event) => {
            let coords = getCoords(event);
            if (!(coords.x === lastCell?.x && coords.y === lastCell?.y)) {
                iApi?.event.emit(Events.MOUSE_MOVE, { coords, isDragging, isOnCanvas: true });
                lastCell = {x: coords.x, y: coords.y};
            }
        })
        .on('pointerout', (event) => {
            iApi?.event.emit(Events.CANVAS_MOUSE_LEAVE);
        })
        .on('pointerenter', (event) => {
            iApi?.event.emit(Events.CANVAS_MOUSE_ENTER);
        });

        iApi?.canvas.initialize(pixi);

        initialized.value = true;
    });
}

onMounted(() => {
    initializeCanvas();
})

onUnmounted(() => {
    iApi?.canvas.destroy();
    initialized.value = false;
})


</script>
