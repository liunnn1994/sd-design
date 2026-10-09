<script setup lang="ts">
  import { computed, nextTick, shallowRef, useTemplateRef } from 'vue';

  import { useElementSize } from '@vueuse/core';

  import { demoComponents } from './demo-registry';
  import { componentLabel, themeCatalog } from './editor-model';
  import ThemeDemoPreview from './ThemeDemoPreview.vue';
  import ThemeDetailPanel from './ThemeDetailPanel.vue';
  import ThemePagePreview from './ThemePagePreview.vue';
  import ThemePresetPanel from './ThemePresetPanel.vue';
  import ThemeSeedPanel from './ThemeSeedPanel.vue';
  import { useThemeEditor } from './useThemeEditor';

  const editor = useThemeEditor();
  const { theme, preset, status, error, json, showJson, baseline, canUndo, canRedo } = editor;
  const step = shallowRef(0);
  const root = useTemplateRef<HTMLElement>('root');
  const mobileAnchor = useTemplateRef<HTMLElement>('mobileAnchor');
  const { width } = useElementSize(root);
  const narrow = computed(() => width.value > 0 && width.value <= 700);
  const mobilePane = shallowRef<'settings' | 'preview'>('settings');
  const steps = ['选择风格', '调整品牌', '确认效果'];
  const preview = shallowRef('page');
  const component = shallowRef('button');
  const detailComponent = shallowRef('');
  const detailPanels = shallowRef<Array<string | number>>([]);
  const showBefore = shallowRef(false);
  const names = [
    ...new Set([...themeCatalog.components.map((item) => item.name), ...demoComponents]),
  ].sort();
  const previewTheme = computed(() => (showBefore.value ? baseline.value : theme.value));
  const mode = computed(() => (previewTheme.value.algorithm?.includes('dark') ? 'dark' : 'light'));
  const themeName = computed({
    get: () => theme.value.meta?.name ?? '',
    set: (name: string) => editor.update({ ...theme.value, meta: { ...theme.value.meta, name } }),
  });
  async function showMobilePane(pane: 'settings' | 'preview') {
    mobilePane.value = pane;
    if (narrow.value) {
      await nextTick();
      mobileAnchor.value?.scrollIntoView({ block: 'start' });
    }
  }
  function goStep(index: number) {
    step.value = index;
    showBefore.value = false;
    void showMobilePane('settings');
  }
  function selectComponent(name: string) {
    detailComponent.value = name;
    if (name) {
      component.value = name;
      preview.value = 'components';
    }
    detailPanels.value = ['component'];
  }
  function setMode(next: string) {
    showBefore.value = false;
    const algorithm: Array<'dark' | 'compact'> =
      theme.value.algorithm?.filter((item) => item !== 'dark') ?? [];
    if (next === 'dark') algorithm.push('dark');
    editor.update({ ...theme.value, algorithm });
  }
</script>

