<template>
    <div v-show="visible" class="absolute bottom-32 right-5 mb-16">
        <div class="p-5 w-1 h-4 rounded-lg border-4 border-gray transparent-swatch"></div>
    </div>
    <div v-show="visible" class="absolute bottom-32 right-5 mb-16 z-10">
        <div :key="currentColor?.colorHex" @click="() => togglePicker()" class="p-5 w-1 h-4 rounded-lg border-4 border-gray-200 z-10" :style="{backgroundColor: currentColor?.colorHex}"></div>
    </div>
    <div v-show="showPicker" class="absolute border shadow-md m-5 bottom-60 right-0 z-20">
        <ColorPicker
            default-format="hex"
            :color="currentColor?.colorHex"
            @color-change="colorPickerChange"
        />
        <div class="flex flex-row justify-end bg-white">
            <button class="mt-2 mb-2 me-2 py-1 px-3 rounded-lg border-2 hover:border-gray-300" @click="addColor">Add</button>
            <button class="mt-2 mb-2 me-2 py-1 px-3 rounded-lg border-2 hover:border-gray-300" @click="togglePicker(false)">Close</button>
        </div>
    </div>
    <div v-show="visible" class="absolute h-36 bottom-5 right-0 m-5 z-10 rounded border bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
        <div class="grid grid-cols-5 gap-2 p-2">
            <template v-for="item in palette" :key="item.colorHex">
                <div class="rounded-lg transparent-swatch">
                    <button v-if="item.colorHex !== currentColor?.colorHex" class="p-4 w-1 h-1 rounded-lg border-gray-100 border-4 hover:border-gray-300" :style="{backgroundColor: item.colorHex}" @click.left="selectColor(item)" @click.right="removeColor(item)"></button>
                    <button v-else class="p-4 w-1 h-1 rounded-lg border-orange-200 border-4" :style="{backgroundColor: item.colorHex}" @click.left="selectColor(item)" @click.right="removeColor(item)"></button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { InstanceAPI } from '../api';
import { ColorPicker } from 'vue-accessible-color-picker'
import { Events, MAX_PALETTE_SIZE, PaletteItem, PanelType, Utils } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
const showPicker = ref<boolean>(false);
const lastPickerColor = ref<PaletteItem>();
const handlers: Array<string> = [];
const palette = ref<Array<PaletteItem>>([]);
const currentColor = ref<PaletteItem>();

const visible = computed(() => iApi?.panel.isVisible(PanelType.PALETTE));

function colorPickerChange(color: any) {
    lastPickerColor.value = {
        colorHex: color.colors.hex,
        colorRGBA: Utils.hexToRGBA(color.colors.hex)
    }
}

function togglePicker(state?: boolean) {
    showPicker.value = state ?? !showPicker.value;
}

function selectColor(color: PaletteItem) {
    iApi?.palette.selectColor(color);
}

function addColor() {
    if (lastPickerColor.value && palette.value.length < MAX_PALETTE_SIZE) {
        iApi?.palette.addColor(lastPickerColor.value);
    }
}

function removeColor(color: PaletteItem) {
    iApi?.palette.removeColor(color);
}

onMounted(() => {
    handlers.push(iApi?.event.on(Events.APP_INITIALIZED, () => {
        currentColor.value = iApi?.palette.selectedColor;
        palette.value = [...iApi?.palette.palette ?? []];
    })!);

    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_SELECT, (color: PaletteItem) => {
        currentColor.value = color;
    })!);

    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_ADD, () => {
        // refresh
        palette.value = [...iApi?.palette.palette ?? []];
    })!);

    handlers.push(iApi?.event.on(Events.PALETTE_COLOR_REMOVE, () => {
        // refresh
        palette.value = [...iApi?.palette.palette ?? []];
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})
</script>
