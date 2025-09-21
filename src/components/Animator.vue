<template>
    <div v-show="visible" class="absolute animator p-3 bottom-10 left-5 rounded border bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
        <div>
            <div class="flex items-center gap-4 mb-2">
                <button
                    class="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300 transition text-sm font-medium"
                >
                    ▶️ Preview
                </button>
                <button
                    class="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300 transition text-sm font-medium"
                    :disabled="frames.length >= MAX_FRAME_COUNT"
                    @click="addFrame"
                >
                    ➕ Add Frame
                </button>
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" class="accent-stone-500" @change="toggleOnionSkin" />
                    Onion Skin
                </label>
                <span class="text-xs text-gray-500 ml-auto">{{ frames.length }} / {{ MAX_FRAME_COUNT }}</span>
            </div>
        </div>
        <div class="flex flex-nowrap items-start gap-4">
            <div v-for="(frame, i) in frames" :key="i" class="border animator-frame flex-none flex items-center justify-center relative rounded hover:shadow-lg transition" :class="{'border-stone-500 border-2': selectedFrame === i, 'border-stone-200': selectedFrame !== i}">
                <!-- Highlight border if selected -->
                <img :id="frame.label" class="animator-img" v-on:dblclick="selectFrame(i)" />

                <!-- Icon Buttons Bottom Right -->
                <div class="absolute bottom-1 right-1 flex gap-1">
                    <!-- Clone Icon -->
                    <button
                        class="p-1 rounded hover:bg-stone-100 transition"
                        title="Clone"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="9" y="9" width="10" height="10" rx="2" stroke-width="2" stroke="currentColor" fill="none"/>
                            <rect x="5" y="5" width="10" height="10" rx="2" stroke-width="2" stroke="currentColor" fill="none" opacity="0.5"/>
                        </svg>
                    </button>
                    <!-- Delete Icon -->
                    <button
                        class="p-1 rounded hover:bg-stone-100 transition"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { InstanceAPI } from '../api';
import { Events, MAX_FRAME_COUNT, PanelType } from '../api/utils';
import { Container } from 'pixi.js';

const iApi = inject<InstanceAPI>('iApi');
const handlers: Array<string> = [];
const selectedFrame = ref<number>(0);
const frames = ref<Array<Container>>([]);

const visible = computed(() => iApi?.panel.isVisible(PanelType.ANIMATOR));

onMounted(() => {

    handlers.push(iApi?.event.on(Events.CANVAS_FRAME_SELECTED, () => {
        selectedFrame.value = iApi?.canvas.grid.activeFrameIndex;
    })!);

    handlers.push(...(iApi?.event.ons([
        Events.APP_INITIALIZED,
        Events.CANVAS_FRAME_ADDED,
        Events.CANVAS_FRAME_REMOVED,
        Events.CANVAS_FRAME_REORDERED],
        () => {
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
        frames.value.forEach((frame, i) => {

            // Temporarily make frame visible and opaque to get a proper preview

            const prevVisibility = frame.visible;
            const prevAlpha = frame.alpha;

            frame.visible = true;
            frame.alpha = 1;

            updateFramePreview(i);

            // Restore previous state

            frame.visible = prevVisibility;
            frame.alpha = prevAlpha;
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

</script>
