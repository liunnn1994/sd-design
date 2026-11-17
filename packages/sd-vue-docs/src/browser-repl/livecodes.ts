import type { Config } from 'livecodes';

export interface ComponentManifest {
  exports: Record<
    string,
    { importMode: 'default' | 'named'; importedName?: string; specifier: string }
  >;
}

export function createLiveCodesTheme(dark: boolean) {
  return {
    theme: dark ? ('dark' as const) : ('light' as const),
    htmlAttrs: { 'lang': 'zh-CN', 'sd-theme': dark ? 'dark' : 'light' },
  };
}

export function createLiveCodesConfig(options: {
  framework: 'vue' | 'react';
  source: string;
  mainFile: string;
  imports: Record<string, string>;
  types: Record<string, string>;
  baseUrl: string;
  stylesheets: string[];
  css: string;
  dark: boolean;
  components?: ComponentManifest;
}): Partial<Config> {
  const { framework, source, mainFile, baseUrl, components } = options;
  const imports = Object.fromEntries(
    Object.entries(options.imports).map(([name, href]) => [name, new URL(href, baseUrl).href]),
  );
  const registration: string[] = [];
  if (framework === 'vue') {
    for (const tag of new Set(
      Array.from(source.matchAll(/<\/?(sd-[\w-]+)\b/g), (match) => match[1]!),
    )) {
      const name = tag
        .slice(3)
        .split('-')
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join('');
      const entry = components?.exports[name];
      const alias = `Sd${name}`;
      if (!entry || new RegExp(`\\b${alias}\\b`).test(source)) continue;
      registration.push(
        entry.importMode === 'default'
          ? `import ${alias} from ${JSON.stringify(entry.specifier)};`
          : `import { ${entry.importedName ?? name} as ${alias} } from ${JSON.stringify(entry.specifier)};`,
      );
    }
    for (const tag of new Set(
      Array.from(source.matchAll(/<\/?(icon-[\w-]+)\b/g), (match) => match[1]!),
    )) {
      const name = tag
        .split('-')
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join('');
      if (!new RegExp(`\\b${name}\\b`).test(source))
        registration.push(`import { ${name} } from '@sdata/web-vue/es/icon.js';`);
    }
  }
  // Docs register SD components globally; standalone examples need visible, editable imports.
  const setup = /<script\b[^>]*\bsetup\b[^>]*>/;
  const vueSource = !registration.length
    ? source
    : setup.test(source)
      ? source.replace(setup, (opening) => `${opening}\n${registration.join('\n')}`)
      : `<script setup>\n${registration.join('\n')}\n</script>\n${source}`;
  // This docs-only JSX directive disables LiveCodes' automatic React mounting.
  const reactSource = source.replace(/^\s*\/\*\*\s*@jsxImportSource\s+react\s*\*\/\s*/, '');
  return {
    title: `SD Design ${framework} · ${mainFile}`,
    ...createLiveCodesTheme(options.dark),
    editor: 'monaco',
    appLanguage: 'zh-CN',
    editorTheme: ['vs@light', 'vs-dark@dark'],
    fontSize: 14,
    mode: 'full',
    activeEditor: framework === 'vue' ? 'markup' : 'script',
    allowLangChange: false,
    recoverUnsaved: false,
    autosave: false,
    autoupdate: true,
    delay: 300,
    head: '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script>globalThis.process??={env:{NODE_ENV:"production"}};globalThis.global??=globalThis;addEventListener("DOMContentLoaded",()=>document.body.setAttribute("sd-theme",document.documentElement.getAttribute("sd-theme")||"light"));</script>',
    markup:
      framework === 'vue'
        ? {
            language: 'vue',
            content: vueSource,
            title: mainFile,
          }
        : { language: 'html', hideTitle: true, hiddenContent: '<div id="livecodes-app"></div>' },
    script:
      framework === 'vue'
        ? { language: 'javascript', hideTitle: true }
        : { language: 'tsx', content: reactSource, title: mainFile },
    style: {
      language: 'css',
      hiddenContent: `${options.css}\nbody{margin:0;padding:16px;background:var(--sd-color-bg-2);color:var(--sd-color-text-1);}`,
    },
    stylesheets: options.stylesheets.map((href) => new URL(href, baseUrl).href),
    imports,
    types: options.types,
  };
}
