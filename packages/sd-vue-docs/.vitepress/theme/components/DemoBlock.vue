<script setup lang="ts">
import '@vue/repl/style.css';
import MarkdownIt from 'markdown-it';
import { computed, getCurrentInstance, markRaw, ref, shallowRef, watch } from 'vue';
import { useData } from 'vitepress';

type ReplModule = typeof import('@vue/repl');
type ReplStore = ReturnType<ReplModule['useStore']>;

const ARCO_VERSION = '2.58.0-beta.1';

const props = defineProps<{
  code: string;
  title?: string;
  description?: string;
}>();

const { isDark } = useData();
const expanded = shallowRef(false);
const loading = shallowRef(false);
const loadError = shallowRef('');
const replComponent = shallowRef<unknown>(null);
const editorComponent = shallowRef<unknown>(null);
const replStore = shallowRef<ReplStore | null>(null);
const instanceUid = getCurrentInstance()?.uid ?? Math.round(Math.random() * 1e9);

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const normalizedCode = computed(() => props.code.trim());
const normalizedDescription = computed(() => props.description?.trim() ?? '');
const replMainFile = computed(() => `src/demo-${instanceUid}.vue`);
const descriptionHtml = computed(() => {
  if (!normalizedDescription.value) {
    return '';
  }

  return markdown.render(normalizedDescription.value);
});
const replTheme = computed(() => (isDark.value ? 'dark' : 'light'));
const importMap = {
  imports: {
    vue: 'https://esm.sh/vue@3.5.20',
    '@vue/shared': 'https://esm.sh/@vue/shared@3.5.20',
    '@sd-design/web-vue': `https://esm.sh/@sd-design/web-vue@${ARCO_VERSION}?external=vue`,
    '@sd-design/web-vue/es/icon': `https://esm.sh/@sd-design/web-vue@${ARCO_VERSION}/es/icon?external=vue`,
    '@sd-design/web-vue/': `https://esm.sh/@sd-design/web-vue@${ARCO_VERSION}/`,
  },
};

const previewOptions = computed(() => ({
  headHTML: [
    `<link rel="stylesheet" href="https://unpkg.com/@sd-design/web-vue@${ARCO_VERSION}/dist/sd.css">`,
    '<style>body{margin:0;padding:16px;}body[sd-theme="dark"]{background:#141414;color:#f2f3f5;}<\/style>',
    `<script>window.__ARCO_THEME__=${JSON.stringify(replTheme.value)};document.addEventListener('DOMContentLoaded',function(){if(window.__ARCO_THEME__==='dark'){document.body.setAttribute('sd-theme','dark');}else{document.body.removeAttribute('sd-theme');}});<\/script>`,
  ].join(''),
  customCode: {
    importCode: `import SDVue from '@sd-design/web-vue';\nimport SDVueIcon from '@sd-design/web-vue/es/icon';`,
    useCode: `app.use(SDVue);\napp.use(SDVueIcon);\nif (window.__ARCO_THEME__ === 'dark') { document.body.setAttribute('sd-theme', 'dark'); } else { document.body.removeAttribute('sd-theme'); }`,
  },
}),);

function applySafeVirtualFs(store: ReplStore) {
  const target = 'value' in store.sfcOptions ? store.sfcOptions.value : store.sfcOptions;

  target.script ||= {};
  target.script.fs = {
    fileExists(file: unknown) {
      if (typeof file !== 'string' || file.length === 0) {
        return false;
      }

      const normalizedFile = file.startsWith('/') ? file.slice(1) : file;
      return Boolean(store.files[normalizedFile]);
    },
    readFile(file: unknown) {
      if (typeof file !== 'string' || file.length === 0) {
        return '';
      }

      const normalizedFile = file.startsWith('/') ? file.slice(1) : file;
      return store.files[normalizedFile]?.code ?? '';
    },
  };
}

watch(normalizedCode, (code) => {
  replStore.value?.setFiles(
    {
      [replMainFile.value]: code,
      'import-map.json': JSON.stringify(importMap, null, 2),
    },
    replMainFile.value
  );
});

watch(isDark, () => {
  if (!expanded.value) {
    return;
  }

  replStore.value?.setFiles(
    {
      [replMainFile.value]: normalizedCode.value,
      'import-map.json': JSON.stringify(importMap, null, 2),
    },
    replMainFile.value
  );
});

async function ensureReplLoaded() {
  if (replStore.value || loading.value) {
    return;
  }

  loading.value = true;
  loadError.value = '';

  try {
    const [repl, monaco] = await Promise.all([import('@vue/repl'), import('@vue/repl/monaco-editor')]);
    const { Repl, useStore } = repl;
    const store = useStore({
      mainFile: ref(replMainFile.value),
      showOutput: ref(false),
      outputMode: ref('preview'),
    });

    await store.setFiles(
      {
        [replMainFile.value]: normalizedCode.value,
        'import-map.json': JSON.stringify(importMap, null, 2),
      },
      replMainFile.value
    );

    applySafeVirtualFs(store);

    replComponent.value = markRaw(Repl);
    editorComponent.value = markRaw(monaco.default);
    replStore.value = store;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '编辑器加载失败';
  } finally {
    loading.value = false;
  }
}

async function toggleCode() {
  expanded.value = !expanded.value;

  if (expanded.value) {
    await ensureReplLoaded();
  }
}
</script>

<template>
  <div class="demo-block">
    <div class="demo-block__preview">
      <ClientOnly>
        <slot />
        <template #fallback>
          <div class="demo-block__fallback">示例将在客户端渲染</div>
        </template>
      </ClientOnly>
    </div>
    <div v-if="title || description" class="demo-block__meta">
      <div v-if="title" class="demo-block__title">{{ title }}</div>
      <div v-if="descriptionHtml" class="demo-block__description" v-html="descriptionHtml" />
    </div>
    <div class="demo-block__toolbar">
      <button class="demo-block__button" type="button" @click="toggleCode">
        {{ expanded ? '收起编辑器' : '查看源码并实时编辑' }}
      </button>
    </div>
    <div v-if="expanded" class="demo-block__editor">
      <div v-if="loading" class="demo-block__state">正在加载编辑器...</div>
      <div v-else-if="loadError" class="demo-block__state demo-block__state--error">{{ loadError }}</div>
      <ClientOnly v-else-if="replComponent && editorComponent && replStore">
        <component
          :is="replComponent"
          :editor="editorComponent"
          :show-compile-output="false"
          :show-import-map="false"
          :show-ssr-output="false"
          :store="replStore"
          :theme="replTheme"
          :preview-options="previewOptions"
        />
        <template #fallback>
          <div class="demo-block__state">编辑器将在客户端加载</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.demo-block {
  margin: 20px 0 28px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
}

.demo-block__preview {
  padding: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-block__meta {
  padding: 18px 20px 0;
}

.demo-block__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-block__description {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.demo-block__description :deep(p) {
  margin: 0;
}

.demo-block__description :deep(code) {
  padding: 0.15rem 0.35rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.demo-block__description :deep(hr) {
  display: none;
}

.demo-block__toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.demo-block__button {
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
}

.demo-block__fallback,
.demo-block__state {
  color: var(--vp-c-text-2);
}

.demo-block__state {
  padding: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.demo-block__state--error {
  color: #c73636;
}

.demo-block__editor {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-block__editor :deep(.vue-repl) {
  height: 520px;
}

.demo-block__editor :deep(.vue-repl, .vue-repl pre, .vue-repl code) {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}
</style>
