import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'oxfmt';
import * as sass from 'sass';

import { createSassStyleSupport } from './utils/sass-support.mts';

const componentsRoot = fileURLToPath(new URL('../components/', import.meta.url));
// oxlint-disable-next-line import/extensions -- Node's native TypeScript loader requires the extension.
import { normalizeTokenKey as normalize } from '../components/config-provider/token-key.ts';
async function writeGenerated(file, source) {
  const result = await format(file, source, { printWidth: 100, singleQuote: true });
  if (result.errors.length) throw new Error(`Cannot format generated theme file: ${file}`);
  let previous = '';
  try {
    previous = await fs.readFile(file, 'utf8');
  } catch {
    /* First generation. */
  }
  if (previous !== result.code) await fs.writeFile(file, result.code);
}

// Only CSS-facing variables belong in the editor. Sass configuration, maps and
// selectors remain compile-time values.
export function declarations(source) {
  return [...source.matchAll(/^\$([\w-]+):\s*([^;]+);/gm)].map((match) => ({
    name: match[1],
    value: match[2].trim(),
  }));
}

// Strip full-span `#{...}` interpolation layers (brace-matched, so inner
// `#{...}` or quoted braces are left intact) left by earlier generator runs.
function stripInterpolation(value) {
  let rest = value;
  for (;;) {
    if (!rest.startsWith('#{')) return rest;
    let depth = 0;
    let closed = -1;
    for (let index = 0; index < rest.length; index++) {
      if (rest[index] === '{') depth++;
      else if (rest[index] === '}') {
        depth--;
        if (depth === 0) {
          closed = index;
          break;
        }
      }
    }
    if (closed !== rest.length - 1) return rest;
    rest = rest.slice(2, -1).trim();
  }
}

