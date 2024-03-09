import { createApp } from 'vue'
import "./index.css"
import "vue-accessible-color-picker/styles"
import App from './App.vue'
import { InstanceAPI } from "./api"

let app = createApp(App);

let iApi = new InstanceAPI();
app.provide('iApi', iApi);

app.mount('#app');
