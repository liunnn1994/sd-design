<script setup lang="ts">
  import { computed, shallowRef } from 'vue';

  import { demoComponents } from './demo-registry';
  import { themeCatalog, tokensFor } from './editor-model';
  import { themePresets } from './theme-playground';
  import ThemeDemoPreview from './ThemeDemoPreview.vue';
  import ThemePagePreview from './ThemePagePreview.vue';
  import ThemeSeedPanel from './ThemeSeedPanel.vue';
  import ThemeTokenPanel from './ThemeTokenPanel.vue';
  import { useThemeEditor } from './useThemeEditor';

  const editor = useThemeEditor();
  const { theme, preset, status, error, json, showJson, changes } = editor;
  const advanced = shallowRef(false);
  const scope = shallowRef('global');
  const component = shallowRef('button');
  const componentSearch = shallowRef('');
  const preview = shallowRef('components');
  const names = [
    ...new Set([...themeCatalog.components.map((item) => item.name), ...demoComponents]),
  ].sort();
  const components = computed(() =>
    names.filter((name) => name.includes(componentSearch.value.toLowerCase())),
  );
  const activeComponent = computed(() => (scope.value === 'component' ? component.value : ''));
  const mode = computed(() => (theme.value.algorithm?.includes('dark') ? 'dark' : 'light'));
  function toggleAlgorithm(name: 'dark' | 'compact') {
    const algorithms = new Set(theme.value.algorithm ?? []);
    if (algorithms.has(name)) algorithms.delete(name);
    else algorithms.add(name);
    editor.update({ ...theme.value, algorithm: [...algorithms] });
  }
  function selectComponent(name: string) {
    component.value = name;
    scope.value = 'component';
    advanced.value = true;
    preview.value = 'components';
  }
  function resetScope() {
    if (!activeComponent.value) editor.update({ ...theme.value, tokens: {} });
    else {
      const components = { ...theme.value.components };
      delete components[activeComponent.value];
      editor.update({ ...theme.value, components });
    }
  }
</script>

<template>
  <div class="theme-editor not-content" data-testid="theme-editor">
    <header class="editor-toolbar">
      <div class="editor-title"
        ><strong>主题编辑器</strong><span>{{ changes }} 处配置</span></div
      >
      <div class="mode-switch" aria-label="编辑模式">
        <sd-button
          :type="!advanced ? 'primary' : 'secondary'"
          @click="
            advanced = false;
            scope = 'global';
          "
          >基础</sd-button
        >
        <sd-button :type="advanced ? 'primary' : 'secondary'" @click="advanced = true"
          >高级</sd-button
        >
      </div>
      <div v-if="advanced" class="mode-switch" aria-label="主题范围">
        <sd-button :type="scope === 'global' ? 'primary' : 'secondary'" @click="scope = 'global'"
          >全局</sd-button
        >
        <sd-button
          :type="scope === 'component' ? 'primary' : 'secondary'"
          @click="scope = 'component'"
          >组件</sd-button
        >
      </div>
      <div class="toolbar-actions">
        <sd-button @click="editor.openJson">主题配置</sd-button>
        <sd-upload
          data-testid="theme-import"
          accept=".json,application/json"
          :show-file-list="false"
          :auto-upload="false"
          :on-before-upload="editor.importFile"
          ><template #upload-button><sd-button>导入</sd-button></template></sd-upload
        >
        <sd-button type="primary" @click="editor.download">导出</sd-button>
      </div>
    </header>
    <div class="editor-settings">
      <div class="setting-field">
        <span>预设</span>
        <sd-select
          :model-value="preset"
          class="preset-select"
          aria-label="主题预设"
          :options="[
            { value: 'custom', label: '自定义', disabled: true },
            ...themePresets.map((item) => ({ value: item.key, label: item.name })),
          ]"
          @change="editor.applyPreset(String($event))"
        />
      </div>
      <div class="setting-field"
        ><sd-switch
          aria-label="暗色"
          :model-value="mode === 'dark'"
          @change="toggleAlgorithm('dark')"
        />暗色</div
      >
      <div class="setting-field"
        ><sd-switch
          aria-label="紧凑"
          :model-value="theme.algorithm?.includes('compact') ?? false"
          @change="toggleAlgorithm('compact')"
        />紧凑</div
      >
      <sd-button size="small" @click="editor.reset">重置全部</sd-button>
      <span class="catalog-count">{{ themeCatalog.components.length }} 个组件主题 · 自动发现</span>
    </div>
    <sd-alert v-if="status" type="success" role="status" class="editor-status">{{
      status
    }}</sd-alert>
    <sd-alert v-if="error && !showJson" type="error" role="alert">{{ error }}</sd-alert>
    <div class="editor-layout">
      <aside v-if="scope === 'component'" class="component-nav">
        <sd-input
          v-model="componentSearch"
          placeholder="搜索组件"
          :input-attrs="{ 'aria-label': '搜索组件' }"
          allow-clear
        />
        <nav aria-label="组件主题"
          ><sd-button
            v-for="name in components"
            :key="name"
            :type="component === name ? 'primary' : 'text'"
            long
            :aria-current="component === name ? 'true' : undefined"
            @click="component = name"
            ><span class="component-name">{{ name }}</span
            ><sd-tag size="small">{{ tokensFor(name).length }}</sd-tag></sd-button
          ></nav
        >
      </aside>
      <section class="editor-controls">
        <div class="panel-heading"
          ><strong>{{ advanced ? activeComponent || '全局 Token' : '基础设计' }}</strong
          ><sd-button v-if="advanced" size="mini" @click="resetScope">重置此范围</sd-button></div
        >
        <ThemeSeedPanel v-if="!advanced" :theme="theme" @change="editor.update" />
        <ThemeTokenPanel
          v-else
          :key="activeComponent"
          :theme="theme"
          :component="activeComponent"
          @change="(key, value) => editor.updateToken(key, value, activeComponent)"
          @component="selectComponent"
        />
      </section>
      <section class="editor-preview">
        <div class="preview-toolbar">
          <strong>实时预览</strong>
          <sd-radio-group
            type="button"
            v-model="preview"
            aria-label="预览视图"
            :options="[
              { value: 'components', label: '组件示例' },
              { value: 'page', label: '页面示例' },
            ]"
          >
          </sd-radio-group>
          <sd-select
            v-if="scope === 'global' && preview === 'components'"
            v-model="component"
            class="preview-select"
            allow-search
            aria-label="预览组件"
            :options="names"
          />
        </div>
        <ThemeDemoPreview v-if="preview === 'components'" :theme="theme" :component="component" />
        <ThemePagePreview v-else :theme="theme" :theme-mode="mode" />
        <p class="preview-hint"
          >所有预览使用当前主题。组件覆盖仅影响该组件，清除覆盖后恢复默认继承。</p
        >
      </section>
    </div>
    <sd-modal v-model:visible="showJson" title="主题配置" :width="800" :footer="false">
      <p>粘贴或编辑主题 JSON，应用后同步更新预览。配置可直接传入 ConfigProvider。</p>
      <sd-textarea
        v-model="json"
        class="json-editor"
        :auto-size="{ minRows: 14, maxRows: 20 }"
        :textarea-attrs="{ 'aria-label': '主题 JSON', 'spellcheck': false }"
      />
      <sd-alert v-if="error" type="error" role="alert">{{ error }}</sd-alert>
      <div class="json-actions"
        ><sd-button @click="editor.copy">复制当前配置</sd-button
        ><sd-button @click="showJson = false">取消</sd-button
        ><sd-button type="primary" @click="editor.applyJson()">应用配置</sd-button></div
      >
    </sd-modal>
  </div>
