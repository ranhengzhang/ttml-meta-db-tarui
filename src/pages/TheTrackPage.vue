<script setup lang="ts">
import MetaList from "../components/MetaList.vue";
import EntityList from "../components/EntityList.vue";
import ArtistList from "../components/ArtistList.vue";
import IdList from "../components/IdList.vue";
import AlbumList from "../components/AlbumList.vue";
import {liveQuery, PromiseExtended, Subscription} from "dexie";
import {useRecentUuidStore, useSelectedIndexStore} from "../store";
import {computed, h, nextTick, onMounted, onUnmounted, Ref, ref, watch} from "vue";
import {db} from "../database";
import {Album} from "../types/album.ts";
import {storeToRefs} from "pinia";
import {Track} from "../types/track.ts";
import {Id} from "../types/id.ts";
import {DocumentCopy} from "@element-plus/icons-vue"
import {writeText} from "@tauri-apps/plugin-clipboard-manager";
import {ElMessage} from "element-plus";

let tracks_subscription: Subscription | null = null
let album_subscription: Subscription | null = null

const selectedIndexStore = useSelectedIndexStore()
const recentUuidStore = useRecentUuidStore()
const {album: recentAlbumUuid, track: recentTrackUuid} = storeToRefs(recentUuidStore)
const recent_album = ref<Album>(await db.albums.get(recentAlbumUuid.value) as Album)
const tracks: Ref<Track[], Track[]> = ref([])
const {track: selectedIndexes} = storeToRefs(selectedIndexStore) // 当前选中行
// @ts-ignore
const selectedIndex: Ref<number, number> = ref(selectedIndexes.value[recentAlbumUuid.value] || 0)
const selectedTrack = computed(() => tracks?.value[selectedIndex.value])
const appendTrack = ref<boolean>(false)
const newTrack = ref<string>('')
const inputRef = ref()

const exists = computed(() => {
  return newTrack?.value.length == 0 || (tracks.value.filter(v => v.metas.indexOf(newTrack.value) != -1).length > 0)
})

watch(selectedTrack, () => {
  recentTrackUuid.value = selectedTrack.value?.uuid
}, {immediate: true})

watch(recent_album, async () => {
  tracks.value = await db.tracks.where('uuid').anyOf(recent_album?.value.tracks || []).toArray()
})

// 初始化实时查询
onMounted(() => {
  tracks_subscription = liveQuery(async () => {
    return db.tracks
        .where('uuid')
        .anyOf(recent_album?.value.tracks || [])
        .toArray();
  })
      .subscribe({
        next: (result) => {
          tracks.value = result
        }
      })
  album_subscription = liveQuery(async () => {
    return db.albums.get(recentAlbumUuid.value) as PromiseExtended<Album>
  })
      .subscribe({
        next: value => {
          recent_album.value = value
        }
      })
})

// 组件卸载时清理
onUnmounted(() => {
  tracks_subscription?.unsubscribe()
  album_subscription?.unsubscribe()
  // @ts-ignore
  selectedIndexes.value[recentAlbumUuid.value] = selectedIndex.value
})

async function appendAlbum(albumUuid: string) {
  await db.appendTrackToAlbum(selectedTrack.value?.uuid, albumUuid)
}

async function removeAlbum(albumUuid: string) {
  await db.removeTrackFromAlbum(selectedTrack.value?.uuid, albumUuid)
}

