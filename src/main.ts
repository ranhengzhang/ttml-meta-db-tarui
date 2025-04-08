import {createApp} from "vue";
import App from "./App.vue";
import "element-plus/dist/index.css"
import router from "./router.ts"
import pinia from "./pinia.ts"

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app");
