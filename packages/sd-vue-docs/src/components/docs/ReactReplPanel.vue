<script setup lang="ts">
  import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue';

  import overlayScrollbarsStylesheetHref from 'overlayscrollbars/overlayscrollbars.css?url';

  import { compileReactFiles, createReactPreview } from '../../browser-repl/react';
  import { monaco } from '../../browser-repl/react-monaco';
  import demoStylesheetHref from '../../styles/demo.css?url';

  const props = withDefaults(
    defineProps<{
      source: string;
      mainFile: string;
      files?: Record<string, string>;
    }>(),
    { files: () => ({}) },
  );
  const editorHost = useTemplateRef<HTMLDivElement>('editor');
  const previewFrame = useTemplateRef<HTMLIFrameElement>('preview');
  const panelHost = useTemplateRef<HTMLDivElement>('panel');
  const activeFile = shallowRef(props.mainFile);
  const fileNames = shallowRef<string[]>([]);
  const error = shallowRef('');
  const loading = shallowRef(true);
  const editorWidth = shallowRef(50);
  const fileName = shallowRef('');
  const channel = crypto.randomUUID();
  const models = new Map<string, monaco.editor.ITextModel>();
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let themeObserver: MutationObserver | undefined;
  let imports: Record<string, string> = {};
  let disposePreview: (() => void) | undefined;
  let changeSubscription: monaco.IDisposable | undefined;
  let runTimer: ReturnType<typeof setTimeout> | undefined;
  let runId = 0;
  let disposed = false;
  let activeChannel = '';
  const typeLibraries: monaco.IDisposable[] = [];
  const vendorBase = `${import.meta.env.BASE_URL}vendor/sd-web-react/`;

  async function loadJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`在线运行资源加载失败 (${response.status}): ${url}`);
    return response.json() as Promise<T>;
  }

  async function run() {
    if (loading.value || disposed) return;
    const current = ++runId;
    error.value = '';
    try {
      const compilation = await compileReactFiles(
        Object.fromEntries([...models].map(([name, model]) => [name, model.getValue()])),
        props.mainFile,
      );
      if (disposed || current !== runId) return;
      activeChannel = `${channel}:${current}`;
      const next = createReactPreview(compilation, imports, {
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
        stylesheets: [
          `${import.meta.env.BASE_URL}vendor/sd-web-vue/dist/sd.css`,
          demoStylesheetHref,
          overlayScrollbarsStylesheetHref,
        ],
        channel: activeChannel,
      });
      if (previewFrame.value) previewFrame.value.srcdoc = next.document;
      disposePreview?.();
      disposePreview = next.dispose;
    } catch (cause) {
      if (!disposed && current === runId)
        error.value = cause instanceof Error ? cause.message : String(cause);
    }
  }

  function selectFile(name: string) {
    const model = models.get(name);
    if (!model || !editor) return;
    activeFile.value = name;
    editor.setModel(model);
    editor.focus();
  }

  function reset() {
    const files = { ...props.files, [props.mainFile]: props.source };
    editor?.setModel(null);
    for (const [name, model] of models) {
      if (!(name in files)) {
        model.dispose();
        models.delete(name);
      }
    }
    for (const [name, code] of Object.entries(files)) {
      if (models.has(name)) models.get(name)!.setValue(code);
      else createModel(name, code);
    }
    fileNames.value = [...models.keys()];
    selectFile(props.mainFile);
    editor?.setPosition({ lineNumber: 1, column: 1 });
    editor?.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
    void run();
  }

  function createModel(name: string, code = '') {
    const language = name.endsWith('.css') ? 'css' : name.endsWith('.json') ? 'json' : 'typescript';
    models.set(
      name,
      monaco.editor.createModel(
        code,
        language,
        monaco.Uri.parse(`file:///playground/${channel}/${name}`),
      ),
    );
  }

  function saveFile(rename = false) {
    const name = fileName.value.trim();
    if (
      !/^(?:[\w-]+\/)*[\w.-]+\.(?:tsx?|jsx?|css|json)$/.test(name) ||
      name.split('/').some((part) => part === '.' || part === '..')
    ) {
      error.value = '请输入有效的 TSX、TS、JSX、JS、CSS 或 JSON 文件名。';
      return;
    }
    if (models.has(name)) {
      error.value = '文件已存在。';
      return;
    }
    const previous = activeFile.value;
    if (rename && previous === props.mainFile) return;
    createModel(name, rename ? models.get(previous)!.getValue() : '');
    selectFile(name);
    if (rename) {
      models.get(previous)?.dispose();
      models.delete(previous);
    }
    fileNames.value = [...models.keys()];
    fileName.value = '';
    void run();
  }

  function deleteFile() {
    const previous = activeFile.value;
    if (previous === props.mainFile) return;
    selectFile(props.mainFile);
    models.get(previous)?.dispose();
    models.delete(previous);
    fileNames.value = [...models.keys()];
    void run();
  }

  function syncTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs');
    const body = previewFrame.value?.contentDocument?.body;
    if (dark) body?.setAttribute('sd-theme', 'dark');
    else body?.removeAttribute('sd-theme');
  }

  function onMessage(event: MessageEvent) {
    if (event.source !== previewFrame.value?.contentWindow || event.data?.channel !== activeChannel)
      return;
    if (event.data.type === 'sd-react-repl:error') error.value = String(event.data.message);
  }

  function resize(event: PointerEvent) {
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) return;
    const bounds = panelHost.value?.getBoundingClientRect();
    if (bounds)
      editorWidth.value = Math.max(
        20,
        Math.min(80, ((event.clientX - bounds.left) / bounds.width) * 100),
      );
  }
  function resizeWithKeyboard(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    editorWidth.value = Math.max(
      20,
      Math.min(80, editorWidth.value + (event.key === 'ArrowRight' ? 5 : -5)),
    );
  }

  onMounted(async () => {
    window.addEventListener('message', onMessage);
    syncTheme();
    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    try {
      const [importMap, declarations] = await Promise.all([
        loadJson<{ imports: Record<string, string> }>(`${vendorBase}import-map.json`),
        loadJson<Record<string, string>>(`${vendorBase}types.json`),
      ]);
      if (disposed) return;
      imports = Object.fromEntries(
        Object.entries(importMap.imports).map(([name, href]) => [
          name,
          new URL(href, new URL(vendorBase, location.href)).href,
        ]),
      );
      for (const [name, content] of Object.entries(declarations)) {
        typeLibraries.push(
          monaco.typescript.typescriptDefaults.addExtraLib(content, `file:///${name}`),
        );
      }
      const files = { ...props.files, [props.mainFile]: props.source };
      fileNames.value = Object.keys(files);
      for (const [name, code] of Object.entries(files)) {
        createModel(name, code);
      }
      editor = monaco.editor.create(editorHost.value!, {
        model: models.get(props.mainFile),
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        tabSize: 2,
        padding: { top: 16 },
      });
      changeSubscription = editor.onDidChangeModelContent(() => {
        clearTimeout(runTimer);
        runTimer = setTimeout(() => void run(), 250);
      });
      loading.value = false;
      await run();
    } catch (cause) {
      if (!disposed) {
        loading.value = false;
        error.value = cause instanceof Error ? cause.message : String(cause);
      }
    }
  });

  watch(
    () => props.source,
    (source) => models.get(props.mainFile)?.setValue(source),
  );
  onBeforeUnmount(() => {
    disposed = true;
    runId++;
    clearTimeout(runTimer);
    window.removeEventListener('message', onMessage);
    themeObserver?.disconnect();
    changeSubscription?.dispose();
    editor?.dispose();
    for (const model of models.values()) model.dispose();
    for (const library of typeLibraries) library.dispose();
    disposePreview?.();
  });
