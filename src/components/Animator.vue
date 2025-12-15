<template>
    <div v-show="visible" class="absolute animator p-3 bottom-10 left-5 rounded border bg-white">
        <div>
            <div class="flex items-center gap-4 mb-2">
                <button class="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300 transition text-sm font-medium"
                    :disabled="frames.length >= MAX_FRAME_COUNT" @click="addFrame">
                    ➕ Add Frame
                </button>
                <button class="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300 transition text-sm font-medium"
                    @click="preview()">
                    ▶️ Preview
                </button>
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                    Onion Skin
                    <input type="checkbox" class="accent-stone-500" @change="toggleOnionSkin" />
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                    FPS
                    <input type="number" min="1" max="60" class="accent-stone-500 border w-12 ps-2" :value="fps"
                        @input="updateFps" />
                </label>
                <span class="text-xs text-gray-500 ml-auto">{{ frames.length }} / {{ MAX_FRAME_COUNT }}</span>
            </div>
        </div>
        <div>
            <draggable
                class="flex flex-nowrap items-start gap-4 overflow-auto overflow-y-hidden scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-2 scrollbar-h-2"
                :list="frames" @change="syncOrder">
                <div v-for="(frame, i) in frames" :key="i"
                    class="border animator-frame flex-none flex items-center justify-center relative rounded hover:shadow-lg transition"
                    :class="{ 'border-stone-500 border-2': selectedFrame === i, 'border-stone-200': selectedFrame !== i }">
                    <!-- Highlight border if selected -->
                    <img :id="frame.label" v-on:dblclick="selectFrame(i)" />

                    <!-- Icon Buttons Bottom Right -->
                    <div class="absolute top-1 left-1 right-1 flex justify-between">
                        <!-- Clone Icon -->
                        <button class="p-1 rounded hover:bg-stone-100 transition" title="Clone" @click="cloneFrame(i)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="9" y="9" width="10" height="10" rx="2" stroke-width="2" stroke="currentColor"
                                    fill="none" />
                                <rect x="5" y="5" width="10" height="10" rx="2" stroke-width="2" stroke="currentColor"
                                    fill="none" opacity="0.5" />
                            </svg>
                        </button>
                        <!-- Delete Icon -->
                        <button class="p-1 rounded hover:bg-stone-100 transition" title="Delete"
                            @click="deleteFrame(i)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </draggable>
        </div>
    </div>

    <!-- Preview overlay (centered image with darkened background) -->
    <div v-show="previewVisible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closePreview">
        <div class="absolute inset-0 bg-black bg-opacity-60" @click="closePreview"></div>
        <div class="relative z-10 bg-white p-2">
            <img id="animator-preview" class="border shadow-lg" />
            <div class="flex justify-between text-sm mt-2">
                <span>{{ fps }} FPS</span>
                <span>
                    {{ previewFrameId + 1 }} / {{ frames.length }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { InstanceAPI } from '../api';
import { DEFAULT_FPS, Events, MAX_FPS, MAX_FRAME_COUNT, PanelType } from '../api/utils';
import { Container } from 'pixi.js';
import { VueDraggableNext as draggable } from "vue-draggable-next";

const iApi = inject<InstanceAPI>('iApi');
const handlers: Array<string> = [];
const selectedFrame = ref<number>(0);
const frames = ref<Array<Container>>([]);
const fps = ref<number>(5);
const previewVisible = ref<boolean>(false);
const previewInterval = ref<any>(undefined);
const previewFrameId = ref<number>(0);

const visible = computed(() => iApi?.panel.isVisible(PanelType.ANIMATOR));

onMounted(() => {

    handlers.push(iApi?.event.on(Events.CANVAS_FRAME_SELECTED, () => {
        selectedFrame.value = iApi?.canvas.grid.activeFrameIndex;
    })!);

    handlers.push(...(iApi?.event.ons([
        Events.APP_INITIALIZED,
        Events.CANVAS_FRAME_ADDED,
        Events.CANVAS_FRAME_REMOVED,
        Events.CANVAS_FRAME_REORDERED,
        Events.CANVAS_FRAME_DUPLICATED],
        () => {
            fps.value = iApi?.canvas.grid.fps;
            updateFrameList();
        }))!)

    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, () => {
        updateFramePreview(iApi?.canvas.grid.activeFrameIndex);
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

function updateFrameList() {
    frames.value = [...(iApi?.canvas.grid.frames ?? [])];
    selectedFrame.value = iApi?.canvas.grid.activeFrameIndex!;
    nextTick().then(() => {
        // need to do this on next tick to ensure canvas is rendered
        updateFramePreviews();
    });
}

function updateFramePreviews() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        frames.value.forEach((_, i) => {
            updateFramePreview(i);
        });
    }
}

async function updateFramePreview(frameIndex: number) {
    const grid = iApi?.canvas.grid;
    const frame = grid?.frames[frameIndex];
    if (grid && frame) {
        if (!grid.frames.some(f => f.label === frame.label)) {
            return;
        }
        const img = document.getElementById(frame.label) as HTMLImageElement;
        if (img) {
            img.src = await iApi!.canvas.grid.exportImageBase64(frameIndex);
            if (img.naturalHeight > img.naturalWidth) {
                img.style.height = '100%';
                img.style.width = 'auto';
            } else {
                img.style.width = '100%';
                img.style.height = 'auto';
            }
        }
    }
}

function toggleOnionSkin(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
        iApi?.canvas.grid.toggleOnionSkin(input.checked);
    }
}

function selectFrame(frameIdx: number) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.setActiveFrame(frameIdx);
    }
}

