<script setup lang="ts">
  import { computed, shallowRef } from 'vue';

  import { normalizeTheme, type SdThemeConfig } from '@sdata/web-vue';

  import {
    isChannelToken,
    relatedComponents,
    tokenGroup,
    tokenGroups,
    tokensFor,
  } from './editor-model';
  const { theme, component = '' } = defineProps<{ theme: SdThemeConfig; component?: string }>();
  const emit = defineEmits<{
    change: [key: string, value: string | undefined];
    select: [key: string];
    component: [name: string];
  }>();
  const search = shallowRef('');
  const group = shallowRef('全部');
  const modified = shallowRef(false);
  const selected = shallowRef('');
  const page = shallowRef(1);
  const overrides = computed(() =>
    component ? (theme.components?.[component] ?? {}) : (theme.tokens ?? {}),
  );
  const resolved = computed(() => normalizeTheme(theme));
  const filtered = computed(() => {
    const entries = new Map(tokensFor(component).map((token) => [token.key, token]));
    for (const key of Object.keys(overrides.value))
      if (!entries.has(key)) entries.set(key, { key, value: '' });
    return [...entries.values()].filter(
      (token) =>
        token.key.toLowerCase().includes(search.value.toLowerCase()) &&
        (group.value === '全部' || tokenGroup(token.key, token.value) === group.value) &&
        (!modified.value || token.key in overrides.value),
    );
  });
  const visible = computed(() => filtered.value.slice(0, page.value * 40));
  const related = computed(() => (component ? [] : relatedComponents(selected.value)));
  function currentValue(key: string, fallback: string) {
    return String(
      overrides.value[key] ?? (component ? undefined : resolved.value.tokens[key]) ?? fallback,
    );
  }
  function colorValue(key: string, fallback: string) {
    const value = currentValue(key, fallback);
    if (/^#[\da-f]{6}$/i.test(value)) return value;
    const channels = value.match(/^\s*(\d+),\s*(\d+),\s*(\d+)\s*$/);
    return channels
      ? `#${channels
          .slice(1)
          .map((channel) => Math.min(255, Number(channel)).toString(16).padStart(2, '0'))
          .join('')}`
      : '#165dff';
  }
  function pickColor(key: string, fallback: string, value: string) {
    // 调色板 token 在运行时经 rgb(var(--token)) 消费，覆写必须是通道格式；
    // 由目录推导的 isChannelToken 判断，而不是看当前 fallback 字符串。
    const channels = isChannelToken(key, fallback);
    emit(
      'change',
      key,
      channels
        ? [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16)).join(',')
        : value,
    );
  }
  function choose(key: string) {
    selected.value = key;
    emit('select', key);
  }
  function numericValue(value: string) {
    return value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|s|ms)?$/);
  }
</script>

