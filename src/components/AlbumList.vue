<script setup lang="ts">
import {Ref, toRefs, watch, ref} from "vue";
import {db} from "../database";
import {Delete} from "@element-plus/icons-vue";
import {Album} from "../types/album.ts";

const props = defineProps({
  albums: {
    type: Array<string>,
    default (){return[]}
  }
})
const emit = defineEmits(['onAppend', 'onRemove'])
const {albums: album_uuid_list} = toRefs(props)
const albums: Ref<Album[], Album[]> = ref([])
const albumList = await db.albums.toArray()
watch(album_uuid_list, async () => {
  albums.value = await Promise.all(album_uuid_list?.value.map(async v => await db.albums.get(v))) as Album[]
}, {immediate: true})
const newAlbum = ref<Album>()
const appendAlbum = ref(false)

function startAppendAlbumFunc() {
  newAlbum.value = undefined
  appendAlbum.value = true
}

function appendAlbumFunc() {
  emit('onAppend', newAlbum.value?.uuid)
  newAlbum.value = undefined
  appendAlbum.value = false
}
</script>

<template>
  <div id="root">
    <!-- 「添加」弹窗 -->
    <el-dialog v-if="appendAlbum" v-model="appendAlbum" title="添加专辑">
      <el-row>
        <el-select v-model="newAlbum" value-key="uuid">
          <el-option v-for="album in albumList" :key="album.uuid" :value="album" :label="album.metas.join(' / ')"/>
        </el-select>
      </el-row>
      <template #footer>
        <el-button type="primary" @click="appendAlbumFunc" :disabled="!newAlbum || album_uuid_list.indexOf(newAlbum.uuid) != -1" plain>确认
        </el-button>
        <el-button @click="appendAlbum = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <el-scrollbar>
      <el-row v-for="(album) in albums" :key="album.uuid">
        <el-card>
          <el-row>
            <el-col class="names">
              <el-text size="large">{{ album?.metas.length ? album?.metas[0] : album?.uuid }}
              </el-text>
            </el-col>
            <el-col class="buttons">
              <!-- 「删除」按钮 -->
              <el-button type="danger" size="small" :icon="Delete" circle @click="$emit('onRemove', album.uuid)"/>
            </el-col>
          </el-row>
        </el-card>
      </el-row>

      <!-- 「添加」按钮 -->
      <el-row style="position: sticky; bottom: 0;">
        <el-col style="padding:10px 15px;">
          <el-button style="width: 100%;" @click="startAppendAlbumFunc" type="primary" plain>+</el-button>
        </el-col>
      </el-row>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.el-card {
  width: 100%;
  margin: 10px 15px;
  box-shadow: var(--el-box-shadow-lighter);

  .el-row {
    display: flex;
    gap: 8px;

    .names {
      flex: 1;
    }

    .buttons {
      //flex-shrink: 0;
      flex: 0 0 auto;
      display: flex;
      //gap: 8px;
      .el-button {
        flex-shrink: 0;
        padding: 6px 12px;
      }
    }
  }
}

.el-input.exists {
  --el-input-focus-border-color: red;
  --el-input-hover-border-color: red;
  --el-input-border-color: red;
}

#root {
  overflow: auto;
  height: 100%;
}
</style>