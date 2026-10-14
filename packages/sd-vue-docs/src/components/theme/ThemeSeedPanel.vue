<script setup lang="ts">
  import type { SdThemeConfig, SdThemeSeed } from '@sdata/web-vue';

  import { computed } from 'vue';
  const { theme } = defineProps<{ theme: SdThemeConfig }>();
  const emit = defineEmits<{ change: [theme: SdThemeConfig] }>();
  const colors = [
    { label: '蓝色', value: '#165dff' },
    { label: '青色', value: '#14b8a6' },
    { label: '紫色', value: '#8b5cf6' },
    { label: '橙色', value: '#f97316' },
  ];
  const radiusOptions = [
    { label: '直角', value: 0 },
    { label: '微圆', value: 4 },
    { label: '圆润', value: 12 },
  ];
  const textOptions = [
    { label: '小', value: 12 },
    { label: '标准', value: 14 },
    { label: '大', value: 16 },
  ];
  const densityOptions = [
    { label: '紧凑', value: 28, spacing: 12 },
    { label: '标准', value: 32, spacing: 16 },
    { label: '宽松', value: 40, spacing: 20 },
  ];
  const density = computed(() =>
    theme.algorithm?.includes('compact') ? 28 : (theme.seed?.controlHeight ?? 32),
  );
  const statusColors = [
    { key: 'success', label: '成功', value: '#00b42a' },
    { key: 'warning', label: '提醒', value: '#ff7d00' },
    { key: 'danger', label: '错误', value: '#f53f3f' },
  ] as const;
  const sizes = [
    { key: 'radius', label: '基础圆角', value: 4, min: 0 },
    { key: 'fontSize', label: '正文字号', value: 14, min: 8 },
    { key: 'controlHeight', label: '控件高度', value: 32, min: 16 },
  ] as const;
  function set(key: keyof SdThemeSeed, value: string | number | undefined) {
    const next = value === '' ? undefined : value;
    const seed = { ...theme.seed, [key]: next };
    if (next === undefined) delete seed[key];
    // Visual choices replace matching global overrides, including preset values.
    const tokens = { ...theme.tokens };
    for (const name of Object.keys(tokens)) {
      if (
        (key === 'radius' && /^border-radius-(small|medium|large)$/.test(name)) ||
        (key === 'fontSize' && /^font-size-body-[123]$/.test(name)) ||
        (key === 'controlHeight' && /^size-(mini|small|default|medium|large)$/.test(name)) ||
        (['primary', 'success', 'warning', 'danger'].includes(key) &&
          new RegExp(`^(${key}${key === 'primary' ? '|link' : ''})-[0-9]+$`).test(name))
      )
        delete tokens[name];
    }
    const algorithm =
      key === 'controlHeight'
        ? theme.algorithm?.filter((item) => item !== 'compact')
        : theme.algorithm;
    emit('change', { ...theme, seed, tokens, algorithm });
  }
  function setDensity(value: number) {
    const option = densityOptions.find((item) => item.value === value);
    if (!option) return;
    const tokens: NonNullable<SdThemeConfig['tokens']> = {
      ...theme.tokens,
      'spacing-7': `${option.spacing}px`,
    };
    for (const name of Object.keys(tokens))
      if (/^size-(mini|small|default|medium|large)$/.test(name)) delete tokens[name];
    emit('change', {
      ...theme,
      seed: { ...theme.seed, controlHeight: value },
      algorithm: theme.algorithm?.filter((item) => item !== 'compact'),
      tokens,
    });
  }
  function setNumber(key: keyof SdThemeSeed, min: number, raw: string | number | null | undefined) {
    if (raw === '' || raw == null) return set(key, undefined);
    set(key, Math.max(min, Math.min(256, Number(raw))));
  }
