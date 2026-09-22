<script setup lang="ts">
  import type { SdThemeConfig, SdThemeSeed } from '@sdata/web-vue';
  const { theme } = defineProps<{ theme: SdThemeConfig }>();
  const emit = defineEmits<{ change: [theme: SdThemeConfig] }>();
  const colors = [
    { key: 'primary', label: '品牌主色', value: '#165dff' },
    { key: 'success', label: '成功色', value: '#00b42a' },
    { key: 'warning', label: '警告色', value: '#ff7d00' },
    { key: 'danger', label: '危险色', value: '#f53f3f' },
  ] as const;
  const sizes = [
    { key: 'radius', label: '基础圆角', value: 4, min: 0 },
    { key: 'fontSize', label: '正文字号', value: 14, min: 8 },
    { key: 'controlHeight', label: '控件高度', value: 32, min: 16 },
  ] as const;
  function set(key: keyof SdThemeSeed, value: string | number | undefined) {
    // sd-color-picker 清空时 emit ''，视为"跟随默认"，否则导出的空字符串
    // 过不了导入校验（必须是六位十六进制颜色）。
    const next = value === '' ? undefined : value;
    const seed = { ...theme.seed, [key]: next };
    if (next === undefined) delete seed[key];
    emit('change', { ...theme, seed });
  }
  function setNumber(key: keyof SdThemeSeed, min: number, raw: string | number | null | undefined) {
    // 清空输入恢复"跟随默认"（删除该 seed），而不是钳到最小值。
    if (raw === '' || raw == null) return set(key, undefined);
    set(key, Math.max(min, Math.min(256, Number(raw))));
  }
</script>

<template>
  <div class="seed-panel">
    <p>从品牌色、字号与圆角开始，自动生成配套色阶和尺寸。</p>
    <div
      v-for="field in colors"
      :key="field.key"
      class="seed-field"
      :data-testid="`seed-${field.key}`"
    >
      <span>{{ field.label }}</span>
      <sd-color-picker
        format="HEX"
        :model-value="theme.seed?.[field.key] ?? field.value"
        @change="set(field.key, $event)"
      />
      <sd-button
        size="mini"
        :disabled="theme.seed?.[field.key] === undefined"
        @click="set(field.key, undefined)"
        >重置</sd-button
      >
    </div>
    <div v-for="field in sizes" :key="field.key" class="seed-field">
      <label :for="`seed-${field.key}`">{{ field.label }}</label>
      <sd-input-number
        :input-attrs="{ 'id': `seed-${field.key}`, 'aria-label': field.label }"
        :min="field.min"
        :max="256"
        :model-value="theme.seed?.[field.key] ?? field.value"
        @change="setNumber(field.key, field.min, $event)"
        ><template #suffix>px</template></sd-input-number
      >
      <sd-button
        size="mini"
        :disabled="theme.seed?.[field.key] === undefined"
        @click="set(field.key, undefined)"
        >重置</sd-button
      >
    </div>
    <sd-alert v-if="Object.keys(theme.tokens ?? {}).length" type="info"
      >高级模式的显式 token 会覆盖基础派生值；重置对应 token 后恢复跟随。</sd-alert
    >
  </div>
</template>

<style scoped lang="scss">
  .seed-panel {
    display: grid;
    gap: 20px;
  }

  .seed-panel p {
    color: var(--sl-color-gray-2);
    font-size: 13px;
  }

  .seed-field {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }
</style>
