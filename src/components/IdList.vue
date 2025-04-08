<script setup lang="ts">
import {Delete, Edit} from "@element-plus/icons-vue"
import {ref, watch, toRefs, nextTick, PropType} from "vue";
import {ElInput} from "element-plus";
import {Id, IdType} from "../types/id.ts";

const emit = defineEmits(['onAppend', 'onUpdate', 'onRemove'])
const props = defineProps({
  ids: Array as PropType<Id[]>
})
const {ids} = toRefs(props)
const appendId = ref<boolean>(false) // 是否显示「添加」对话框
const updateId = ref<boolean>(false) // 是否显示修改对话框
const newId = ref<Id>({ key: '', value: '' }) // 添加的值
const exists = ref<boolean>(false) // 要添加的值是否已经存在
let recent = -1
const inputRef = ref<InstanceType<typeof ElInput>>() // 更明确的类型声明

watch(newId, () => {
  exists.value = (ids?.value?.some(id=>id.value===newId.value?.value&&id.key===newId.value?.key) as boolean)
}, {deep: true})

function startAppendIdFunc() {
  appendId.value = true
  newId.value.key = ''
  newId.value.value = ''
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

function appendIdFunc() {
  emit('onAppend', newId.value)
  newId.value.key = ''
  newId.value.value = ''
  appendId.value = false
}

function startUpdateIdFunc(index: number) {
  recent = index
  newId.value.key = ids?.value?.[index].key as string
  newId.value.value = ids?.value?.[index].value as string
  updateId.value = true
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

function updateIdFunc() {
  emit('onUpdate', ids?.value?.[recent], newId.value)
  newId.value.key = ''
  newId.value.value = ''
  updateId.value = false
}
</script>

<template>
  <div id="root">
    <!-- 「添加」弹窗 -->
    <el-dialog v-if="appendId" v-model="appendId" title="添加别名">
      <el-tooltip content="重复的值" :trigger-keys="[]" :visible="exists">
        <el-row :gutter="8">
          <el-col :span="7">
            <el-select v-model="newId.key">
              <el-option v-for="type in IdType" :key="type" :label="type" :value="type"/>
            </el-select>
          </el-col>
          <el-col :span="17">
            <el-input ref="inputRef" :class="exists?'exists':''" v-model="newId.value" clearable/>
          </el-col>
        </el-row>
      </el-tooltip>
      <template #footer>
        <el-button type="primary" @click="appendIdFunc" :disabled="newId.key.length == 0 || newId.value.length == 0 || exists" plain>确认
        </el-button>
        <el-button @click="appendId = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <!-- 「编辑」弹窗 -->
    <el-dialog v-if="updateId" v-model="updateId" title="修改别名">
      <el-row :gutter="8">
        <el-col :span="7">
          <el-select v-model="newId.key">
            <el-option v-for="type in IdType" :key="type" :label="type" :value="type"/>
          </el-select>
        </el-col>
        <el-col :span="17">
          <el-input ref="inputRef" :class="exists?'exists':''" v-model="newId.value" clearable/>
        </el-col>
      </el-row>
      <template #footer>
        <el-button type="primary" @click="updateIdFunc" :disabled="newId?.value.length == 0 || exists" plain>确认
        </el-button>
        <el-button @click="updateId = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <el-scrollbar>
      <!-- 列出数据 -->
      <el-table :data="ids" class="ids" height="100%" table-layout="auto">
        <el-table-column label="Key">
          <template #default="scope">
            <el-text size="large">{{ scope.row.key }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="Value" style="display: flex;">
          <template #default="scope">
            <el-row>
              <el-col style="flex: 1;">
                <el-text size="large">{{ scope.row.value }}</el-text>
              </el-col>
              <el-col style="flex: 0 0 auto;">
                <!-- 「编辑」按钮 -->
                <el-button type="primary" size="small" :icon="Edit" circle @click="startUpdateIdFunc(scope.$index)"/>
                <!-- 「删除」按钮 -->
                <el-button type="danger" size="small" :icon="Delete" circle
                           @click="$emit('onRemove', scope.row)"/>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>

      <!-- 「添加」按钮 -->
      <el-row style="position: sticky; bottom: 0; z-index: 99">
        <el-col style="padding:10px 15px;">
          <el-button style="width: 100%;" @click="startAppendIdFunc" type="primary" plain>+</el-button>
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
  }
}

#root {
  overflow: auto;
  height: 100%;
  width: 100%;
}

:deep(.el-table) {
  width: 100%;

  .el-table__header-wrapper table, .el-table__body-wrapper table {
    width: 100% !important;
  }

  .el-table__body, .el-table__footer, .el-table__header {
    table-layout: fixed;
  }
}
</style>

<style>
.el-scrollbar__view:has(.el-table__body) {
  width: 100%;
}
</style>