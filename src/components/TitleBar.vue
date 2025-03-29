<template>
    <div class="title-bar absolute w-full grid grid-rows-2 pb-1 z-10">
        <div class="mt-1 flex flex-row text-sm justify-between">
            <span class="text-sm font-bold px-2">.pxl</span>
            <!-- TODO: only show this if in desktop mode~~~ -->
            <div class="row-span-2 flex flex-row justify-end text-sm mx-1">
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">_</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">O</button>
                <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="">X</button>
            </div>
        </div>
        <div class="mt-1 flex flex-row text-sm">
            <button class="mx-2 px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu('File')">File</button>
            <button class="me-1 px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu('Edit')">Edit</button>
            <button class="me-1 px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu('View')">View</button>
            <button class="px-2 self-center bg-stone-300 hover:bg-stone-400" @click="openMenu('Help')">Help</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, GridMouseEvent } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];

onMounted(() => {
    // handlers.push(iApi?.event.on(Events.MOUSE_MOVE, (evt: GridMouseEvent) => {
    //     x.value = Math.floor(evt.coords.x) + 1;
    //     y.value = Math.floor(evt.coords.y) + 1;
    //     isOnCanvas.value = true;
    // })!);

    // handlers.push(iApi?.event.on(Events.CANVAS_MOUSE_LEAVE, () => {
    //     isOnCanvas.value = false;
    // })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

function openMenu(x: string) {
    console.log('open',x);
}

</script>
