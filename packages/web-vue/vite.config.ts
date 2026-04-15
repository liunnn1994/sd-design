import type { PluginOption, UserConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import CleanCSS from 'clean-css';
import { globSync } from 'glob';
import less from 'less';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';
import { configDefaults } from 'vitest/config';

import cssjsPlugin from './scripts/plugins/vite-plugin-cssjs.mjs';
import externalPlugin from './scripts/plugins/vite-plugin-external.mjs';
import vueExportHelperPlugin from './scripts/plugins/vite-plugin-vue-export-helper.mjs';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const resolveFromRoot = (...segments: string[]) => path.resolve(packageRoot, ...segments);

const componentsRoot = resolveFromRoot('components');

const langFiles = globSync('components/locale/lang/*.ts', {
  cwd: packageRoot,
  posix: true,
});

function createDemoMarkdownPlugin(): PluginOption {
  return {
    name: 'sd-demo-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/__demo__/') || !id.endsWith('.md')) {
        return null;
      }
      const regex = /```vue\r?\n([\s\S]*?)```/;
      const match = regex.exec(code);
      if (!match) {
        throw new Error(`Missing vue demo block in ${id}`);
      }

      return match[1].trim();
    },
  };
}

function createTestSupportConfig(): UserConfig {
  return {
    resolve: {
      alias: [
        {
          find: /^@sdata\/web-vue$/,
          replacement: resolveFromRoot('components/index.ts'),
        },
        {
          find: /^@sdata\/web-vue\/es\/icon$/,
          replacement: resolveFromRoot('components/icon/index.ts'),
        },
        {
          find: /^@sdata\/web-vue\/es\/locale\/lang\/(.*)$/,
          replacement: `${resolveFromRoot('components/locale/lang')}/$1`,
        },
      ],
    },
    plugins: [
      createDemoMarkdownPlugin(),
      vue({ include: [/\.vue$/, /__demo__\/.*\.md$/] }),
      vueJsx(),
    ],
  };
}

function createRunConfig() {
  return {
    tasks: {
      'clean:outputs': {
        command: 'pnpm exec rimraf es lib dist .temp-types',
        cache: false,
      },
      'gen:icons': {
        command: 'node ./scripts/gen-icons.mjs',
      },
      'gen:less': {
        command: 'node ./scripts/gen-less-index.mjs',
      },
      'gen:web-types': {
        command: 'node ./scripts/gen-web-types.mjs',
      },
      'task:dev-component': {
        command: 'vite build --config vite.config.ts --mode dev-component --watch',
        cache: false,
      },
      'task:build-module': {
        command:
          'vp run clean:outputs && vp run task:build-module-es && vp run task:build-module-cjs',
      },
      'task:build-module-es': {
        command: 'vite build --config vite.config.ts --mode build-module-es',
      },
      'task:build-module-cjs': {
        command: 'vite build --config vite.config.ts --mode build-module-cjs',
      },
      'task:build-umd-component': {
        command: 'vite build --config vite.config.ts --mode build-umd-component',
      },
      'task:build-umd-component-min': {
        command: 'vite build --config vite.config.ts --mode build-umd-component-min',
      },
      'task:build-umd-icon': {
        command: 'vite build --config vite.config.ts --mode build-umd-icon',
      },
      'task:build-umd-icon-min': {
        command: 'vite build --config vite.config.ts --mode build-umd-icon-min',
      },
      'task:build-component': {
        command:
          'vp run clean:outputs && vp run task:build-module && vp run task:build-umd-component && vp run task:build-umd-component-min && vp run task:build-umd-icon && vp run task:build-umd-icon-min',
      },
      'task:build-style': {
        command: 'vite build --config vite.config.ts --mode build-style',
      },
      'task:build-dts': {
        command: 'node ./scripts/build-dts.mjs',
      },
    },
  };
}

function createModuleBuildConfig(format: 'es' | 'cjs'): UserConfig {
  const outputDir = format === 'es' ? 'es' : 'lib';

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: outputDir,
      emptyOutDir: false,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: ['components/index.ts', 'components/icon/index.ts', ...langFiles],
        output: {
          format,
          dir: outputDir,
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'components',
        },
      },
      lib: {
        entry: 'components/index.ts',
        formats: [format],
      },
    },
    plugins: [externalPlugin(), vue(), vueJsx(), vueExportHelperPlugin()],
  };
}

function createUmdBuildConfig(type: 'component' | 'icon', minify: boolean): UserConfig {
  const entry = type === 'component' ? 'components/sd-vue.ts' : 'components/icon/sd-vue-icon.ts';
  const entryFileName = type === 'component' ? 'sd-vue' : 'sd-vue-icon';
  const name = type === 'component' ? 'SDVue' : 'SDVueIcon';

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: !minify,
      minify: minify ? 'esbuild' : false,
      reportCompressedSize: false,
      rollupOptions: {
        external: ['vue'],
        output: {
          format: 'umd',
          name,
          entryFileNames: `${entryFileName}${minify ? '.min' : ''}.js`,
          globals: {
            vue: 'Vue',
          },
        },
      },
      lib: {
        entry,
        formats: ['umd'],
        name,
      },
    },
    plugins: [vue(), vueJsx()],
  };
}

async function copyInto(targetPath: string, sourcePath: string) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { recursive: true, force: true });
}

