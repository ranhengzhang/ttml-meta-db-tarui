<script setup lang="ts">
import { reactive } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { ElContainer } from "element-plus"
import icon_path from "./assets/Stuffed flatbread.png";
</script>

<template>
  <el-container id="container">
    <el-header>
      <el-menu mode="horizontal">
        <el-sub-menu>
          <template #title>
            <el-text>
              <el-avatar
                  style="background-color: #00000000; vertical-align: middle"
                  :src="icon_path"
                  fit="fill"
                  size="small"/> TTML META DB
            </el-text>
          </template>
          <el-menu-item>打开</el-menu-item>
          <el-menu-item>保存</el-menu-item>
          <el-menu-item>另存为</el-menu-item>
        </el-sub-menu>
        <el-menu-item route="/TheArtistPage">Artists</el-menu-item>
        <el-menu-item route="">Albums</el-menu-item>
        <el-menu-item route="">Tracks</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<style>
body, html, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.el-container {
  height: 100%;
}
</style>

<style scoped>
</style>