</template>

<style scoped lang="scss">
  .theme-editor {
    container-type: inline-size;
    width: 100%;
    overflow: hidden;
    color: var(--sl-color-text);
    background: var(--sl-color-bg);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 10px;
  }

  .editor-toolbar,
  .editor-settings,
  .preview-toolbar,
  .panel-heading {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .editor-toolbar {
    padding: 16px;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .editor-title {
    display: grid;
    gap: 3px;
    margin-right: 8px;
  }

  .editor-title span,
  .catalog-count,
  .preview-hint {
    color: var(--sl-color-gray-2);
    font-size: 12px;
  }

  .mode-switch {
    display: flex;
    gap: 2px;
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
  }

  .editor-settings {
    padding: 10px 16px;
    font-size: 13px;
    background: var(--sl-color-bg-nav);
  }

  .catalog-count {
    margin-left: auto;
  }

  .editor-layout {
    display: flex;
    min-height: 600px;
  }

  .component-nav {
    flex: 0 0 170px;
    padding: 12px;
    border-right: 1px solid var(--sl-color-gray-5);
  }

  .component-nav nav {
    display: grid;
    align-content: start;
    max-height: 640px;
    margin-top: 12px;
    overflow: auto;
  }

  .component-name {
    flex: 1;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
  }

  .editor-controls {
    flex: 0 0 340px;
    min-width: 0;
    padding: 16px;
    border-right: 1px solid var(--sl-color-gray-5);
  }

  .panel-heading {
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .editor-preview {
    flex: 1;
    min-width: 0;
    padding: 20px;
    background: var(--sl-color-bg-nav);
  }

  .preview-toolbar {
    justify-content: space-between;
    margin-bottom: 18px;
    font-size: 13px;
  }

  .setting-field {
    display: flex;
    gap: 8px;
    align-items: center;
    white-space: nowrap;
  }

  :deep(.preset-select) {
    width: 160px;
  }

  :deep(.preview-select) {
    width: 140px;
  }

  .editor-status {
    margin: 0;
    padding: 8px 16px;
    color: var(--sl-color-accent-high);
    font-size: 13px;
  }

  .json-editor {
    width: 100%;
    margin-block: 16px;
    font: 13px/1.6 monospace;
  }

  .json-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @container (width <= 800px) {
    .editor-layout {
      flex-wrap: wrap;
    }

    .editor-controls {
      flex: 1;
    }

    .editor-preview {
      flex-basis: 100%;
      border-top: 1px solid var(--sl-color-gray-5);
    }
  }

  @container (width <= 520px) {
    .component-nav {
      flex-basis: 100%;
    }

    .component-nav nav {
      max-height: 160px;
    }

    .editor-controls {
      flex-basis: 100%;
    }

    .toolbar-actions {
      margin-left: 0;
    }
  }
</style>

<style lang="scss">
  // Only the editor escapes the prose measure; surrounding guide text stays readable.
  .main-pane:has(.theme-editor) {
    container-type: inline-size;
  }

  .main-pane .sl-container:has(.theme-editor) {
    margin-inline: auto;
  }

  .main-pane .theme-editor {
    width: 90cqw;
    margin-inline: calc(50% - 45cqw);
  }

  @media (width <= 767px) {
    .main-pane .theme-editor {
      width: 100cqw;
      margin-inline: calc(50% - 50cqw);
      border-inline: 0;
      border-radius: 0;
    }
  }
</style>
