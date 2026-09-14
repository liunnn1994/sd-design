<template>
  <div>
    <sd-space class="sd:mb-2">
      <sd-button size="small" @click="atEnd = !atEnd">切换面板位置</sd-button>
      <sd-button size="small" @click="collapsed = !collapsed">{{
        collapsed ? '展开' : '收起'
      }}</sd-button>
    </sd-space>
    <div class="sd:h-75 sd:border sd:border-solid sd:rounded"
      ><sd-panel-group>
        <template v-for="item in order" :key="item">
          <sd-panel
            v-if="item === 'sized'"
            v-model:size="width"
            v-model:collapsed="collapsed"
            :min-size="100"
            max-size="60%"
            class="sd:p-2"
          >
            可重排面板：{{ width }}px
          </sd-panel>
          <sd-panel-separator v-else-if="item === 'separator'" aria-label="调整侧栏大小">
            <span class="custom-grip" aria-hidden="true">⋮</span>
          </sd-panel-separator>
          <sd-panel v-else class="sd:p-2">填充区域</sd-panel>
        </template>
      </sd-panel-group></div
    >
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  const width = ref(240);
  const collapsed = ref(false);
  const atEnd = ref(false);
  const order = computed(() =>
    atEnd.value ? ['fill', 'separator', 'sized'] : ['sized', 'separator', 'fill'],
  );
</script>

<style scoped lang="scss">
  .custom-grip {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
</style>
