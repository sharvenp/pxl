import { createApp } from 'vue'
import "./index.css"
import "vue-accessible-color-picker/styles"
import App from './App.vue'
import { InstanceAPI, OrchestratorAPI } from "./api"

const app = createApp(App);

const iApi = new InstanceAPI();
app.provide('iApi', iApi);

const oApi = new OrchestratorAPI(iApi);
app.provide('oApi', oApi);

app.mount('#app');
