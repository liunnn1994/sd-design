import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'cypress';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithEsbuild } from 'vite';

const require = createRequire(import.meta.url);
const toPosix = (value: string) => value.replaceAll('\\', '/');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const componentsRoot = path.resolve(root, 'components');
const docsRoot = path.resolve(root, '..', 'sd-vue-docs');

// Mirrors the test aliases in vite.config.ts `createTestSupportConfig`, so that
// component source (`@sdata/web-vue`) and the docs demos
// (`@sdata/web-vue/es/icon`) resolve to source under components/.
const resolveAlias = [
  {
    find: /^@style\/(.*)$/,
    replacement: `${toPosix(path.resolve(componentsRoot, 'style'))}/$1`,
  },
  {
    find: /^@components\/(.*)$/,
    replacement: `${toPosix(componentsRoot)}/$1`,
  },
  // Full Vue build (with the runtime template compiler) so specs that mount
  // inline `{ template: '...' }` components compile — matching vitest.
  {
    find: /^vue$/,
    replacement: toPosix(require.resolve('vue/dist/vue.esm-bundler.js')),
  },
  {
    find: /^@sdata\/web-vue$/,
    replacement: toPosix(path.resolve(componentsRoot, 'index.ts')),
  },
  {
    find: /^@sdata\/web-vue\/es\/icon(\/index\.js)?$/,
    replacement: toPosix(path.resolve(componentsRoot, 'icon/index.ts')),
  },
  {
    find: /^@sdata\/web-vue\/es\/locale\/lang\/(.*)$/,
    replacement: `${toPosix(path.resolve(componentsRoot, 'locale/lang'))}/$1`,
  },
];

// Vite 8's oxc transformer determines a file's language from its on-disk
// extension and ignores the `lang.*` query, so it parses Vue's virtual
// `*.vue?vue&type=script...lang.tsx` script blocks as plain JavaScript and
// errors on `import type` / `as` assertions. This pre-transform strips TS via
// esbuild (with the correct loader from the `lang` query) before oxc runs. The
// `.tsx` blocks in this repo use `h()` rather than JSX, so default JSX handling
// is fine.
function vueScriptLangTransform() {
  return {
    name: 'sd:vue-script-lang-transform',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      if (!id.includes('?vue&type=script')) {
        return null;
      }

      const match = id.match(/[?&]lang\.(ts|tsx|js|jsx)(?:&|$)/);
      if (!match) {
        return null;
      }

      const result = await transformWithEsbuild(code, id, {
        loader: match[1] as 'ts' | 'tsx' | 'js' | 'jsx',
        target: 'esnext',
      });

      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig({
  // Real browser (Chromium via Electron by default). No virtual/jsdom env.
  video: false,
  screenshotOnRunFailure: false,
  // No Cypress.env() exposure to browser code (none of our specs use it).
  allowCypressEnv: false,
  // Retry flaky specs in `run` (CI) mode only. The component-test support module
  // imports the entire SDVue library, so under a full-suite load the Vite dev
  // server occasionally times out transforming it ("Failed to fetch ... component.ts").
  // Every such spec passes when run alone, so a retry reliably clears it without
  // masking real failures. Interactive `open` mode stays retry-free.
  retries: {
    runMode: 2,
    openMode: 0,
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig: {
        resolve: { alias: resolveAlias },
        // Feature flags required by the full `vue.esm-bundler` build.
        define: {
          __VUE_OPTIONS_API__: 'true',
          __VUE_PROD_DEVTOOLS__: 'false',
        },
        plugins: [vueScriptLangTransform(), vue(), vueJsx()],
        server: {
          fs: { allow: [toPosix(root), toPosix(docsRoot)] },
        },
      },
    },
    specPattern: 'components/**/__test__/*.cy.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    supportFile: 'cypress/support/component.ts',
  },
});
