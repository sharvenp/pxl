<template>
<div class="h-full overflow-hidden">
  <div class="layout grid h-full grid-rows-3 grid-cols-1">
    <TitleBar />
    <PxlCanvas />
    <Notification/>
    <Tools />
    <Preview />
    <CanvasSettings />
    <Layers />
    <Palette />
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
import CanvasSettings from './components/CanvasSettings.vue';
import Layers from './components/Layers.vue';
import Notification from './components/Notification.vue';
</script>
