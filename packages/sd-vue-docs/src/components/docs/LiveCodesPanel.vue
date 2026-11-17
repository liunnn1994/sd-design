<script setup lang="ts">
  import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue';

  import { createPlayground, type Playground } from 'livecodes';
  import scrollbarStylesheet from 'overlayscrollbars/overlayscrollbars.css?inline';

  import {
    createLiveCodesConfig,
    createLiveCodesTheme,
    type ComponentManifest,
  } from '../../browser-repl/livecodes';
  import demoStylesheet from '../../styles/demo.css?inline';
  import editorStylesheet from '../../styles/livecodes.scss?inline';

  const props = defineProps<{ framework: 'vue' | 'react'; source: string; mainFile: string }>();
  const host = useTemplateRef<HTMLDivElement>('host');
  const loading = shallowRef(true);
  const error = shallowRef('');
  let playground: Playground | undefined;
  let observer: MutationObserver | undefined;
  let controller: AbortController | undefined;
  let generation = 0;
  const dark = () => document.documentElement.dataset.theme === 'dark';
  const baseUrl = () =>
    new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/`, location.href).href;

  function applyTheme() {
    const frame = host.value?.querySelector('iframe');
    const editorDocument =
      frame?.contentDocument?.querySelector<HTMLIFrameElement>(
        'iframe[name="app"]',
      )?.contentDocument;
    if (!editorDocument) return;
    let style = editorDocument.getElementById('sd-livecodes-theme');
    if (!style) {
      style = editorDocument.createElement('style');
      style.id = 'sd-livecodes-theme';
      style.textContent = editorStylesheet;
      editorDocument.head.appendChild(style);
    }
    // CSS variables do not inherit across the playground's iframe boundary.
    const tokens = getComputedStyle(document.body);
    for (const property of [
      '--sd-color-bg-2',
      '--sd-color-bg-5',
      '--sd-color-fill-1',
      '--sd-color-fill-2',
      '--sd-color-border-2',
      '--sd-color-text-1',
      '--sd-color-text-2',
      '--sd-color-text-3',
      '--sd-color-primary-light-1',
      '--sd-color-primary-light-2',
      '--sd-primary-6',
      '--sd-border-radius-small',
      '--sd-border-radius-medium',
      '--sl-font',
    ])
      editorDocument.documentElement.style.setProperty(property, tokens.getPropertyValue(property));
  }

  async function load() {
    const current = ++generation;
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    loading.value = true;
    error.value = '';
    try {
      await playground?.destroy();
      playground = undefined;
      async function json<T>(path: string): Promise<T> {
        const response = await fetch(new URL(path, baseUrl()), { signal });
        if (!response.ok) throw new Error(`在线示例资源加载失败 (${response.status})`);
        return response.json() as Promise<T>;
      }
      const vue = props.framework === 'vue';
      const vendor = vue ? 'vendor/sd-web-vue/' : 'vendor/sd-web-react/';
      const [map, types, components] = await Promise.all([
        json<{ imports: Record<string, string> }>(`${vendor}${vue ? 'deps/' : ''}import-map.json`),
        json<{ imports: Record<string, string> }>(`${vendor}types-map.json`),
        vue ? json<ComponentManifest>(`${vendor}deps/component-manifest.json`) : undefined,
      ]);
      const imports = Object.fromEntries(
        Object.entries(map.imports).map(([name, href]) => [
          name,
          new URL(href.startsWith('/vendor/') ? href.slice(1) : `${vendor}${href}`, baseUrl()).href,
        ]),
      );
      if (vue)
        Object.assign(imports, {
          'vue': new URL(`${vendor}vue.runtime.esm-browser.js`, baseUrl()).href,
          '@sdata/web-vue': new URL('es/index.js', new URL(vendor, baseUrl())).href,
          '@sdata/web-vue/': new URL(vendor, baseUrl()).href,
          '@sdata/web-vue/es/icon.js': new URL('es/icon/index.js', new URL(vendor, baseUrl())).href,
        });
      // Their styles are already included in the shared compiled stylesheet.
      for (const name of ['icon', 'icon-component'])
        imports[`@sdata/web-react/styles/${name}.scss`] = 'data:text/javascript,export{}';
      if (current !== generation) return;
      const created = await createPlayground(host.value!, {
        appUrl: new URL('vendor/livecodes/index.html', baseUrl()).href,
        loading: 'eager',
        config: createLiveCodesConfig({
          ...props,
          imports,
          types: Object.fromEntries(
            Object.entries(types.imports).map(([name, path]) => [
              name,
              new URL(`${vendor}${path}`, baseUrl()).href,
            ]),
          ),
          components,
          baseUrl: baseUrl(),
          dark: dark(),
          stylesheets: ['vendor/sd-web-vue/dist/sd.css'],
          css: demoStylesheet + scrollbarStylesheet,
        }),
      });
      if (current !== generation) {
        await created.destroy();
        return;
      }
      playground = created;
      await created.load();
      applyTheme();
      host.value
        ?.querySelector('iframe')
        ?.setAttribute('title', `${vue ? 'Vue' : 'React'} 在线示例编辑器`);
    } catch (cause) {
      if (current === generation && !signal.aborted)
        error.value = cause instanceof Error ? cause.message : String(cause);
    } finally {
      if (current === generation) loading.value = false;
    }
  }
  onMounted(() => {
    void load();
    observer = new MutationObserver((records) => {
      if (records.some((record) => record.attributeName === 'data-theme')) {
        playground
          ?.setConfig(createLiveCodesTheme(dark()))
          .then(applyTheme)
          .catch((cause) => {
            error.value = String(cause);
          });
      } else applyTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style'],
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['sd-theme', 'style'] });
  });
  watch(
    () => [props.source, props.mainFile, props.framework],
    () => void load(),
  );
  onBeforeUnmount(() => {
    generation++;
    controller?.abort();
    observer?.disconnect();
    void playground?.destroy();
  });
</script>

<template>
  <div class="livecodes-panel">
    <div v-if="loading" class="demo-editor__state" role="status">编辑器加载中…</div>
    <div v-if="error" class="demo-editor__state demo-editor__state--error" role="alert"
      >{{ error }} <button type="button" @click="load">重试</button></div
    >
    <div ref="host" class="livecodes-panel__host" data-default-styles="false"></div>
  </div>
</template>

<style lang="scss" scoped>
  .livecodes-panel__host {
    height: 600px;
  }
</style>
