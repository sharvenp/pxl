<template>
    <div ref="container" class="grid place-content-center row-span-3">
        <div class="relative">
            <div class="absolute w-full h-full pointer-events-none">
                <canvas v-show="initialized" class="pixel-canvas" ref="cursorCanvas"></canvas>
            </div>
            <div class="absolute bg-white w-full h-full -z-10 pointer-events-none">
                <canvas v-show="initialized" class="bg-white pixel-canvas" ref="bgCanvas"></canvas>
            </div>
            <canvas v-show="initialized" class="pixel-canvas" ref="canvas"></canvas>
            <!-- TODO: use iterator here to add more layers -->
        </div>
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
import { CanvasCoordinates, Coordinates, Events, PixelCoordinates } from '../api/utils';

const container = ref();
const canvas = ref();
const cursorCanvas = ref();
const bgCanvas = ref();
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

    iApi?.canvas.initialize(canvas.value, bgCanvas.value, width.value, height.value);
    iApi?.cursor.initialize(cursorCanvas.value, canvas.value.width, canvas.value.height, width.value, height.value);
    initialized.value = true;

    let isDragging = false;
    let isOnCanvas = false;
    let lastCell: PixelCoordinates | undefined = undefined;

    if (container.value !== null) {

        container.value.onmousedown = (event: MouseEvent) => {
            let coords = _parseMouseEvent(event);
            isOnCanvas = !!canvas.value.matches(':hover');
            if (event.button === 0) {
                isDragging = true;
                iApi?.event.emit(Events.MOUSE_DRAG_START, { coords , isDragging, isOnCanvas });
                lastCell = coords.pixel;
            }
        };

        container.value.onmouseup = (event: MouseEvent) => {
            let coords = _parseMouseEvent(event);
            isOnCanvas = !!canvas.value.matches(':hover');
            if (event.button === 0) {
                isDragging = false;
                iApi?.event.emit(Events.MOUSE_DRAG_STOP, { coords, isDragging, isOnCanvas });
            }
        };

        container.value.onmousemove = (event: MouseEvent) => {
            let coords = _parseMouseEvent(event);

            let prevIsOnCanvas = isOnCanvas;
            isOnCanvas = !!canvas.value.matches(':hover');

            if (prevIsOnCanvas && !isOnCanvas) {
                iApi?.event.emit(Events.CANVAS_MOUSE_LEAVE, { coords, isDragging, isOnCanvas });
                return;
            }

            if (!prevIsOnCanvas && isOnCanvas) {
                iApi?.event.emit(Events.CANVAS_MOUSE_ENTER, { coords, isDragging, isOnCanvas });
            }

            if (!(coords.pixel.x === lastCell?.x && coords.pixel.y === lastCell?.y)) {
                iApi?.event.emit(Events.MOUSE_MOVE, { coords, isDragging, isOnCanvas });
                lastCell = coords.pixel;
            }
        };
    }
}

function _parseMouseEvent(event: MouseEvent): Coordinates {
    let coords: CanvasCoordinates = { x: event.offsetX, y: event.offsetY };
    let pixelCoords = {
        x: Math.floor(coords.x / (iApi!.canvas.grid!.widthRatio * 1.0)),
        y: Math.floor(coords.y / (iApi!.canvas.grid!.heightRatio * 1.0))
    };
    return { canvas: coords, pixel: pixelCoords};
}

function _pixelCheck(coords: PixelCoordinates): boolean {
    return (coords.x >= 0 && coords.y >= 0) &&
           (coords.x < (iApi?.canvas.grid?.pixelWidth ?? 0) && coords.y < (iApi?.canvas.grid?.pixelHeight ?? 0));
}


onMounted(() => {
    initializeCanvas();
})

onUnmounted(() => {
    iApi?.canvas.destroy();
    initialized.value = false;

    if (container.value !== null) {
        container.value.onmousemove = null;
        container.value.onmouseup = null;
        container.value.onmousedown = null;
        container.value.onmouseenter = null;
        container.value.onmouseleave = null;
    }
})


</script>