async function emitStyleArtifacts() {
  const files = globSync('**/*.{less,js}', {
    cwd: componentsRoot,
    posix: true,
  });

  for (const filename of files) {
    const absolute = resolveFromRoot('components', filename);
    await copyInto(resolveFromRoot('es', filename), absolute);
    await copyInto(resolveFromRoot('lib', filename), absolute);

    if (filename.endsWith('index.less')) {
      const lessContent = await readFile(absolute, 'utf8');
      const result = await less.render(lessContent, {
        filename,
        paths: [path.resolve(componentsRoot, path.dirname(filename)), packageRoot],
      });
      const cssFilename = filename.replace('.less', '.css');
      await writeFile(resolveFromRoot('es', cssFilename), result.css, 'utf8');
      await writeFile(resolveFromRoot('lib', cssFilename), result.css, 'utf8');
    }
  }

  const indexLessPath = resolveFromRoot('components', 'index.less');
  await copyInto(resolveFromRoot('es', 'index.less'), indexLessPath);
  await copyInto(resolveFromRoot('lib', 'index.less'), indexLessPath);

  const indexLess = await readFile(indexLessPath, 'utf8');
  const result = await less.render(indexLess, {
    filename: indexLessPath,
    paths: [componentsRoot],
  });

  await rm(resolveFromRoot('dist'), { recursive: true, force: true });
  await mkdir(resolveFromRoot('dist'), { recursive: true });

  await writeFile(resolveFromRoot('dist', 'sd.less'), "@import '../es/index.less';\n\n", 'utf8');
  await writeFile(resolveFromRoot('dist', 'sd.css'), result.css, 'utf8');

  const compress = (new CleanCSS() as any).minify(result.css);
  await writeFile(resolveFromRoot('dist', 'sd.min.css'), compress.styles, 'utf8');
}

function createStyleArtifactsPlugin(): PluginOption {
  return {
    name: 'sd-style-artifacts',
    async buildStart() {
      await emitStyleArtifacts();
    },
  };
}

function createStyleBuildConfig(): UserConfig {
  const indexFiles = globSync('components/**/style/index.ts', {
    cwd: packageRoot,
    posix: true,
  });
  const rollupInput = Object.fromEntries(
    indexFiles.map((current) => [current.slice(11, -3), resolveFromRoot(current)]),
  );

  return {
    mode: 'production',
    build: {
      target: 'es2015',
      outDir: 'es',
      emptyOutDir: false,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        external: /less$/,
        input: rollupInput,
        output: [
          {
            format: 'es',
            dir: 'es',
            entryFileNames: '[name].js',
          },
          {
            format: 'cjs',
            dir: 'lib',
            entryFileNames: '[name].js',
          },
        ],
      },
      lib: {
        entry: 'components/index.ts',
        formats: ['es', 'cjs'],
      },
    },
    plugins: [createStyleArtifactsPlugin(), cssjsPlugin()],
  };
}

function createDevBuildConfig(): UserConfig {
  return {
    mode: 'development',
    build: {
      target: 'es2015',
      outDir: 'es',
      emptyOutDir: true,
      minify: false,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'components',
        },
      },
      lib: {
        entry: 'components/index.ts',
        formats: ['es'],
      },
      watch: {},
    },
    plugins: [externalPlugin(), vue(), vueJsx()],
  };
}

export default defineConfig(({ mode }) => {
  const run = createRunConfig();
  const test: any = {
    globals: true,
    environment: 'jsdom',
    testTimeout: 15000,
    setupFiles: ['./vitest.setup.ts'],
    sequence: {
      hooks: 'list' as const,
    },
    include: [
      'components/**/__test__/**/*.test.{ts,tsx}',
      'components/**/__test__/**/*.spec.{ts,tsx}',
    ],
    exclude: [...configDefaults.exclude, '**/{dist,lib,es,json}/**', '**/.temp-types/**'],
    snapshotSerializers: ['jest-serializer-vue'],
  };

  if (mode === 'dev-component') {
    return {
      ...createDevBuildConfig(),
      run,
      test,
    } as any;
  }

  if (mode === 'build-module') {
    return {
      ...createModuleBuildConfig('es'),
      run,
      test,
    } as any;
  }

  if (mode === 'build-module-es') {
    return {
      ...createModuleBuildConfig('es'),
      run,
      test,
    } as any;
  }

  if (mode === 'build-module-cjs') {
    return {
      ...createModuleBuildConfig('cjs'),
      run,
      test,
    } as any;
  }

  if (mode === 'build-umd-component') {
    return {
      ...createUmdBuildConfig('component', false),
      run,
      test,
    } as any;
  }

  if (mode === 'build-umd-component-min') {
    return {
      ...createUmdBuildConfig('component', true),
      run,
      test,
    } as any;
  }

  if (mode === 'build-umd-icon') {
    return {
      ...createUmdBuildConfig('icon', false),
      run,
      test,
    } as any;
  }

  if (mode === 'build-umd-icon-min') {
    return {
      ...createUmdBuildConfig('icon', true),
      run,
      test,
    } as any;
  }

  if (mode === 'build-style') {
    return {
      ...createStyleBuildConfig(),
      run,
      test,
    } as any;
  }

  return {
    ...createTestSupportConfig(),
    run,
    test,
  } as any;
});