async function startAppendTrackFunc() {
  appendTrack.value = true
  newTrack.value = ''
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

async function appendTrackFunc() {
  const track = new Track(newTrack.value)
  await db.tracks.add(track)
  await db.appendTrackToAlbum(track.uuid, recentAlbumUuid.value)
  newTrack.value = ''
  appendTrack.value = false
}

async function removeTrackFunc(trackUuid: string) {
  await db.removeTrackFromAlbum(trackUuid, recentAlbumUuid.value)
}

async function appendFeat(featUuid: string) {
  await db.appendFeatToTrack(featUuid, selectedTrack.value?.uuid)
}

async function removeFeat(featUuid: string) {
  await db.removeFeatFromTrack(featUuid, selectedTrack.value?.uuid)
}

async function appendTrackMeta(meta: string) {
  await db.updateTrack(selectedTrack.value?.uuid, {metas: [...selectedTrack.value?.metas, meta]})
}

async function removeTrackMeta(meta: string) {
  await db.updateTrack(selectedTrack.value?.uuid, {metas: selectedTrack.value?.metas.filter(v => v !== meta)})
}

async function updateTrackMeta(oldMeta: string, newMeta: string) {
  await db.updateTrack(selectedTrack.value?.uuid, {metas: selectedTrack.value?.metas.map(v => v === oldMeta ? newMeta : v)})
}

async function appendIdFunc(id: Id) {
  await db.updateTrack(selectedTrack.value?.uuid, {ids: [...selectedTrack.value?.ids, id]})
}

async function removeIdFunc(id: Id) {
  await db.updateTrack(selectedTrack.value?.uuid, {ids: selectedTrack.value?.ids.filter(v => v.key !== id.key && v.value !== id.value)})
}

async function updateIdFunc(oldId: Id, newId: Id) {
  await db.updateTrack(selectedTrack.value?.uuid, {ids: selectedTrack.value?.ids.map(v => v.key === oldId.key && v.value === oldId.value ? newId : v)})
}

async function copyXml() {
  const xml: string = await db.copyXml(selectedTrack.value?.uuid)
  // 将内容写到剪贴板
  await writeText(xml);
  ElMessage({
    message: h('p', null, [
      h('code', null, `${selectedTrack.value?.uuid}`),
      h('span', null, ` - ${selectedTrack.value?.metas.join(' \ ')}`)
    ]),
    type: 'success'
  })
}
</script>

<template>
  <!-- 「添加」弹窗 -->
  <el-dialog v-if="appendTrack" v-model="appendTrack" title="添加单曲">
    <el-row>
      <el-input ref="inputRef" v-model="newTrack" :class="exists ? 'refuse':''" clearable/>
    </el-row>
    <template #footer>
      <el-button type="primary" @click="appendTrackFunc" :disabled="exists" plain>确认
      </el-button>
      <el-button @click="appendTrack = false" type="danger">取消</el-button>
    </template>
  </el-dialog>

  <el-row class="container">
    <el-col :span="10" style="grid-template-rows: 56% 4% 40%">
      <el-row>
        <el-button
            @click="copyXml"
            :icon="DocumentCopy"
            :disabled="!selectedTrack"
            style="margin:0 15px 10px; width: 100%;"
            type="success" plain/>
        <entity-list
            :entities="tracks"
            :selected-index="selectedIndex"
            @on-index-change="v=>selectedIndex=v"
            @on-append="startAppendTrackFunc"
            @on-remove="removeTrackFunc"/>
      </el-row>
      <el-divider/>
      <el-row>
        <id-list
            :ids="selectedTrack?.ids"
            @on-append="appendIdFunc"
            @on-remove="removeIdFunc"
            @on-update="updateIdFunc"/>
      </el-row>
    </el-col>
    <el-col id="meta" :span="14" style="grid-template-rows: 56% 4% 40%; grid-template-columns: 1fr 1fr;">
      <el-row style="border-right: 1px solid var(--el-border-color)">
        <album-list
            :albums="selectedTrack?.albums"
            @on-append="appendAlbum"
            @on-remove="removeAlbum"/>
      </el-row>
      <el-row>
        <artist-list
            :artists="selectedTrack?.feats"
            @on-append="appendFeat"
            @on-remove="removeFeat"/>
      </el-row>
      <el-divider style="grid-column: 1 / 3;"/>
      <el-row style="padding-top: 15px; grid-column: 1 / 3;">
        <meta-list
            :metas="selectedTrack?.metas"
            @on-append="appendTrackMeta"
            @on-remove="removeTrackMeta"
            @on-update="updateTrackMeta"/>
      </el-row>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.container {
  height: 100%;

  .el-col:first-child {
    border-right: 1px solid var(--el-border-color);
  }

  .el-col {
    height: 100%;
    display: grid;
  }

  .el-col > .el-row {
    width: 100%;

    .el-menu {
      width: 100%;
      border-right: none;
    }
  }
}

#meta {
  .el-row {
    width: 100%;

    #root {
      width: 100%;
    }
  }
}
</style>