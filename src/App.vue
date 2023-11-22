<template>
<div class="h-full overflow-hidden">
  <div class="grid h-full grid-rows-3 grid-cols-1 font-mono text-center text-sm font-bold leading-6">
    <div class="grid place-content-center row-span-3">
      <canvas width="500" height="500" class="bg-white border-2" ref="el"></canvas>
    </div>
    <div class="shadow-lg bg-stone-100 grid col-span-full z-10">
      <p class="p-2 text-right">X: 123 Y: 123</p>
    </div>
    <div class="absolute bg-white shadow-md border-2 top-0 left-0 m-5 z-10">
      <h2 class="mt-5">Tools</h2>
      <div class="grid grid-rows-4 grid-cols-2 gap-4 p-5 font-mono text-sm text-center font-bold leading-6">
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">01</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">02</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">03</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">04</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">05</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">06</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">07</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">08</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">09</div>
      </div>
    </div>
    <div class="absolute h-52 bg-white overflow-auto scrollbar scrollbar-thumb-stone-200 scrollbar-track-while scrollbar-thumb-rounded-full scrollbar-w-3 border-2 shadow-md bottom-10 right-0 m-5 z-10">
      <h2 class="mt-5">Pallette</h2>
      <div class="grid grid-cols-4 gap-4 p-4">
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
        <div class="p-4 rounded-lg shadow-lg bg-orange-300">color</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Panzoom from "panzoom";

const el = ref()

onMounted(() => {
  Panzoom(el.value, {
    minZoom: 1,
    maxZoom: 6
  })
})

</script>