</script>

<template>
  <div class="react-repl-panel">
    <div v-if="loading" class="demo-editor__state" role="status">编辑器加载中…</div>
    <div class="react-repl-panel__toolbar">
      <div role="tablist" aria-label="示例文件">
        <button
          v-for="file in fileNames"
          :key="file"
          type="button"
          role="tab"
          :aria-selected="activeFile === file"
          @click="selectFile(file)"
          >{{ file.split('/').pop() }}</button
        >
      </div>
      <div>
        <input
          v-model="fileName"
          aria-label="文件名"
          placeholder="Component.tsx"
          :disabled="loading"
          @keydown.enter="saveFile()"
        />
        <button type="button" :disabled="loading" @click="saveFile()">新增文件</button>
        <button type="button" :disabled="loading || activeFile === mainFile" @click="saveFile(true)"
          >重命名</button
        >
        <button type="button" :disabled="loading || activeFile === mainFile" @click="deleteFile"
          >删除文件</button
        >
        <button type="button" :disabled="loading" @click="reset">重置</button>
        <button type="button" :disabled="loading" @click="run">运行</button>
      </div>
    </div>
    <div
      ref="panel"
      class="react-repl-panel__panes"
      :style="{ gridTemplateColumns: `${editorWidth}% 6px minmax(0, 1fr)` }"
    >
      <div ref="editor" class="react-repl-panel__editor" aria-label="React 示例代码"></div>
      <div
        class="react-repl-panel__divider"
        role="separator"
        tabindex="0"
        aria-label="调整代码与预览宽度"
        aria-orientation="vertical"
        :aria-valuenow="editorWidth"
        :aria-valuemin="20"
        :aria-valuemax="80"
        @pointerdown="resize"
        @pointermove="move"
        @keydown="resizeWithKeyboard"
      ></div>
      <div class="react-repl-panel__preview">
        <iframe ref="preview" title="React 示例预览" sandbox="allow-scripts allow-same-origin" />
        <pre v-if="error" class="react-repl-panel__error" role="alert">{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .react-repl-panel {
    background: var(--sl-color-bg);

    &__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 40px;
      border-bottom: 1px solid var(--sl-color-gray-5);

      button {
        padding: 8px 12px;
        color: var(--sd-color-text-2);
        font: inherit;
        font-size: 13px;
        background: transparent;
        border: 0;
        cursor: pointer;

        &[aria-selected='true'] {
          color: rgb(var(--sd-primary-6));
          box-shadow: inset 0 -2px rgb(var(--sd-primary-6));
        }

        &:focus-visible {
          outline: 2px solid rgb(var(--sd-primary-6));
          outline-offset: -2px;
        }

        &:disabled {
          cursor: default;
          opacity: 0.5;
        }
      }
    }

    &__panes {
      display: grid;
      height: 500px;
      overflow: hidden;
    }

    &__editor {
      min-width: 0;
      height: 100%;
      overflow: hidden;
    }

    &__divider {
      z-index: 1;
      background: var(--sl-color-hairline-light);
      cursor: col-resize;
      touch-action: none;
    }

    &__divider:focus-visible {
      outline: 2px solid rgb(var(--sd-primary-6));
      outline-offset: -2px;
    }

    &__preview {
      position: relative;
      min-width: 0;
      overflow: hidden;
    }

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }

    &__error {
      position: absolute;
      inset: 0;
      margin: 0;
      padding: 16px;
      overflow: auto;
      color: rgb(var(--sd-danger-6));
      white-space: pre-wrap;
      background: var(--sl-color-bg);
    }
  }
</style>
