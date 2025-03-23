<script setup lang="ts">
import {computed} from "vue";
import {useDatabaseStore, useRecentStore} from "../store";
import {storeToRefs} from "pinia";
import MetaList from "../components/MetaList.vue";

const database = useDatabaseStore()
const recent = useRecentStore()
const {artists} = storeToRefs(database)
const {artist: selected} = storeToRefs(recent) // 当前选中行
const selectedArtist = computed(()=>artists?.value[selected.value])
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
      <meta-list :metas="selectedArtist?.metas"/>
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