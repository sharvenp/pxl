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
                >
                    ➕ Add Frame
                </button>
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" class="accent-stone-500" />
                    Onion Skin
                </label>
            </div>
        </div>
        <div class="flex flex-nowrap items-start gap-4">
            <div v-for="i in Array(20).fill(0)" :key="i" class="border animator-frame flex-none flex items-center justify-center relative">
                <img :id="`animation-frame-${i}`" class="animator-img border" />
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
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { InstanceAPI } from '../api';
import { Events, PanelType } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const handlers: Array<string> = [];

const visible = computed(() => iApi?.panel.isVisible(PanelType.ANIMATOR));

onMounted(() => {
    handlers.push(iApi?.event.on(Events.CANVAS_UPDATE, async () => {
        if (iApi?.canvas?.view) {
            const img = document.getElementById(`animation-frame-0`) as HTMLImageElement;
            if (img) {
                img.src = await iApi.canvas.grid.exportImageBase64();
                if (img.naturalHeight > img.naturalWidth) {
                    img.style.height = '100%';
                    img.style.width = 'auto';
                } else {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                }
            }
        }
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})
</script>
