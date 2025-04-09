<script setup lang="ts">
import {computed, ref, onMounted, onUnmounted, watch, Ref, nextTick} from "vue";
import {useRecentUuidStore, useSelectedIndexStore} from "../store";
import {storeToRefs} from "pinia";
import MetaList from "../components/MetaList.vue";
import {db} from "../database";
import {liveQuery, Subscription} from "dexie";
import {Artist} from "../types/artist.ts";
import EntityList from "../components/EntityList.vue";
import ArtistList from "../components/ArtistList.vue";

let subscription: Subscription | null = null

const selectedIndexStore = useSelectedIndexStore()
const recentUuidStore = useRecentUuidStore()
const artists: Ref<Artist[], Artist[]> = ref(await db.artists.toArray())
const {artist: selectedIndex} = storeToRefs(selectedIndexStore) // 当前选中行
const {artist: recentArtistUuid} = storeToRefs(recentUuidStore)
const selectedArtist = computed(() => artists?.value[selectedIndex.value])
const appendArtist = ref(false)
const newArtist = ref('')
const inputRef = ref()

watch(selectedArtist, () => recentArtistUuid.value = selectedArtist.value?.uuid, {immediate: true})

// 初始化实时查询
onMounted(() => {
  subscription = liveQuery(() => db.artists.toArray())
      .subscribe({
        next: (result) => {
          artists.value = result
        },
      })
})

// 组件卸载时清理
onUnmounted(() => {
  subscription?.unsubscribe()
})

async function appendArtistMeta(meta: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {metas: [...selectedArtist.value?.metas, meta]})
}

async function removeArtistMeta(meta: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {metas: selectedArtist.value?.metas.filter(v => v !== meta)})
}

async function updateArtistMeta(oldMeta: string, newMeta: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {metas: selectedArtist.value?.metas.map(v => v === oldMeta ? newMeta : v)})
}

function startAppendArtistFunc() {
  newArtist.value = ''
  appendArtist.value = true
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

async function appendArtistFunc() {
  await db.artists.add(new Artist(newArtist.value))
  newArtist.value = ''
  appendArtist.value = false
}

async function removeArtistFunc(artistUuid: string) {
  await db.removeArtist(artistUuid)
}

async function appendMember(artistUuid: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {members: [...selectedArtist.value?.members, artistUuid]})
}

async function removeMember(artistUuid: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {members: selectedArtist.value?.members.filter(v => v !== artistUuid)})
}
</script>

<template>
  <!-- 「添加」弹窗 -->
  <el-dialog v-if="appendArtist" v-model="appendArtist" title="添加歌手">
    <el-row>
      <el-input ref="inputRef" v-model="newArtist" :class="newArtist.length == 0 ? 'refuse':''" clearable/>
    </el-row>
    <template #footer>
      <el-button type="primary" @click="appendArtistFunc" :disabled="newArtist.length == 0" plain>确认
      </el-button>
      <el-button @click="appendArtist = false" type="danger">取消</el-button>
    </template>
  </el-dialog>

  <el-row class="container">
    <el-col :span="10">
      <entity-list
          :entities="artists"
          :selected-index="selectedIndex"
          @on-index-change="v=>selectedIndex=v"
          @on-append="startAppendArtistFunc"
          @on-remove="removeArtistFunc"/>
    </el-col>
    <el-col :span="14" style="display: grid; grid-template-rows: 48% 4% 48%;">
      <el-row>
        <artist-list
            :artists="selectedArtist?.members"
            @on-append="appendMember"
            @on-remove="removeMember"/>
      </el-row>
      <el-divider/>
      <el-row>
        <meta-list
            :metas="selectedArtist?.metas"
            @on-append="appendArtistMeta"
            @on-remove="removeArtistMeta"
            @on-update="updateArtistMeta"/>
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

    .el-row {
      height: 100%;
      width: 100%;

      #root {
        width: 100%;
      }
    }
  }
}
</style>