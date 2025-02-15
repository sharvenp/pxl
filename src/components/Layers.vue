<template>
    <div class="canvas-layers absolute border bg-white m-5 flex flex-col py-2 px-1 z-10">
        <div class="flex flex-col text-xs h-96 overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3">
            <div v-for="i in new Array(10)" :key="i" class="flex flex-row items-start mt-1 mb-1">
                <div class="flex flex-row items-center">
                    <input type="checkbox" class="ms-1 me-2">
                    <canvas width="30" height="30" class="border"></canvas>
                    <span class="ml-2">Layer {{ i }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { InstanceAPI } from '../api';

const iApi = inject<InstanceAPI>('iApi');

</script>
