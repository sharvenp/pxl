<template>
<div class="h-full overflow-hidden">
  <div class="layout grid h-full grid-rows-3 grid-cols-1">
    <TitleBar />
    <PxlCanvas />
    <Tools />
    <Palette />
    <Preview />
    <Settings />
    <Layers />
    <StatusBar />
  </div>
</div>
</template>

<script setup lang="ts">
import PxlCanvas from './components/Canvas.vue';
import Tools from './components/Tools.vue';
import Palette from './components/Palette.vue';
import TitleBar from './components/TitleBar.vue';
import StatusBar from './components/StatusBar.vue';
import Preview from './components/Preview.vue';
import Settings from './components/Settings.vue';
import Layers from './components/Layers.vue';
</script>