export async function generateThemeCatalog(root = componentsRoot) {
  const components = [];
  const compileTime = new Set();
  const compileTimePatterns = [];
  // Sass arithmetic and control flow require actual numbers. Keep those inputs
  // compile-time until the consuming expression is migrated to CSS calc().
  for (const file of await fs.readdir(root, { recursive: true })) {
    if (!file.endsWith('.scss') || file.endsWith('token.scss')) continue;
    const source = await fs.readFile(path.join(root, file), 'utf8');
    if (source.includes('math.')) {
      for (const match of source.matchAll(/string\.unquote\('([\w-]+#\{\$[\w-]+\}[\w-]*)'\)/g)) {
        compileTimePatterns.push(new RegExp(`^${match[1].replace(/#\{[^}]+\}/g, '[\\w-]+')}$`));
      }
    }
    for (const statement of source.split(/[;{}]/)) {
      if (!/math\.|@if|@for|@each|\s[+*/-]\s|\(-\$/.test(statement) || statement.includes('calc('))
        continue;
      for (const match of statement.matchAll(/\$([\w-]+)/g)) compileTime.add(normalize(match[1]));
    }
  }
  const globalSource = await fs.readFile(path.join(root, 'style/theme/global.scss'), 'utf8');
  const globals = declarations(globalSource).filter(
    ({ name, value }) =>
      /^(border|size|spacing|font-size|font-weight|line-height|opacity|shadow|color)-/.test(name) &&
      !value.includes('!default'),
  );
  const globalNames = new Set(globals.map(({ name }) => name));
  const runtimeGlobals = new Set();
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const file = path.join(root, entry.name, 'style/token.scss');
    let source;
    try {
      source = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    source = source.split('// @generated runtime tokens')[0].trimEnd();
    if (!source.includes('as theme-runtime;'))
      source = `@use '@style/theme/runtime.scss' as theme-runtime;\n${source}`;
    const tokens = declarations(source).filter(
      ({ name, value }) =>
        !/prefix|selector/.test(name) &&
        !value.startsWith('(') &&
        !/^(true|false|null)$/.test(value) &&
        !compileTime.has(normalize(name)) &&
        !compileTimePatterns.some((pattern) => pattern.test(name)),
    );
    if (!tokens.length) continue;
    const entries = tokens.map(({ name, value }) => {
      const key = normalize(name);
      const dependencies = [...value.matchAll(/(?:global|theme)\.\$([\w-]+)/g)].map((match) =>
        normalize(match[1]),
      );
      return { key, name, value, dependencies };
    });
    components.push({ name: entry.name, tokens: entries });
    const runtime = tokens.map(({ name, value }) => {
      const direct = value.match(/^(?:global|theme)\.\$([\w-]+)$/)?.[1];
      const local = value.match(/^\$([\w-]+)$/)?.[1];
      if (direct && globalNames.has(direct)) runtimeGlobals.add(direct);
      const global = direct && globalNames.has(direct) ? `, '${normalize(direct)}'` : '';
      return `$${name}: theme-runtime.token('${entry.name}', '${normalize(name)}', $${local ?? name}${global});`;
    });
    const next = `${source}\n\n// @generated runtime tokens — pnpm theme:generate\n${runtime.join('\n')}\n`;
    await writeGenerated(file, next);
  }
  const support = createSassStyleSupport({
    packageRoot: path.dirname(root),
    componentsRoot: root,
    styleRoot: path.join(root, 'style'),
  });
  // Interpolate Sass expressions in custom properties; otherwise Sass preserves
  // expressions such as theme.$color-bg-2 literally in the emitted CSS.
  for (const relative of ['style/theme/css-variables.scss', 'style/color/css-variables.scss']) {
    const file = path.join(root, relative);
    const source = await fs.readFile(file, 'utf8');
    const next = source.replace(
      /(#\{theme\.\$sd-cssvars-prefix\}-([\w-]+):)\s*([^;]+);/g,
      (all, declaration, key, value) => {
        // oxfmt wraps long values across lines (`var(\n  --key,`), so both
        // whitespace and the space after `var(` must be normalized before
        // matching earlier runs' wrappers; otherwise every run wraps again
        // and the fallback chain grows without bound.
        let rest = value.replace(/\s+/g, ' ').trim();
        const wrapperRe = new RegExp(`^var\\(\\s*--${key}\\s*,`);
        // Unwrap layers left by earlier runs — var(--key, X) 剥一层，冗余的
        // 全跨度 #{...} 插值层剥到底，然后只包一层，保证重复生成幂等。
        for (;;) {
          if (wrapperRe.test(rest)) {
            const inner = rest.replace(wrapperRe, '').trimEnd();
            if (inner.endsWith(')')) {
              rest = inner.slice(0, -1).trim();
              continue;
            }
          }
          const stripped = stripInterpolation(rest);
          if (stripped === rest) break;
          rest = stripped;
        }
        if (wrapperRe.test(rest)) return all;
        return `${declaration} var(--${key}, #{${rest}});`;
      },
    );
    await writeGenerated(file, next);
  }
  const modules = components.map(
    (component, index) => `@use '@components/${component.name}/style/token.scss' as c${index};`,
  );
  const probes = components.map(
    (component, index) =>
      `.c${index} { ${component.tokens.map(({ key, name }) => `--${key}: #{c${index}.$${name}};`).join('\n')} }`,
  );
  const compiled = await sass.compileStringAsync(
    [
      "@use '@style/theme/global.scss' as global;",
      ...modules,
      `.globals { ${globals.map(({ name }) => `--${name}: #{global.$${name}};`).join('\n')} }`,
      ...probes,
    ].join('\n'),
    { importers: [support.sassImporter] },
  );
  const sections = [...compiled.css.matchAll(/\.(globals|c\d+)\s*\{([^}]+)\}/g)];
  const values = new Map(
    sections.map(([, name, body]) => [
      name,
      Object.fromEntries(
        [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value]),
      ),
    ]),
  );
  components.forEach((component, index) =>
    component.tokens.forEach((token) => {
      const resolved = values.get(`c${index}`)?.[token.key] ?? token.value;
      token.value = resolved
        .replace(/^var\(--component-[^,]+,\s*var\(--component-[^,]+,\s*/, '')
        .slice(0, -2);
    }),
  );
  const { css } = await sass.compileStringAsync(
    "@use '@style/theme/css-variables.scss'; @use '@style/color/css-variables.scss' as colors;",
    { importers: [support.sassImporter] },
  );
  const cssGlobals = new Map();
  for (const [, key, value] of css.matchAll(/--sd-([\w-]+):\s*var\(--[\w-]+,\s*([^;]+)\);/g)) {
    if (!cssGlobals.has(key)) cssGlobals.set(key, value);
  }
  const globalTokens = new Map(
    globals
      .filter(({ name }) => runtimeGlobals.has(name))
      .map(({ name, value }) => [name, values.get('globals')?.[name] ?? value]),
  );
  for (const [key, value] of cssGlobals) globalTokens.set(key, value);
  const catalog = {
    globals: [...globalTokens].map(([key, value]) => ({ key, value })),
    components,
  };
  const output = path.join(root, 'config-provider/theme-catalog.json');
  await writeGenerated(output, `${JSON.stringify(catalog, null, 2)}\n`);
  process.stdout.write(
    `Theme catalog: ${globalTokens.size} global tokens, ${components.length} components, ${components.reduce((sum, item) => sum + item.tokens.length, 0)} component tokens.\n`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateThemeCatalog();
}
