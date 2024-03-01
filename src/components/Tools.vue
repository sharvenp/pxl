<template>
    <div class="absolute rounded top-0 left-0 m-5 z-10">
        <div class="bg-white grid grid-rows-3 grid-cols-2 gap-4 p-4 font-mono text-sm text-center font-bold leading-6">
            <button class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.PENCIL)">P</button>
            <button class="p-4 w-16 h-16 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(ToolType.ERASER)">E</button>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">03</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">04</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">05</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">06</div>
        </div>
        <div v-if="currentTool && currentTool.toolProperties.length > 0" class="bg-white mt-5 flex flex-col p-4">
            <template v-for="prop in currentTool.toolProperties">
                <template v-if="prop.propertyType === 'slider'">
                    <div class="flex flex-row justify-between text-sm">
                        <span>{{ prop.propertyLabel }}</span>
                        <span>{{ prop.value }}{{ prop.unit }}</span>
                    </div>
                    <input class="mb-3" type="range" :min="prop.minValue" :max="prop.maxValue" v-model="prop.value">
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { Events, InstanceAPI } from '../api';
import { ToolType } from '../api/tools';

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