<template>
  <div
    ref="root"
    class="theme-editor not-content"
    :class="`mobile-${mobilePane}`"
    data-testid="theme-editor"
  >
    <header class="editor-toolbar">
      <div class="editor-title"
        ><strong>品牌主题工作台</strong><span>看着页面，调整你的品牌风格</span></div
      >
      <div class="toolbar-actions">
        <sd-button :disabled="!canUndo" @click="editor.undo">撤销</sd-button>
        <sd-button :disabled="!canRedo" @click="editor.redo">重做</sd-button>
        <sd-button @click="goStep(2)">保存主题文件</sd-button>
      </div>
    </header>
    <p class="save-notice" role="note">调整不会自动保存，离开前请下载主题文件。</p>
    <nav class="editor-steps" aria-label="主题设计步骤">
      <sd-steps
        :current="step + 1"
        :small="narrow"
        :label-placement="narrow ? 'vertical' : 'horizontal'"
        line-less
        changeable
        @change="goStep($event - 1)"
      >
        <sd-step v-for="label in steps" :key="label" :title="label" />
      </sd-steps>
    </nav>
    <div ref="mobileAnchor" class="mobile-anchor" aria-hidden="true" />
    <nav class="mobile-toolbar" aria-label="手机主题工作区">
      <sd-radio-group
        class="mobile-panes"
        type="button"
        size="large"
        aria-label="调整与预览"
        :model-value="mobilePane"
        :options="[
          { value: 'settings', label: '调整' },
          { value: 'preview', label: '预览' },
        ]"
        @change="showMobilePane($event === 'preview' ? 'preview' : 'settings')"
      />
      <sd-button v-if="step < 2" type="primary" @click="goStep(step + 1)">{{
        step === 0 ? '调整品牌' : '确认主题'
      }}</sd-button>
      <sd-button v-else type="primary" @click="editor.download">下载主题</sd-button>
    </nav>
    <sd-alert v-if="status" type="success" role="status" class="editor-status">{{
      status
    }}</sd-alert>
    <sd-alert v-if="error && !showJson" type="error" role="alert">{{ error }}</sd-alert>
    <div class="editor-layout">
      <section class="editor-preview" aria-label="实时效果">
        <div class="preview-toolbar">
          <strong>实时效果</strong>
          <sd-tooltip content="预览里的按钮和表单可以操作，试试看实际使用效果。">
            <sd-button type="text" size="mini" aria-label="预览帮助">说明</sd-button>
          </sd-tooltip>
          <sd-radio-group
            type="button"
            v-model="preview"
            aria-label="预览视图"
            :options="[
              { value: 'page', label: '页面预览' },
              { value: 'components', label: '组件示例' },
            ]"
          />
          <sd-radio-group
            type="button"
            :model-value="mode"
            aria-label="预览明暗"
            :options="[
              { value: 'light', label: '浅色' },
              { value: 'dark', label: '深色' },
            ]"
            @change="setMode(String($event))"
          />
          <sd-button :aria-pressed="showBefore" @click="showBefore = !showBefore">{{
            showBefore ? '返回当前效果' : '查看调整前'
          }}</sd-button>
        </div>
        <p v-if="showBefore" class="comparison-notice" role="status"
          >正在查看调整前的效果，下载的仍是当前主题。</p
        >
        <sd-select
          v-if="preview === 'components'"
          v-model="component"
          class="preview-select"
          allow-search
          aria-label="预览组件"
          :options="names.map((name) => ({ value: name, label: componentLabel(name) }))"
        />
        <ThemeDemoPreview
          v-if="preview === 'components'"
          :theme="previewTheme"
          :component="component"
        />
        <ThemePagePreview v-else :theme="previewTheme" :theme-mode="mode" :mobile="narrow" />
      </section>
      <aside class="editor-controls" aria-label="品牌调整">
        <ThemePresetPanel v-if="step === 0" :preset="preset" @select="editor.applyPreset" />
        <template v-else-if="step === 1">
          <div class="panel-heading"><h2>让界面更像你的品牌</h2></div>
          <ThemeSeedPanel :theme="theme" @change="editor.update" />
          <sd-collapse v-model:active-key="detailPanels" class="more-settings" :bordered="false">
            <sd-collapse-item key="component" header="微调组件">
              <ThemeDetailPanel
                :theme="theme"
                :component="detailComponent"
                @change="editor.update"
                @token="editor.updateToken"
                @component="selectComponent"
              />
            </sd-collapse-item>
          </sd-collapse>
        </template>
        <template v-else>
          <div class="panel-heading"><h2>确认你的品牌主题</h2></div>
          <label class="name-field"
            >主题名称<sd-input
              v-model="themeName"
              placeholder="例如：品牌官网 · 清爽蓝"
              :input-attrs="{ 'aria-label': '主题名称' }"
          /></label>
          <sd-tooltip content="切换浅色和深色，检查文字是否清晰，再试试按钮和表单。">
            <sd-button type="text" aria-label="确认效果帮助">如何检查效果？</sd-button>
          </sd-tooltip>
          <sd-button type="primary" long @click="editor.download">下载主题文件</sd-button>
          <sd-tooltip content="下载后可交给实施人员，也可以导入这里继续调整。">
            <sd-button type="text" aria-label="主题文件帮助">下载后怎么用？</sd-button>
          </sd-tooltip>
        </template>
        <div class="step-actions">
          <sd-button v-if="step > 0" @click="goStep(step - 1)">上一步</sd-button>
          <sd-button v-if="step < 2" type="primary" @click="goStep(step + 1)"
            >下一步：{{ steps[step + 1] }}</sd-button
          >
          <sd-button v-else @click="goStep(1)">继续调整</sd-button>
        </div>
        <sd-collapse class="more-settings" :bordered="false">
          <sd-collapse-item key="developer" header="导入与更多选项">
            <div class="developer-actions">
              <sd-upload
                data-testid="theme-import"
                accept=".json,application/json"
                :show-file-list="false"
                :auto-upload="false"
                :on-before-upload="editor.importFile"
                ><template #upload-button><sd-button>导入主题文件</sd-button></template></sd-upload
              >
              <sd-button @click="editor.openJson">编辑主题文件</sd-button>
              <sd-button @click="editor.reset">恢复默认主题</sd-button>
            </div>
            <sd-link href="/guides/theme/#主题文件接入">开发者接入说明</sd-link>
          </sd-collapse-item>
        </sd-collapse>
      </aside>
    </div>
    <sd-modal v-model:visible="showJson" title="编辑主题文件" :width="800" :footer="false">
      <p>需要调整文件内容时，可交给实施人员处理。</p>
      <div class="json-editor">
        <sd-textarea
          v-model="json"
          :auto-size="{ minRows: 14, maxRows: 20 }"
          :textarea-attrs="{ 'aria-label': '主题文件内容', 'spellcheck': false }"
        />
      </div>
      <sd-alert v-if="error" type="error" role="alert">{{ error }}</sd-alert>
      <div class="json-actions"
        ><sd-button @click="editor.copy">复制当前文件</sd-button
        ><sd-button @click="showJson = false">取消</sd-button
        ><sd-button type="primary" @click="editor.applyJson()">应用文件</sd-button></div
      >
    </sd-modal>
  </div>
