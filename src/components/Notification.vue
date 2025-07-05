<template>
    <div class="status-bar absolute w-full flex flex-row z-20">
        <div v-if="show" class="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-20"
             @click.self="closeModal">
            <div class="flex flex-col bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 class="text-lg font-semibold mb-2">{{ notification?.title }}</h2>
                <div class="mb-4">
                    <p class="text-gray-700">{{ notification?.message }}</p>
                    <p v-show="notification?.subtext" class="text-gray-500 text-sm">{{ notification?.subtext }}</p>
                </div>
                <div class="flex flex-row justify-end space-x-2">
                    <button v-for="(option, index) in notification?.options" :key="index"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            @click="callOptionCallback(option.callback)">
                        {{ option.label }}
                    </button>
                    <button v-if="notification?.showCancel" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" @click="closeModal">{{ notification?.cancelLabel ?? 'Cancel' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted } from 'vue'
import { InstanceAPI } from '../api';
import { Events, NotificationConfiguration } from '../api/utils';

const iApi = inject<InstanceAPI>('iApi');
let handlers: Array<string> = [];
let show = ref(false);
let notification = ref<NotificationConfiguration | undefined>(undefined);

function callOptionCallback(callBack: Function) {
    callBack();
    closeModal();
}

function closeModal() {
    show.value = false;
    notification.value = undefined;
}

onMounted(() => {
    handlers.push(iApi?.event.on(Events.NOTIFY_SHOW, (notif: NotificationConfiguration) => {
        notification.value = notif;
        show.value = true;
    })!);
})

onUnmounted(() => {
    handlers.forEach(h => iApi?.event.off(h));
})

</script>
