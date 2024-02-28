<template>
    <div class="absolute rounded bg-white top-0 left-0 m-5 z-10">
        <div class="grid grid-rows-3 grid-cols-2 gap-4 p-4 font-mono text-sm text-center font-bold leading-6">
            <button  class="p-4 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(Tools.PENCIL)">P</button>
            <button class="p-4 w-16 h-16 rounded-lg bg-orange-300 hover:bg-orange-500" @click="selectTool(Tools.ERASER)">E</button>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">03</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">04</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">05</div>
            <div class="p-4 w-16 h-16 rounded-lg bg-orange-300">06</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { InstanceAPI } from '../api';
import { Tools } from '../api/tools';

const iApi = inject<InstanceAPI>('iApi');
let currentTool = ref();

function selectTool(tool: Tools) {
    currentTool.value = tool;
    iApi?.tool.createAndSelectTool(tool);
}
</script>
