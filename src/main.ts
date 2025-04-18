import { createApp } from 'vue'
import "./index.css"
import "vue-accessible-color-picker/styles"
import App from './App.vue'
import { InstanceAPI } from "./api"

const app = createApp(App);

const iApi = new InstanceAPI();
app.provide('iApi', iApi);

app.mount('#app');
