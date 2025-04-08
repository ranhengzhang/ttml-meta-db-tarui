import {createRouter, createWebHashHistory} from "vue-router";
import TheArtistPage from "./pages/TheArtistPage.vue";
import TheAlbumPage from "./pages/TheAlbumPage.vue";
import TheTrackPage from "./pages/TheTrackPage.vue";

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            redirect: "/artists"
        },
        {
            path: "/artists",
            component: TheArtistPage
        },
        {
            path: "/albums",
            component: TheAlbumPage
        },
        {
            path: "/tracks",
            component: TheTrackPage
        }
    ]
});
