import type { ComponentResolver } from 'unplugin-vue-components/types';
import type { Plugin } from 'vite';

import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface SdDesignResolverOptions {
  /** @default 'Sd' */
  prefix?: string;
}

export interface SdDesignScssImporterOptions {
  /** @default '@sdata/web-vue' */
  packageName?: string;
}

export interface SdDesignVitePluginOptions extends SdDesignScssImporterOptions {}

const DEFAULT_PREFIX = 'Sd';
const PACKAGE_NAME = '@sdata/web-vue';
const SASS_EXTENSIONS = ['.scss', '.sass', '.css'];

let cachedComponentSet: Set<string> | undefined;

const parseImportClause = (
  clause: string,
  modulePath: string,
  importPathMap: Map<string, string>,
) => {
  const trimmedClause = clause.trim();

  if (!trimmedClause) {
    return;
  }

  const namedOnlyMatch = /^\{([\s\S]*)\}$/.exec(trimmedClause);

  if (namedOnlyMatch) {
    const namedImports =
      namedOnlyMatch[1]
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

    for (const namedImport of namedImports) {
      const [sourceName, localName] = namedImport.split(/\s+as\s+/i).map((item) => item.trim());
      importPathMap.set(localName ?? sourceName, modulePath);
    }

    return;
  }

  const [defaultImport, namedImportsClause] = trimmedClause
    .split(/,\s*(?=\{)/)
    .map((item) => item.trim());

  if (defaultImport) {
    importPathMap.set(defaultImport, modulePath);
  }

  if (!namedImportsClause) {
    return;
  }

  parseImportClause(namedImportsClause, modulePath, importPathMap);
};

const getPackageRoot = () => {
  const require = createRequire(import.meta.url);
  return path.dirname(require.resolve(`${PACKAGE_NAME}/package.json`));
};

const getComponentExportSet = (): Set<string> => {
  if (cachedComponentSet) {
    return cachedComponentSet;
  }

  const packageRoot = getPackageRoot();
  const entryPath = path.resolve(packageRoot, 'es/index.js');
  const source = readFileSync(entryPath, 'utf8');
  const importPathMap = new Map<string, string>();

  for (const match of source.matchAll(/import\s+([\s\S]*?)\s+from\s+["'](\.[^"']+)["'];/g)) {
    const clause = match[1];
    const modulePath = match[2];

    if (!clause || !modulePath) {
      continue;
    }

    parseImportClause(clause, modulePath, importPathMap);
  }

  const exportBlockMatch = /export\s*\{([\s\S]*?)\};?\s*$/.exec(source);

  if (!exportBlockMatch?.[1]) {
    cachedComponentSet = new Set();
    return cachedComponentSet;
  }

  const exportSpecifiers = exportBlockMatch[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const componentSet = new Set<string>();

  for (const exportSpecifier of exportSpecifiers) {
    const [localName, exportedName] = exportSpecifier.split(/\s+as\s+/i).map((item) => item.trim());
    const importName = exportedName ?? localName;

    if (!localName || !importName || importName === 'default') {
      continue;
    }

    const modulePath = importPathMap.get(localName);

    if (!modulePath || modulePath.startsWith('./_') || modulePath === './sd-vue.js') {
      continue;
    }

    componentSet.add(importName);
  }

  cachedComponentSet = componentSet;
  return componentSet;
};

/**
 * Resolver for SD Design Vue
 *
 * @link https://www.npmjs.com/package/@sdata/web-vue
 */
export function SdDesignResolver(options: SdDesignResolverOptions = {}): ComponentResolver[] {
  const prefix = options.prefix ?? DEFAULT_PREFIX;

  return [
    {
      type: 'component',
      resolve: (name: string) => {
        if (!name.startsWith(prefix)) {
          return;
        }

        const componentName = name.substring(prefix.length);

        if (!componentName || !getComponentExportSet().has(componentName)) {
          return;
        }

        return { name: componentName, as: name, from: PACKAGE_NAME };
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Shared SCSS alias resolution – resolves `@style/` and `@components/`
// aliases to the installed `@sdata/web-vue` package's `es/` directory.
// ---------------------------------------------------------------------------

function resolveAliasedPath(url: string, componentsDir: string): string | null {
  const normalized = url.replaceAll('\\', '/');

  if (/^(?:sass:|https?:|file:)/.test(normalized)) {
    return null;
  }

  let basePath: string;

  if (normalized.startsWith('@style/')) {
    basePath = path.resolve(componentsDir, 'style', normalized.slice('@style/'.length));
  } else if (normalized.startsWith('@components/')) {
    basePath = path.resolve(componentsDir, normalized.slice('@components/'.length));
  } else {
    return null;
  }

  const ext = path.extname(basePath);
  const dir = path.dirname(basePath);
  const base = path.basename(basePath);
  const candidates = ext
    ? [basePath]
    : [
        ...SASS_EXTENSIONS.map((e) => `${basePath}${e}`),
        ...SASS_EXTENSIONS.map((e) => path.join(dir, `_${base}${e}`)),
        ...SASS_EXTENSIONS.map((e) => path.join(basePath, `index${e}`)),
        ...SASS_EXTENSIONS.map((e) => path.join(basePath, `_index${e}`)),
      ];

  return candidates.find((c) => existsSync(c)) ?? null;
}

function getComponentsDir(packageName: string): string {
  const packageRoot = path.dirname(createRequire(import.meta.url)(`${packageName}/package.json`));

  return path.resolve(packageRoot, 'es');
}

function createImporter(componentsDir: string) {
  return {
    canonicalize(url: string) {
      const resolved = resolveAliasedPath(url, componentsDir);

      return resolved ? pathToFileURL(resolved) : null;
    },
    async load(canonicalUrl: URL) {
      if (canonicalUrl.protocol !== 'file:') {
        return null;
      }

      const filePath = fileURLToPath(canonicalUrl);
      const ext = path.extname(filePath);
      let syntax: 'scss' | 'indented' | 'css' = 'scss';

      if (ext === '.sass') {
        syntax = 'indented';
      } else if (ext === '.css') {
        syntax = 'css';
      }

      return {
        contents: await readFile(filePath, 'utf8'),
        syntax,
        sourceMapUrl: canonicalUrl,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a custom Sass importer that resolves `@style/` and `@components/`
 * aliases used in `@sdata/web-vue` SCSS files.
 *
 * Use this when you need to configure `css.preprocessorOptions.scss.importers`
 * manually instead of using the Vite plugin.
 *
 * @example
 * ```ts
 * import { createSdDesignScssImporter } from '@sdata/web-vue-auto-import-resolver';
 *
 * export default defineConfig({
 *   css: {
 *     preprocessorOptions: {
 *       scss: {
 *         importers: [createSdDesignScssImporter()],
 *       },
 *     },
 *   },
 * });
 * ```
 */
export function createSdDesignScssImporter(options: SdDesignScssImporterOptions = {}) {
  const packageName = options.packageName ?? PACKAGE_NAME;

  return createImporter(getComponentsDir(packageName));
}

/**
 * Create a Vite plugin that automatically configures a custom Sass importer
 * to resolve `@style/` and `@components/` aliases used in `@sdata/web-vue`
 * SCSS files.  Equivalent to calling `createSdDesignScssImporter()` and
 * adding it to `css.preprocessorOptions.scss.importers` manually.
 *
 * @example
 * ```ts
 * import { createSdDesignVitePlugin, SdDesignResolver } from '@sdata/web-vue-auto-import-resolver';
 *
 * export default defineConfig({
 *   plugins: [
 *     createSdDesignVitePlugin(),
 *     Components({ resolvers: [SdDesignResolver()] }),
 *   ],
 * });
 * ```
 */
export function createSdDesignVitePlugin(options: SdDesignVitePluginOptions = {}): Plugin {
  const packageName = options.packageName ?? PACKAGE_NAME;

  return {
    name: 'sd-design',
    config(config) {
      const importer = createImporter(getComponentsDir(packageName));

      const existingScss =
        (config.css?.preprocessorOptions?.scss as Record<string, unknown> | undefined) ?? {};
      const existingImporters: unknown[] = Array.isArray(existingScss.importers)
        ? (existingScss.importers as unknown[])
        : [];

      return {
        css: {
          ...config.css,
          preprocessorOptions: {
            ...config.css?.preprocessorOptions,
            scss: {
              ...existingScss,
              importers: [importer, ...existingImporters],
            } as Record<string, unknown>,
          },
        },
      };
    },
  };
}
