<script setup lang="ts">
import {Ref, toRefs, watch, ref} from "vue";
import {db} from "../database";
import {Delete} from "@element-plus/icons-vue";
import {Artist} from "../types/artist.ts";

const props = defineProps({
  artists: {
    type: Array<string>,
    default() {
      return []
    }
  }
})
const emit = defineEmits(['onAppend', 'onRemove'])
const {artists: artist_uuid_list} = toRefs(props)
const artists: Ref<Artist[], Artist[]> = ref([])
const artistList = await db.artists.toArray()
watch(artist_uuid_list, async () => {
  artists.value = await Promise.all(artist_uuid_list?.value.map(async v => await db.artists.get(v))) as Artist[]
}, {immediate: true})
const newArtist = ref<Artist>()
const appendArtist = ref(false)

function startAppendArtistFunc() {
  newArtist.value = undefined
  appendArtist.value = true
}

function appendArtistFunc() {
  emit('onAppend', newArtist.value?.uuid)
  newArtist.value = undefined
  appendArtist.value = false
}
</script>

<template>
  <div id="root">
    <!-- 「添加」弹窗 -->
    <el-dialog v-if="appendArtist" v-model="appendArtist" title="添加歌手">
      <el-row>
        <el-select v-model="newArtist" value-key="uuid">
          <el-option v-for="artist in artistList" :key="artist.uuid" :value="artist" :label="artist.metas.join(' / ')"/>
        </el-select>
      </el-row>
      <template #footer>
        <el-button type="primary" @click="appendArtistFunc"
                   :disabled="!newArtist || artist_uuid_list.indexOf(newArtist.uuid) != -1" plain>确认
        </el-button>
        <el-button @click="appendArtist = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <el-scrollbar>
      <el-row v-for="(artist) in artists" :key="artist.uuid">
        <el-card>
          <el-row>
            <el-col class="names">
              <el-text size="large">{{ artist?.metas.length ? artist?.metas[0] : artist?.uuid }}
              </el-text>
            </el-col>
            <el-col class="buttons">
              <!-- 「删除」按钮 -->
              <el-button type="danger" size="small" :icon="Delete" circle @click="$emit('onRemove', artist.uuid)"/>
            </el-col>
          </el-row>
        </el-card>
      </el-row>

      <!-- 「添加」按钮 -->
      <el-row style="position: sticky; bottom: 0;">
        <el-col style="padding:10px 15px;">
          <el-button style="width: 100%;" @click="startAppendArtistFunc" type="primary" plain>+</el-button>
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