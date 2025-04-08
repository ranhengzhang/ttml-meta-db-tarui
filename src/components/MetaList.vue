<script setup lang="ts">
import {Delete, Edit} from "@element-plus/icons-vue"
import {ref, watch, toRefs, nextTick} from "vue";
import {ElInput} from "element-plus";

const emit = defineEmits(['onAppend', 'onUpdate', 'onRemove'])
const props = defineProps(['metas'])
const {metas} = toRefs(props)
const appendMeta = ref<boolean>(false) // 是否显示「添加」对话框
const updateMeta = ref<boolean>(false) // 是否显示修改对话框
const newMeta = ref<string>('') // 添加的值
const exists = ref<boolean>(false) // 要添加的值是否已经存在
let recent = -1
const inputRef = ref<InstanceType<typeof ElInput>>() // 更明确的类型声明

watch(newMeta, () => {
  exists.value = metas?.value.includes(newMeta.value)
})

function startAppendMetaFunc() {
  newMeta.value = ''
  appendMeta.value = true
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

function appendMetaFunc() {
  emit('onAppend', newMeta.value)
  newMeta.value = ''
  appendMeta.value = false
}

function startUpdateMetaFunc(index: number) {
  recent = index;
  newMeta.value = metas?.value[index]
  updateMeta.value = true
  nextTick(() => {
    // 添加微任务队列延迟
    setTimeout(() => inputRef.value?.focus(), 100)
  })
}

function updateMetaFunc() {
  if (metas?.value)
    emit('onUpdate', metas?.value[recent], newMeta.value)
  newMeta.value = ''
  updateMeta.value = false
}
</script>

<template>
  <div id="root">
    <!-- 「添加」弹窗 -->
    <el-dialog v-if="appendMeta" v-model="appendMeta" title="添加别名">
      <el-tooltip content="重复的值" :trigger-keys="[]" :visible="exists">
        <el-row>
          <el-input ref="inputRef" :class="exists?'exists':''" v-model="newMeta" clearable/>
        </el-row>
      </el-tooltip>
      <template #footer>
        <el-button type="primary" @click="appendMetaFunc" :disabled="newMeta.length == 0 || exists" plain>确认
        </el-button>
        <el-button @click="appendMeta = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <!-- 「编辑」弹窗 -->
    <el-dialog v-if="updateMeta" v-model="updateMeta" title="修改别名">
      <el-row>
        <el-input ref="inputRef" :class="(newMeta.length == 0 || exists)?'refuse':''" v-model="newMeta" clearable/>
      </el-row>
      <template #footer>
        <el-button type="primary" @click="updateMetaFunc" :disabled="newMeta.length == 0 || exists" plain>确认
        </el-button>
        <el-button @click="updateMeta = false" type="danger">取消</el-button>
      </template>
    </el-dialog>

    <el-scrollbar>
      <!-- 列出数据 -->
      <el-row v-for="(meta, index) in metas || []" :key="meta">
        <el-card>
          <el-row>
            <el-col class="names">
              <el-text size="large">{{ meta }}</el-text>
            </el-col>
            <el-col class="buttons">
              <!-- 「编辑」按钮 -->
              <el-button type="primary" size="small" :icon="Edit" circle @click="startUpdateMetaFunc(index)"/>
              <!-- 「删除」按钮 -->
              <el-button type="danger" size="small" :icon="Delete" circle @click="$emit('onRemove', meta)"/>
            </el-col>
          </el-row>
        </el-card>
      </el-row>

      <!-- 「添加」按钮 -->
      <el-row style="position: sticky; bottom: 0;">
        <el-col style="padding:10px 15px;">
          <el-button style="width: 100%;" @click="startAppendMetaFunc" type="primary" plain>+</el-button>
        </el-col>
      </el-row>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
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

#root {
  overflow: auto;
  height: 100%;
}
</style>