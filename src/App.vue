<template>
<div class="h-full overflow-hidden">
  <div class="layout grid h-full grid-rows-3 grid-cols-1">
    <Canvas />
    <Tools />
    <Palette />
    <Preview />
    <Settings />
    <div class="status-bar grid col-span-full z-10">
      <StatusBar />
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import Canvas from './components/Canvas.vue';
import Tools from './components/Tools.vue';
import Palette from './components/Palette.vue';
import StatusBar from './components/StatusBar.vue';
import Preview from './components/Preview.vue';
import Settings from './components/Settings.vue';
</script>
