import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build } from 'vite';

import { buildTypeReferenceManifest } from './build-type-reference-manifest.ts';

const docsRoot = resolve(import.meta.dirname, '..');
const workspaceRoot = resolve(docsRoot, '../..');
const reactRoot = resolve(workspaceRoot, 'packages/web-react');
const vendorRoot = resolve(docsRoot, 'public/vendor/sd-web-react');
const manifest = JSON.parse(readFileSync(resolve(reactRoot, 'package.json'), 'utf8')) as {
  exports: Record<string, string | { import?: string }>;
};
const inputs: Record<string, string> = {};
const imports: Record<string, string> = {};
const runtimeEntries = new Map<string, string>();

function addInput(specifier: string, file: string, name: string) {
  if (specifier in imports) return;
  inputs[name] = file;
  imports[specifier] = `modules/${name}.js`;
}
for (const [key, condition] of Object.entries(manifest.exports)) {
  const target = typeof condition === 'string' ? condition : condition.import;
  if (!target || !target.endsWith('.js')) continue;
  if (key.includes('*')) {
    const [prefix, suffix] = target.split('*');
    for (const path of globSync(target, { cwd: reactRoot })) {
      const normalized = path.replaceAll('\\', '/').replace(/^\.\//, '');
      const variable = normalized.slice(
        prefix!.replace(/^\.\//, '').length,
        suffix ? -suffix.length : undefined,
      );
      const exportName = key.replace('*', variable);
      addInput(
        `@sdata/web-react/${exportName.slice(2)}`,
        resolve(reactRoot, path),
        `library/${exportName.slice(2)}`,
      );
    }
  } else {
    addInput(
      key === '.' ? '@sdata/web-react' : `@sdata/web-react/${key.slice(2)}`,
      resolve(reactRoot, target),
      key === '.' ? 'library/index' : `library/${key.slice(2)}`,
    );
  }
}
for (const specifier of [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
]) {
  const namespace = await import(specifier);
  const runtime = namespace.default ?? namespace;
  const names = Object.keys(runtime).filter(
    (name) => name !== 'default' && name !== '__esModule' && /^[A-Za-z_$][\w$]*$/.test(name),
  );
  const entry = `virtual:sd-react-runtime/${specifier}`;
  // An import-map entry must expose actual ESM named exports, including Fragment/jsx.
  runtimeEntries.set(
    entry,
    `import runtime from ${JSON.stringify(specifier)};\nexport default runtime;\nexport const { ${names.join(', ')} } = runtime;`,
  );
  addInput(specifier, entry, `runtime/${specifier}`);
}

// Compile optional imports used by actual examples into the same module graph. React is
// bundled once across all entrypoints, so the library and iframe cannot get separate hooks runtimes.
for (const file of globSync('src/components/react/generated/**/*.tsx', { cwd: docsRoot })) {
  const source = ts.createSourceFile(
    file,
    readFileSync(resolve(docsRoot, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const specifiers = new Set<string>();
  const visit = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      !node.importClause?.isTypeOnly &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      specifiers.add(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      specifiers.add(node.arguments[0].text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  for (const specifier of specifiers) {
    if (specifier.startsWith('.') || specifier.startsWith('/') || /\.(css|scss)$/.test(specifier))
      continue;
    if (specifier === 'vue' || specifier.startsWith('@vueuse/'))
      throw new Error(`React example imports Vue runtime: ${file}`);
    if (!(specifier in imports))
      addInput(specifier, fileURLToPath(import.meta.resolve(specifier)), `deps/${specifier}`);
  }
}

await build({
  configFile: false,
  root: docsRoot,
  publicDir: false,
  base: './',
  logLevel: 'warn',
  plugins: [
    {
      name: 'sd-react-runtime-entries',
      resolveId(id) {
        if (runtimeEntries.has(id)) return id;
      },
      load(id) {
        return runtimeEntries.get(id);
      },
    },
  ],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: vendorRoot,
    emptyOutDir: true,
    modulePreload: false,
    sourcemap: false,
    minify: true,
    // This is a full offline REPL vendor catalog, not a page entry bundle. Optional
    // runtimes such as web-llm/WASM exceed the application default of 500 kB.
    chunkSizeWarningLimit: 10_000,
    rolldownOptions: {
      onwarn(warning, defaultHandler) {
        // These modules only run inside the browser iframe, never as RSC modules.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('"use client"'))
          return;
        defaultHandler(warning);
      },
      input: inputs,
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: 'modules/[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
mkdirSync(vendorRoot, { recursive: true });
writeFileSync(resolve(vendorRoot, 'import-map.json'), `${JSON.stringify({ imports }, null, 2)}\n`);

const typeManifest = await buildTypeReferenceManifest({
  workspaceRoot,
  entryPath: resolve(reactRoot, 'src/index.ts'),
  packageName: '@sdata/web-react',
});
writeFileSync(resolve(vendorRoot, 'type-reference-manifest.json'), JSON.stringify(typeManifest));
console.log(
  `React playground: ${Object.keys(imports).length} browser modules, ${Object.keys(typeManifest.types).length} public types.`,
);
