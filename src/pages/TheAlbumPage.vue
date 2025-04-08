<script setup lang="ts">
import {useRecentUuidStore, useSelectedIndexStore} from "../store";
import {computed, nextTick, onMounted, onUnmounted, Ref, ref, watch} from "vue";
import {db} from "../database";
import {storeToRefs} from "pinia";
import {Album} from "../types/album.ts";
import MetaList from "../components/MetaList.vue";
import ArtistList from "../components/ArtistList.vue";
import {liveQuery, PromiseExtended, Subscription} from "dexie";
import EntityList from "../components/EntityList.vue";
import {Artist} from "../types/artist.ts";

let albums_subscription: Subscription | null = null
let artist_subscription: Subscription | null = null

const selectedIndexStore = useSelectedIndexStore()
const recentUuidStore = useRecentUuidStore()
const {artist: recentArtistUuid, album: recentAlbumUuid} = storeToRefs(recentUuidStore)
const recent_artist = ref<Artist>(await db.artists.get(recentArtistUuid.value) as Artist)
const albums: Ref<Album[], Album[]> = ref([])
const {album: selectedIndexes} = storeToRefs(selectedIndexStore) // 当前选中行
// @ts-ignore
const selectedIndex: Ref<number, number> = ref(selectedIndexes.value[recentArtistUuid.value] || 0)
const selectedAlbum = computed(() => albums?.value[selectedIndex.value])
const appendAlbum = ref<boolean>(false)
const newAlbum = ref<string>('')
const inputRef = ref()

const exists = computed(()=>{
  return newAlbum?.value.length == 0 || (albums.value.filter(v=>v.metas.indexOf(newAlbum.value) != -1).length > 0)
})

watch(selectedAlbum, () => {recentAlbumUuid.value = selectedAlbum.value?.uuid}, {immediate: true})

watch(recent_artist, async () => {
  albums.value = await db.albums.where('uuid').anyOf(recent_artist?.value.albums || []).toArray()
})

// 初始化实时查询
onMounted(() => {
  albums_subscription = liveQuery(async () => {
    return db.albums
        .where('uuid')
        .anyOf(recent_artist?.value.albums || [])
        .toArray();
  })
      .subscribe({
        next: (result) => {
          albums.value = result
        }
      })
  artist_subscription = liveQuery(async ()=>{
    return db.artists.get(recentArtistUuid.value) as PromiseExtended<Artist>
  })
      .subscribe({
        next: value => {
          recent_artist.value = value
        }
      })
})

// 组件卸载时清理
onUnmounted(() => {
  albums_subscription?.unsubscribe()
  artist_subscription?.unsubscribe()
  // @ts-ignore
  selectedIndexes.value[recentArtistUuid.value] = selectedIndex.value
})

async function appendAlbumMeta(meta: string) {
  await db.updateAlbum(selectedAlbum.value?.uuid, {metas: [...selectedAlbum.value?.metas, meta]})
}

async function removeAlbumMeta(meta: string) {
  await db.updateAlbum(selectedAlbum.value?.uuid, {metas: selectedAlbum.value?.metas.filter(v => v !== meta)})
}

async function updateAlbumMeta(oldMeta: string, newMeta: string) {
  await db.updateAlbum(selectedAlbum.value?.uuid, {metas: selectedAlbum.value?.metas.map(v => v === oldMeta ? newMeta : v)})
}

async function appendArtist(artistUuid: string) {
  await db.appendAlbumToArtist(selectedAlbum.value?.uuid, artistUuid)
}

async function removeArtist(artistUuid: string) {
  await db.removeAlbumFromArtist(selectedAlbum.value?.uuid, artistUuid)
}

async function startAppendAlbumFunc() {
  appendAlbum.value = true
  newAlbum.value = ''
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

async function appendAlbumFunc() {
  const album = new Album(newAlbum.value)
  await db.albums.add(album)
  await db.appendAlbumToArtist(album.uuid, recentArtistUuid.value)
  newAlbum.value = ''
  appendAlbum.value = false
}

async function removeAlbumFunc(albumUuid: string) {
  await db.removeAlbumFromArtist(albumUuid, recentArtistUuid.value)
}
</script>

<template>
  <!-- 「添加」弹窗 -->
  <el-dialog v-if="appendAlbum" v-model="appendAlbum" title="添加专辑">
    <el-row>
      <el-input ref="inputRef" v-model="newAlbum" :class="exists ? 'refuse':''" clearable/>
    </el-row>
    <template #footer>
      <el-button type="primary" @click="appendAlbumFunc" :disabled="exists" plain>确认
      </el-button>
      <el-button @click="appendAlbum = false" type="danger">取消</el-button>
    </template>
  </el-dialog>

  <el-row class="container">
    <el-col :span="10">
      <entity-list
          :entities="albums"
          :selected-index="selectedIndex"
          @on-index-change="v=>selectedIndex=v"
          @on-append="startAppendAlbumFunc"
          @on-remove="removeAlbumFunc"/>
    </el-col>
    <el-col id="meta" :span="14">
      <el-row>
        <artist-list
            :artists="selectedAlbum?.artists"
            @on-append="appendArtist"
            @on-remove="removeArtist"/>
      </el-row>
      <el-divider/>
      <el-row style="padding-top: 15px;">
        <meta-list
            :metas="selectedAlbum?.metas"
            @on-append="appendAlbumMeta"
            @on-remove="removeAlbumMeta"
            @on-update="updateAlbumMeta"/>
      </el-row>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.container {
  height: 100%;
  overflow: auto;

  .el-col {
    height: 100%;
    overflow-y: auto;

    .el-menu--vertical {
      height: 100%;
    }
  }
}

#meta {
  display: grid;
  grid-template-rows: 48% 4% 48%;

  .el-row {
    display: block;
    overflow: auto;
  }
}
</style>