<template>
  <div class="token-panel">
    <sd-input
      v-model="search"
      :input-attrs="{ 'aria-label': '搜索 token' }"
      placeholder="搜索 token 名称"
      allow-clear
      @input="page = 1"
    />
    <div class="token-filters">
      <sd-select
        v-model="group"
        class="category-select"
        aria-label="token 分类"
        :options="tokenGroups"
        @change="page = 1"
      />
      <sd-checkbox v-model="modified">仅已修改</sd-checkbox>
      <span>{{ filtered.length }} 项</span>
    </div>
    <sd-collapse v-if="selected" class="token-details" :bordered="false">
      <sd-collapse-item :header="`${selected} · 关联信息`" key="related">
        <code>{{ component ? `--component-${component}-${selected}` : `--${selected}` }}</code>
        <p v-if="component"
          >依赖：{{
            tokensFor(component)
              .find((token) => token.key === selected)
              ?.dependencies?.join('、') || '组件默认值'
          }}</p
        >
        <div v-else class="related"
          ><sd-button
            v-for="name in related"
            :key="name"
            type="text"
            size="mini"
            @click="emit('component', name)"
            >{{ name }}</sd-button
          ><p v-if="!related.length">没有直接依赖记录，可在预览中检查间接影响。</p></div
        >
      </sd-collapse-item>
    </sd-collapse>
    <div class="token-list">
      <article
        v-for="token in visible"
        :key="token.key"
        class="token-row"
        :data-token="token.key"
        :class="{ modified: token.key in overrides }"
      >
        <sd-button
          type="text"
          size="mini"
          class="token-name"
          :title="token.key"
          @click="choose(token.key)"
          >{{ token.key }}</sd-button
        >
        <div class="token-value">
          <sd-color-picker
            v-if="tokenGroup(token.key, token.value) === '颜色'"
            format="HEX"
            :model-value="colorValue(token.key, token.value)"
            @change="pickColor(token.key, token.value, $event)"
            ><template #trigger
              ><sd-button :aria-label="`${token.key} 颜色`" class="color-trigger"
                ><span
                  class="color-swatch"
                  :style="{
                    background: colorValue(token.key, token.value),
                  }" /></sd-button></template
          ></sd-color-picker>
          <sd-input-number
            v-if="
              numericValue(token.value) &&
              numericValue(currentValue(token.key, token.value))?.[2] ===
                numericValue(token.value)?.[2]
            "
            class="value-input"
            :input-attrs="{ 'aria-label': token.key }"
            :model-value="parseFloat(currentValue(token.key, token.value))"
            @change="
              emit(
                'change',
                token.key,
                $event === '' || $event === undefined
                  ? undefined
                  : `${$event}${numericValue(token.value)?.[2] ?? ''}`,
              )
            "
          />
          <sd-input
            v-else
            class="value-input"
            :input-attrs="{ 'aria-label': token.key }"
            :model-value="String(overrides[token.key] ?? '')"
            :placeholder="
              String((component ? undefined : resolved.tokens[token.key]) ?? token.value)
            "
            @update:model-value="emit('change', token.key, $event)"
          />
          <sd-button
            size="mini"
            :disabled="!(token.key in overrides)"
            :aria-label="`重置 ${token.key}`"
            @click="emit('change', token.key, undefined)"
            >重置</sd-button
          >
        </div>
        <small
          >{{ tokenGroup(token.key, token.value)
          }}{{ numericValue(token.value)?.[2] ? ` (${numericValue(token.value)?.[2]})` : '' }} ·
          {{ token.key in overrides ? '自定义' : '跟随默认值' }}</small
        >
      </article>
      <sd-empty v-if="!filtered.length" description="没有匹配的 token，请调整搜索或筛选条件。" />
      <sd-button v-if="visible.length < filtered.length" long @click="page++"
        >加载更多（{{ filtered.length - visible.length }}）</sd-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
  .token-panel {
    display: grid;
    gap: 14px;
    min-width: 0;
  }

  .token-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  :deep(.category-select) {
    width: 100px;
  }

  .token-list {
    max-height: 620px;
    overflow: auto;
  }

  .token-row {
    padding: 12px 2px;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .token-row.modified {
    background: var(--sd-color-fill-1);
  }

  .token-name {
    max-width: 100%;
    padding: 0;
    overflow: hidden;
    color: inherit;
    font: 12px monospace;
    text-align: left;
    text-overflow: ellipsis;
  }

  .token-value {
    display: flex;
    gap: 8px;
    margin: 8px 0;
  }

  .value-input {
    flex: 1;
    min-width: 0;
    font: 12px monospace;
  }

  .color-trigger {
    padding: 4px;
  }

  .color-swatch {
    width: 22px;
    height: 22px;
    border: 1px solid var(--sd-color-border-2);
    border-radius: var(--sd-border-radius-small);
  }

  .token-row small,
  .token-details {
    color: var(--sl-color-gray-2);
    font-size: 12px;
  }

  .token-details code {
    overflow-wrap: anywhere;
  }

  .related {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
</style>