function addFrame() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.addFrame();
    }
}

function deleteFrame(frameIdx: number) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.removeFrame(frameIdx);
    }
}

function cloneFrame(frameIdx: number) {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.cloneFrame(frameIdx);
    }
}

async function preview() {
    const grid = iApi?.canvas.grid;
    if (grid) {

        previewVisible.value = true;

        const img = document.getElementById("animator-preview") as HTMLImageElement;

        let ch = iApi.canvas.height;
        let cw = iApi.canvas.width;

        // scale preview to 60% of the viewport dimensions, preserving aspect ratio
        const minScale = 0.6;
        const maxW = window.innerWidth * minScale;
        const maxH = window.innerHeight * minScale;
        const scale = Math.min(maxW / cw, maxH / ch);

        let w = Math.round(cw * scale);
        let h = Math.round(ch * scale);

        img.width = w;
        img.height = h;

        const images: Array<string> = [];
        frames.value.forEach(async (_, i) => {
            const b64 = await grid.exportImageBase64(i);
            images.push(b64);
        })

        let idx = 0;

        previewInterval.value = setInterval(() => {
            idx = (idx + 1) % frames.value.length;
            img.src = images[idx];
            previewFrameId.value = idx;
        }, 1000 / fps.value);
    }
}

function updateFps(event: Event) {
    const input = event.target as HTMLInputElement;
    let newFps = parseInt(input.value);

    if (isNaN(newFps)) {
        newFps = DEFAULT_FPS;
    }

    newFps = Math.min(Math.max(newFps, 1), MAX_FPS);
    input.value = newFps.toString();

    let grid = iApi?.canvas.grid;
    if (grid && !isNaN(newFps)) {
        iApi!.canvas.grid.fps = newFps;
        fps.value = newFps;
    }
}

function closePreview() {
    previewVisible.value = false;
    if (previewInterval.value) {
        clearInterval(previewInterval.value);
        previewInterval.value = undefined;
    }
}

function syncOrder() {
    let grid = iApi?.canvas.grid;
    if (grid) {
        grid.reorderFrames(frames.value as Array<Container>);
        selectedFrame.value = iApi?.canvas.grid.activeFrameIndex!;
    }
}

</script>
