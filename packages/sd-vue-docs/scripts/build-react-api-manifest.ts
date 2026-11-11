import { resolve } from 'node:path';
import ts from 'typescript';

export type ReactApiManifest = Record<string, Record<string, string>>;

export function buildReactApiManifest(
  root = resolve(import.meta.dirname, '../../web-react'),
): ReactApiManifest {
  const entry = resolve(root, 'src/index.ts');
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
    noEmit: true,
    esModuleInterop: true,
  });
  const source = program.getSourceFile(entry)!;
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(source)!;
  const manifest: ReactApiManifest = {};
  for (const symbol of checker.getExportsOfModule(module)) {
    const name = symbol.getName();
    if (!/^[A-Z]/.test(name)) continue;
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const isType = !!(target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias));
    const type = isType
      ? checker.getDeclaredTypeOfSymbol(target)
      : checker.getTypeOfSymbolAtLocation(symbol, source);
    const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
    const parameter = signature?.getParameters()[0];
    const props =
      !isType && parameter ? checker.getTypeOfSymbolAtLocation(parameter, source) : type;
    const entries: Record<string, string> = {};
    const variants =
      isType && props.isUnion()
        ? props.types.filter((part) => part.flags & ts.TypeFlags.Object || part.isIntersection())
        : [props];
    for (const prop of variants.flatMap((part) => checker.getPropertiesOfType(part))) {
      const declaration = prop.valueDeclaration ?? prop.declarations?.[0] ?? source;
      const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
      entries[prop.getName()] = checker
        .typeToString(propType, source, ts.TypeFormatFlags.NoTruncation)
        .replace(/ \| undefined$/, '');
    }
    for (const index of checker.getIndexInfosOfType(props)) {
      entries[checker.typeToString(index.keyType)] = checker.typeToString(
        index.type,
        source,
        ts.TypeFormatFlags.NoTruncation,
      );
    }
    if (Object.keys(entries).length) manifest[name] = entries;
  }
  return manifest;
}
