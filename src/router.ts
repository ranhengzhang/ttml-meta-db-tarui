import { createRouter, createWebHashHistory } from "vue-router";
import TheArtistPage from "./pages/TheArtistPage.vue";

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: TheArtistPage
        }
    ]
});
