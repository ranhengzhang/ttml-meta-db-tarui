<script setup lang="ts">
import {ElContainer} from "element-plus"
import icon_path from "./assets/Stuffed flatbread.png"
import {MoonNight, Sunrise} from "@element-plus/icons-vue";
import {open, save} from "@tauri-apps/plugin-dialog";
import { path } from "@tauri-apps/api";
import { platform } from "@tauri-apps/plugin-os";
import {readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {db} from "./database";

async function read() {
  try {
    const file: string | null = await open({filters: [{name: 'TTML元数据库', extensions: ['metadb']}]});
    let normalized: string
    if (!file) return;
    if (platform() !== "android" && platform() !== "ios") {
      normalized = (await path.normalize(file)).replace(/\\/gi, "/");
    } else {
      normalized = file
    }
    // 读取文件内容
    const contents = await readTextFile(normalized);

    // 解析JSON
    const jsonData = JSON.parse(contents);

    // 使用事务批量操作
    await db.transaction('rw', db.artists, db.albums, db.tracks, async () => {
      // 清空现有数据（可选，根据需求决定）
      // await Promise.all([
      //   db.artists.clear(),
      //   db.albums.clear(),
      //   db.tracks.clear()
      // ]);

      // 批量插入/更新数据
      await Promise.all([
        db.artists.bulkPut(jsonData.artists),
        db.albums.bulkPut(jsonData.albums),
        db.tracks.bulkPut(jsonData.tracks)
      ]);
    });
  } catch (error) {
    console.error('数据导入失败:', error);
  }
}

async function write() {
  try {
    const file: string | null = await save({filters: [{name: 'TTML元数据库', extensions: ['metadb']}]});
    let normalized: string
    if (!file) return;
    if (platform() !== "android" && platform() !== "ios") {
      normalized = (await path.normalize(file)).replace(/\\/gi, "/");
    } else {
      normalized = file
    }

    // 确保文件扩展名正确
    if (!normalized.endsWith('.metadb')) {
      normalized += '.metadb';
    }

    // 使用事务读取完整数据
    const exportData = await db.transaction('r', db.artists, db.albums, db.tracks, async () => {
      // 并行获取所有数据
      const [artists, albums, tracks] = await Promise.all([
        db.artists.toArray(),
        db.albums.toArray(),
        db.tracks.toArray()
      ]);

      // 构建导出数据结构
      return {
        artists: artists.map(a => ({ ...a })), // 创建纯对象副本
        albums: albums.map(a => ({ ...a })),
        tracks: tracks.map(t => ({ ...t }))
      };
    });

    // 序列化为JSON（带缩进格式化）
    const jsonString = JSON.stringify(exportData);

    // 写入文件
    await writeTextFile(normalized, jsonString);
  } catch (error) {
    console.error('数据导入失败：', error);
  }
}
</script>

<template>
  <el-container id="container">
    <el-header>
      <el-menu mode="horizontal" router>
        <el-sub-menu index="">
          <template #title>
            <el-text>
              <el-avatar
                  style="background-color: #00000000; vertical-align: middle"
                  :src="icon_path"
                  fit="fill"
                  size="small"/>
              TTML META DB
            </el-text>
          </template>
          <el-menu-item @click="read">
            <el-icon>
              <MoonNight/>
            </el-icon>
            导入
          </el-menu-item>
          <el-menu-item @click="write">
            <el-icon>
              <Sunrise/>
            </el-icon>
            导出
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/artists">Artists</el-menu-item>
        <el-menu-item index="/albums">Albums</el-menu-item>
        <el-menu-item index="/tracks">Tracks</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <Suspense>
        <router-view/>
      </Suspense>
    </el-main>
  </el-container>
</template>

<style lang="scss">
body, html, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.el-input.refuse {
  --el-input-focus-border-color: red;
  --el-input-hover-border-color: red;
  --el-input-border-color: red;
}

.el-container {
  height: 100%;
}

.el-menu-item {
  .el-text {
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

<style lang="scss" scoped>
.el-menu--popup {
  .el-menu-item {
    justify-content: center;
  }
}
</style>