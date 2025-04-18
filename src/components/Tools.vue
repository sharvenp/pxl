<template>
    <div class="tools-menu absolute rounded m-5 z-10">
        <!-- Tool buttons -->
        <div class="bg-white grid grid-rows-3 grid-cols-2 gap-4 p-4 font-mono text-sm text-center font-bold leading-6 border">
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.PENCIL)">P</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.ERASER)">E</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.PICKER)">Pi</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.FILL)">F</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.RECTANGLE)">R</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.ELLIPSE)">C</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.LINE)">L</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.SHADE)">S</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.SELECT)">Se</button>
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.CLONE)">Cl</button>
        </div>
        <!-- Tool Property -->
        <div v-if="currentTool" class="bg-white mt-5 flex flex-col p-4 border w-40" :key="currentTool.toolType">
            <span class="text-base">{{ currentTool.toolType }}</span>
            <template v-for="(prop, idx) in currentTool.toolProperties" :key="idx">
                <template v-if="prop.propertyType === 'slider'">
                    <div class="flex flex-row justify-between text-sm mt-2">
                        <span>{{ prop.propertyLabel }}</span>
                        <span>{{ prop.value }}{{ prop.unit }}</span>
                    </div>
                    <input class="mt-1" type="range" :min="prop.minValue" :max="prop.maxValue" :step="prop.step" v-model.number="prop.value">
                </template>
                <template v-else-if="prop.propertyType === 'check_box'">
                    <div class="flex flex-row items-center text-sm mt-2">
                        <span>{{ prop.propertyLabel }}</span>
                        <input class="ms-2" type="checkbox" v-model="prop.value">
                    </div>
                </template>
                <template v-else-if="prop.propertyType === 'radio'">
                    <div class="text-sm mt-2">
                        <span>{{ prop.propertyLabel }}</span>
                        <div class="mt-1 text-xs">
                            <div v-for="(option, oidx) in prop.options" :key="oidx"  class="flex flex-row mt-1">
                                <input type="radio" :value="option" v-model="prop.value">
                                <label class="ms-2">{{ option }}</label>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else-if="prop.propertyType === 'button'">
                    <div class="text-xs mt-2">
                        <button class="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                @click="iApi?.event.emit(prop.event)">
                                {{ prop.propertyLabel }}
                        </button>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, ToolType } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let currentTool = ref<any>();

function selectTool(tool: ToolType) {
    iApi?.tool.selectTool(tool);
}

onMounted(() => {
    handlers.push(iApi?.event.on(Events.TOOL_SELECT, () => {
        currentTool.value = iApi?.tool.selectedTool;
    })!);

    currentTool.value = iApi?.tool.selectedTool;
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