</template>

<style scoped lang="scss">
  .theme-editor {
    container-type: inline-size;
    width: 100%;
    overflow: clip;
    color: var(--sl-color-text);
    background: var(--sl-color-bg);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 6px;
  }

  .editor-toolbar,
  .toolbar-actions,
  .preview-toolbar,
  .step-actions,
  .developer-actions,
  .json-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .editor-toolbar {
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .editor-title {
    display: grid;
    gap: 4px;
  }

  .editor-title strong {
    font-size: 18px;
  }

  .editor-title span,
  .save-notice {
    color: var(--sl-color-gray-2);
    font-size: 13px;
    line-height: 1.6;
  }

  .editor-steps {
    padding: 24px;
    background: var(--sl-color-bg-nav);
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .editor-steps :deep(.sd-steps) {
    max-width: 680px;
    margin-inline: auto;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    min-height: 660px;
  }

  .editor-preview {
    min-width: 0;
    padding: 24px;
    background: var(--sl-color-bg-nav);
  }

  .preview-toolbar {
    gap: 12px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .preview-toolbar > strong {
    margin-right: auto;
  }

  .save-notice {
    margin: 0;
    padding: 8px 24px;
  }

  .comparison-notice {
    padding: 12px;
    font-size: 13px;
    background: var(--sl-color-accent-low);
  }

  .editor-controls {
    min-width: 0;
    padding: 24px;
    border-left: 1px solid var(--sl-color-gray-5);
  }

  .panel-heading {
    margin-bottom: 16px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
  }

  .more-settings {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--sl-color-gray-5);
  }

  .developer-actions {
    padding-top: 16px;
  }

  .step-actions {
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--sl-color-gray-5);
  }

  .step-actions > :last-child {
    margin-left: auto;
  }

  .name-field {
    display: grid;
    gap: 12px;
    font-size: 14px;
  }

  :deep(.preview-select) {
    width: 180px;
    margin-bottom: 16px;
  }

  .editor-status {
    margin: 0;
  }

  .mobile-toolbar {
    display: none;
  }

  .mobile-anchor {
    scroll-margin-top: var(--sl-nav-height, 64px);
  }

  .json-editor {
    width: 100%;
    margin-block: 16px;
  }

  .json-editor :deep(.sd-textarea) {
    font: 13px/1.6 monospace;
  }

  .json-actions {
    justify-content: flex-end;
  }

  @container (width <= 950px) {
    .editor-layout {
      grid-template-columns: minmax(0, 1fr) 320px;
    }

    .editor-preview,
    .editor-controls {
      padding: 16px;
    }
  }

  @container (width <= 700px) {
    .editor-toolbar {
      gap: 12px;
      padding: 16px;
    }

    .editor-title span {
      display: none;
    }

    .mobile-toolbar {
      position: sticky;
      top: var(--sl-nav-height, 64px);
      z-index: 10;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      scroll-margin-top: var(--sl-nav-height, 64px);
      background: var(--sl-color-bg);
      border-bottom: 1px solid var(--sl-color-gray-5);
    }

    .mobile-panes {
      display: flex;
      flex: 1;
      min-width: 0;
    }

    .mobile-panes :deep(.sd-radio-button) {
      flex: 1;
      min-height: 44px;
    }

    .mobile-settings .editor-preview,
    .mobile-preview .editor-controls {
      display: none;
    }

    .toolbar-actions :deep(.sd-btn),
    .mobile-toolbar :deep(.sd-btn),
    .step-actions :deep(.sd-btn),
    .developer-actions :deep(.sd-btn),
    :deep(.brand-colors .sd-btn),
    .editor-controls :deep(.sd-radio-button),
    .editor-controls :deep(.sd-collapse-item-header) {
      min-height: 44px;
    }

    .editor-layout {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .editor-controls {
      order: -1;
      border-bottom: 1px solid var(--sl-color-gray-5);
      border-left: 0;
    }

    .editor-steps {
      padding: 12px 8px;
    }

    .editor-steps :deep(.sd-steps .sd-steps-item) {
      flex: 1;
      min-width: 0;
      min-height: 44px;
      margin-right: 0;
      text-align: center;
    }

    .editor-steps :deep(.sd-steps .sd-steps-item-node) {
      margin-inline: 0;
    }

    .editor-steps :deep(.sd-steps .sd-steps-item-content) {
      width: 100%;
    }

    .preview-toolbar > strong {
      display: none;
    }

    .preview-toolbar {
      gap: 8px;
    }

    .editor-controls :deep(.sd-input),
    .editor-controls :deep(.sd-textarea) {
      font-size: 16px;
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
