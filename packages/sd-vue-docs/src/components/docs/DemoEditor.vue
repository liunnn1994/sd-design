<script setup lang="ts">
  import '@vue/repl/style.css';
  import type { ReplStore } from '@vue/repl';
  import type { Component } from 'vue';
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

  import vueSharedModuleSource from '../../browser-repl/vue-shared.ts?raw';
  import vueModuleSource from '../../browser-repl/vue.ts?raw';

  type ReplComponent = (typeof import('@vue/repl'))['Repl'];

  function createJavaScriptDataUrl(source: string) {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
  }

  const vueSharedModuleUrl = createJavaScriptDataUrl(vueSharedModuleSource);
  const vueModuleUrl = createJavaScriptDataUrl(vueModuleSource);

  const props = defineProps<{
    source: string;
    mainFile: string;
  }>();

  const expanded = shallowRef(false);
  const loading = shallowRef(false);
  const loadError = shallowRef('');
  const currentTheme = shallowRef<'light' | 'dark'>('light');
  const replComponent = shallowRef<ReplComponent | null>(null);
  const editorComponent = shallowRef<Component | null>(null);
  const replStore = shallowRef<ReplStore | null>(null);
  const themeObserver = shallowRef<MutationObserver | null>(null);
  const vendorDependencyImports = shallowRef<Record<string, string>>({});
  const previewThemeScriptCloseTag = '</scr' + 'ipt>';

  const normalizedCode = computed(() => props.source.trim());
  const replTheme = computed(() => currentTheme.value);

  const previewOptions = computed(() => ({
    headHTML: [
      '<link rel="stylesheet" href="/vendor/sd-web-vue/dist/sd.css">',
      '<style>body{margin:0;padding:16px;font-family:Inter,Segoe UI,sans-serif;}body[sd-theme="dark"]{background:#141414;color:#f2f3f5;}#app{min-height:40px;}</style>',
      `<script>document.addEventListener('DOMContentLoaded',function(){if(${JSON.stringify(replTheme.value)}==='dark'){document.body.setAttribute('sd-theme','dark');}else{document.body.removeAttribute('sd-theme');}});${previewThemeScriptCloseTag}`,
    ].join(''),
    customCode: {
      importCode: `import SDVue from '@sdata/web-vue';\nimport SDVueIcon from '@sdata/web-vue/es/icon';`,
      useCode: `app.use(SDVue);\napp.use(SDVueIcon);\nif (${JSON.stringify(replTheme.value)} === 'dark') { document.body.setAttribute('sd-theme', 'dark'); } else { document.body.removeAttribute('sd-theme'); }`,
    },
  }));
  const importMap = computed(() => ({
    imports: {
      'vue': vueModuleUrl,
      '@vue/shared': vueSharedModuleUrl,
      '@sdata/web-vue': '/vendor/sd-web-vue/es/index.js',
      '@sdata/web-vue/es/icon': '/vendor/sd-web-vue/es/icon/index.js',
      '@sdata/web-vue/': '/vendor/sd-web-vue/',
      ...vendorDependencyImports.value,
    },
  }));

  async function ensureVendorImportMapLoaded() {
    if (Object.keys(vendorDependencyImports.value).length > 0) {
      return;
    }

    const response = await fetch('/vendor/sd-web-vue/deps/import-map.json');

    if (!response.ok) {
      throw new Error(`依赖映射加载失败: ${response.status}`);
    }

    const manifest = (await response.json()) as { imports?: Record<string, string> };
    vendorDependencyImports.value = manifest.imports ?? {};
  }

  function applySafeVirtualFs(store: ReplStore) {
    const target = ('value' in store.sfcOptions ? store.sfcOptions.value : store.sfcOptions) as {
      script?: {
        fs?: {
          fileExists(file: unknown): boolean;
          readFile(file: unknown): string;
        };
      };
    };

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

  function syncTheme() {
    currentTheme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  watch(normalizedCode, (code) => {
    replStore.value?.setFiles(
      {
        [props.mainFile]: code,
        'import-map.json': JSON.stringify(importMap.value, null, 2),
      },
      props.mainFile,
    );
  });

  watch(currentTheme, () => {
    replStore.value?.setFiles(
      {
        [props.mainFile]: normalizedCode.value,
        'import-map.json': JSON.stringify(importMap.value, null, 2),
      },
      props.mainFile,
    );
  });

  async function ensureReplLoaded() {
    if (replStore.value || loading.value) {
      return;
    }

    loading.value = true;
    loadError.value = '';

    try {
      await ensureVendorImportMapLoaded();

      const [repl, monaco] = await Promise.all([
        import('@vue/repl'),
        import('@vue/repl/monaco-editor'),
      ]);
      const store = repl.useStore({}, '');

      store.showOutput = false;
      store.outputMode = 'preview';

      await store.setFiles(
        {
          [props.mainFile]: normalizedCode.value,
          'import-map.json': JSON.stringify(importMap.value, null, 2),
        },
        props.mainFile,
      );

      applySafeVirtualFs(store);

      replComponent.value = repl.Repl;
      editorComponent.value = monaco.default;
      replStore.value = store;
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : '编辑器加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function toggleEditor() {
    expanded.value = !expanded.value;

    if (expanded.value) {
      await ensureReplLoaded();
    }
  }

  onMounted(() => {
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    themeObserver.value = observer;
  });

  onBeforeUnmount(() => {
    themeObserver.value?.disconnect();
  });
</script>

<template>
  <div class="demo-editor">
    <div class="demo-editor__toolbar">
      <button class="demo-editor__button" type="button" @click="toggleEditor">
        {{ expanded ? '收起' : '在线编辑' }}
      </button>
    </div>

    <div v-if="expanded" class="demo-editor__panel">
      <div v-if="loading" class="demo-editor__state">正在加载编辑器...</div>
      <div v-else-if="loadError" class="demo-editor__state demo-editor__state--error">
        {{ loadError }}
      </div>
      <component
        :is="replComponent"
        v-else-if="replComponent && editorComponent && replStore"
        :editor="editorComponent"
        :show-compile-output="false"
        :show-import-map="false"
        :show-ssr-output="false"
        :store="replStore"
        :theme="replTheme"
        :preview-options="previewOptions"
      />
    </div>
  </div>
</template>

<style scoped>
  .demo-editor__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 1rem;
    background: var(--sl-color-gray-7);
  }

  .demo-editor__button {
    border: 0;
    border-radius: 999px;
    background: var(--sl-color-accent);
    color: white;
    cursor: pointer;
    font: inherit;
    font-size: smaller;
    padding: 0.1rem 0.5rem;
    margin-left: auto;
  }

  .demo-editor__panel {
    border-top: 1px solid var(--sl-color-gray-5);
  }

  .demo-editor__state {
    padding: 1rem;
    color: var(--sl-color-gray-2);
  }

  .demo-editor__state--error {
    color: #d92d20;
  }

  .demo-editor__panel :deep(.vue-repl) {
    height: 540px;
  }

  .demo-editor__panel :deep(.vue-repl, .vue-repl pre, .vue-repl code) {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  }
</style>