</script>
<template>
  <div class="seed-panel">
    <section class="seed-group">
      <h3>品牌主色</h3><p>按钮、链接和选中状态会一起跟随。</p>
      <div class="brand-colors" aria-label="常用品牌色">
        <sd-button
          v-for="color in colors"
          :key="color.value"
          :type="theme.seed?.primary === color.value ? 'primary' : 'secondary'"
          :aria-pressed="theme.seed?.primary === color.value"
          @click="set('primary', color.value)"
          ><sd-tag :color="color.value">{{ color.label }}</sd-tag></sd-button
        >
      </div>
      <div class="seed-field" data-testid="seed-primary">
        <span>自定义</span>
        <sd-color-picker
          format="HEX"
          :model-value="theme.seed?.primary ?? '#165dff'"
          @change="set('primary', $event)"
        />
        <sd-button size="mini" @click="set('primary', undefined)">恢复默认</sd-button>
      </div>
    </section>
    <section class="seed-group">
      <h3>圆角风格</h3>
      <sd-radio-group
        class="radius-choices"
        :model-value="theme.seed?.radius ?? 4"
        aria-label="圆角风格"
        @change="set('radius', Number($event))"
      >
        <sd-radio
          v-for="option in radiusOptions"
          :key="option.value"
          class="radius-choice"
          :value="option.value"
        >
          <template #radio>
            <sd-config-provider :theme="{ seed: { radius: option.value } }" theme-mode="light"
              ><div inert aria-hidden="true"
                ><sd-button type="primary">按钮</sd-button></div
              ></sd-config-provider
            >
            <span>{{ option.label }}</span>
          </template>
        </sd-radio>
      </sd-radio-group>
    </section>
    <section class="seed-group">
      <h3>界面疏密</h3>
      <sd-radio-group
        type="button"
        :model-value="density"
        aria-label="界面疏密"
        :options="densityOptions"
        @change="setDensity(Number($event))"
      />
      <p>让按钮、输入框和间距更紧凑或宽松。</p>
    </section>
    <section class="seed-group">
      <h3>文字大小</h3>
      <sd-radio-group
        type="button"
        :model-value="theme.seed?.fontSize ?? 14"
        aria-label="文字大小"
        :options="textOptions"
        @change="set('fontSize', Number($event))"
      />
    </section>
    <sd-collapse class="seed-precise" :bordered="false">
      <sd-collapse-item key="precise" header="状态颜色与精确数值">
        <div
          v-for="field in statusColors"
          :key="field.key"
          class="seed-field"
          :data-testid="`seed-${field.key}`"
        >
          <span>{{ field.label }}</span
          ><sd-color-picker
            format="HEX"
            :model-value="theme.seed?.[field.key] ?? field.value"
            @change="set(field.key, $event)"
          />
          <sd-button size="mini" @click="set(field.key, undefined)">恢复默认</sd-button>
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
          <sd-button size="mini" @click="set(field.key, undefined)">恢复默认</sd-button>
        </div>
      </sd-collapse-item>
    </sd-collapse>
    <sd-alert v-if="Object.keys(theme.components ?? {}).length" type="info"
      >部分组件使用独立样式。若整体调整没有影响它，可在“微调组件”中恢复跟随整体。</sd-alert
    >
  </div>
</template>
<style scoped lang="scss">
  .seed-panel {
    display: grid;
    gap: 12px;
  }

  .seed-group {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .seed-group + .seed-group {
    padding-top: 12px;
    border-top: 1px solid var(--sl-color-gray-5);
  }

  h3 {
    margin: 0;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: var(--sl-color-gray-2);
    font-size: 13px;
  }

  .brand-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .radius-choices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .radius-choice {
    position: relative;
    display: grid;
    gap: 12px;
    justify-items: center;
    padding: 16px 4px;
    font-size: 13px;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 6px;
    cursor: pointer;
  }

  .radius-choices .radius-choice {
    margin-right: 0;
  }

  .radius-choice:has(:checked) {
    border-color: var(--sl-color-accent);
  }

  .radius-choice:focus-within {
    outline: 2px solid var(--sl-color-accent);
    outline-offset: 2px;
  }

  .seed-field {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }

  .seed-precise .seed-field {
    margin-top: 16px;
  }
</style>
