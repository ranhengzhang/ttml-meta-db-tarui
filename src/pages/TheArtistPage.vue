<script setup lang="ts">
import {computed, ref, onMounted, onUnmounted} from "vue";
import {useRecentStore} from "../store";
import {storeToRefs} from "pinia";
import MetaList from "../components/MetaList.vue";
import {db} from "../database";
import {liveQuery, Subscription} from "dexie";

let subscription: Subscription|null = null

const recent = useRecentStore()
const artists = ref(await db.artists.toArray())
const {artist: selected} = storeToRefs(recent) // 当前选中行
const selectedArtist = computed(()=>artists?.value[selected.value])

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
  await db.updateArtist(selectedArtist.value?.uuid, {metas: selectedArtist.value?.metas.filter(v=>v!==meta)})
}

async function updateArtistMeta(oldMeta: string, newMeta: string) {
  await db.updateArtist(selectedArtist.value?.uuid, {metas: selectedArtist.value?.metas.map(v=>v===oldMeta?newMeta:v)})
}
</script>

<template>
  <el-row class="container">
    <el-col :span="10">
      <el-menu>
        <el-menu-item v-for="(indexedArtist, index) in artists" :index="String(index)" @click="selected=index">
          <el-text size="large">{{indexedArtist?.metas.length ? indexedArtist.metas[0] : indexedArtist.uuid}}</el-text>
        </el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="14">
      <meta-list :metas="selectedArtist?.metas" @append="appendArtistMeta" @remove="removeArtistMeta" @update="updateArtistMeta"/>
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
    .el-menu--vertical{
      height: 100%;
    }
  }
}
</style>