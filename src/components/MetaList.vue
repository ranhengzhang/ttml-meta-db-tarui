<script setup lang="ts">
import {Delete, Edit} from "@element-plus/icons-vue"
import {ref, watch, toRefs} from "vue";

const props = defineProps(['metas'])
const {metas} = toRefs(props)
const addMeta = ref<boolean>(false) // 是否显示「添加」对话框
const editMeta = ref<boolean>(false) // 是否显示修改对话框
const newMeta = ref<string>('') // 添加的值
const exists = ref<boolean>(false) // 要添加的值是否已经存在
let recent = -1

watch(newMeta, () => {exists.value = metas?.value.includes(newMeta.value)})

function startAddMetaFunc(){
  newMeta.value = ''
  addMeta.value = true
}

function addMetaFunc(){
  metas?.value.push(newMeta.value)
  newMeta.value = ''
  addMeta.value = false
}

function startUpdateMetaFunc(index: number){
  recent = index;
  newMeta.value = metas?.value[index]
  editMeta.value = true
}

function updateMetaFunc(){
  if (metas?.value)
    metas.value[recent] = newMeta.value
  newMeta.value = ''
  editMeta.value = false
}
</script>

<template>
  <!-- 「添加」弹窗 -->
  <el-dialog v-if="addMeta" v-model="addMeta" title="添加别名">
    <el-tooltip content="重复的值" :trigger-keys="[]" :visible="exists">
      <el-row><el-input :class="exists?'exists':''" v-model="newMeta" clearable/></el-row>
    </el-tooltip>
    <template #footer>
      <el-button type="primary" @click="addMetaFunc" :disabled="newMeta.length == 0 || exists" plain>确认</el-button>
      <el-button @click="addMeta = false" type="danger">取消</el-button>
    </template>
  </el-dialog>

  <!-- 「编辑」弹窗 -->
  <el-dialog v-if="editMeta" v-model="editMeta" title="修改别名">
    <el-row><el-input :class="(newMeta.length == 0 || exists)?'exists':''" v-model="newMeta" clearable/></el-row>
    <template #footer>
      <el-button type="primary" @click="updateMetaFunc" :disabled="newMeta.length == 0 || exists" plain>确认</el-button>
      <el-button @click="editMeta = false" type="danger">取消</el-button>
    </template>
  </el-dialog>

  <!-- 列出数据 -->
  <el-row v-for="(meta, index) in metas || []">
    <el-card>
      <el-row>
        <el-col class="names">
          <el-text size="large">{{meta}}</el-text>
        </el-col>
        <el-col class="buttons">
          <!-- 「编辑」按钮 -->
          <el-button type="primary" size="small" :icon="Edit" circle @click="startUpdateMetaFunc(index)"/>
          <!-- 「删除」按钮 -->
          <el-button type="danger" size="small" :icon="Delete" circle @click="metas.splice(index,1)"/>
        </el-col>
      </el-row>
    </el-card>
  </el-row>

<!-- 「添加」按钮 -->
  <el-row>
    <el-col style="padding:10px 15px;">
      <el-affix position="bottom" :offset="20">
        <el-button style="width: 100%;" @click="startAddMetaFunc" type="primary" plain>+</el-button>
      </el-affix>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.el-card {
  width: 100%;
  margin: 10px 15px;
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
</style>