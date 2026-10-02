import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// 这里只检查类型导出。运行时导出由 components/markdown-render/__test__/exports.cy.ts
// 在浏览器里比对（CYPRESS 会把同名符号的静默挤掉暴露成 DOM 里拿不到的符号），
// 两者互补：跑本文件不需要浏览器，跑那个不需要 TNB 的编译服务。

const compatibilityEntry = fileURLToPath(
  new URL('../components/markdown-render/upstream.ts', import.meta.url),
);
const rootEntry = fileURLToPath(new URL('../components/index.ts', import.meta.url));
const program = ts.createProgram([compatibilityEntry, rootEntry], {
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();
const compatibilitySource = program.getSourceFile(compatibilityEntry);
const upstreamModule = checker.getSymbolAtLocation(
  compatibilitySource.statements.find((statement) => statement.moduleSpecifier).moduleSpecifier,
);
const resolveSymbol = (symbol) =>
  symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
const upstreamTypes = checker
  .getExportsOfModule(upstreamModule)
  .filter((symbol) => resolveSymbol(symbol).flags & ts.SymbolFlags.Type);

for (const entry of [compatibilityEntry, rootEntry]) {
  test(`${entry} preserves every upstream public type`, () => {
    assert.ok(upstreamTypes.length > 0, 'Upstream type declarations must resolve');
    const exports = new Map(
      checker
        .getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))
        .map((symbol) => [symbol.name, resolveSymbol(symbol)]),
    );
    const missing = upstreamTypes
      .filter((symbol) => !(exports.get(symbol.name)?.flags & ts.SymbolFlags.Type))
      .map((symbol) => symbol.name);
    assert.deepEqual(missing, [], `Missing public types: ${missing.join(', ')}`);
  });
}
