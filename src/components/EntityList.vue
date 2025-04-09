<script setup lang="ts">
import {toRefs} from "vue";

const emit = defineEmits(['onIndexChange', 'onAppend', 'onRemove'])
const props = defineProps(['entities', 'selectedIndex'])
const {entities, selectedIndex} = toRefs(props)
</script>

<template>
  <el-menu :default-active="String(selectedIndex)">
    <el-scrollbar>
      <el-menu-item v-for="(indexedEntity, index) in entities" :key="indexedEntity.uuid" :index="String(index)"
                    @click="emit('onIndexChange', index)">
        <el-text size="large" tag="b">{{
            indexedEntity?.metas.length ? indexedEntity.metas[0] : indexedEntity.uuid
          }}
        </el-text>
      </el-menu-item>
      <el-row class="buttons">
        <el-button style="width: 100%; padding: 10px 15px" type="danger"
                   @click="emit('onRemove', entities[selectedIndex].uuid)" plain>-
        </el-button>
        <el-button style="width: 100%; padding: 10px 15px" type="primary" @click="emit('onAppend')" plain>+</el-button>
      </el-row>
    </el-scrollbar>
  </el-menu>
</template>

<style scoped lang="scss">
.el-menu--vertical {
  height: 100%;
}

.buttons {
  display: grid;
  gap: 10px;
  padding: 10px 15px;
  position: sticky;
  bottom: 0;
  grid-template-columns: 1fr 1fr;

  .el-button {
    margin: 0;
  }
}
</style>