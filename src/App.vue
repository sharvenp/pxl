<template>
  <h1>Test</h1>
  <button @click="ping">Test</button>
</template>

<script setup lang="ts">
import { ipcAPI } from './ipc-api';

function ping() {
  ipcAPI("DEBUG_PING")
}

</script>
