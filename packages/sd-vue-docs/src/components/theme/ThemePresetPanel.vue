<script setup lang="ts">
  import { themePresets } from './theme-playground';

  defineProps<{ preset: string }>();
  const emit = defineEmits<{ select: [key: string] }>();
</script>

<template>
  <div class="preset-panel">
    <h2>选择一个起点</h2>
    <p>选一个接近的风格，下一步再换成你的品牌色。</p>
    <sd-radio-group
      class="preset-list"
      :model-value="preset"
      aria-label="选择一个起点"
      @change="emit('select', String($event))"
    >
      <sd-radio
        v-for="item in themePresets"
        :key="item.key"
        class="preset-option"
        :value="item.key"
      >
        <template #radio>
          <sd-config-provider :theme="item.theme" :theme-mode="item.mode">
            <div class="preset-sample" inert aria-hidden="true">
              <sd-button type="primary" size="small">主要操作</sd-button>
              <sd-tag color="green" size="small">已完成</sd-tag>
              <sd-input size="small" placeholder="输入内容" />
            </div>
          </sd-config-provider>
          <strong>{{ item.name }}</strong>
          <span>{{ item.summary }}</span>
        </template>
      </sd-radio>
    </sd-radio-group>
  </div>
</template>

<style scoped lang="scss">
  .preset-panel,
  .preset-list {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-weight: 600;
    font-size: 20px;
  }

  p,
  .preset-option > span {
    margin: 0;
    color: var(--sl-color-gray-2);
    font-size: 13px;
  }

  .preset-option {
    position: relative;
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 6px;
    cursor: pointer;
  }

  .preset-list .preset-option {
    margin-right: 0;
  }

  .preset-option:has(:checked) {
    border-color: var(--sl-color-accent);
    outline: 1px solid var(--sl-color-accent);
  }

  .preset-option:focus-within {
    outline: 2px solid var(--sl-color-accent);
    outline-offset: 3px;
  }

  .preset-sample {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding-right: 24px;
    pointer-events: none;
  }

  .preset-sample :deep(.sd-input-wrapper) {
    width: 100%;
  }
</style>
