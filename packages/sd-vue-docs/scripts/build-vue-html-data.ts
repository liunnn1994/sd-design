import { resolve } from 'node:path';
import ts from 'typescript';

export function buildVueHtmlData(root = resolve(import.meta.dirname, '../../web-vue')) {
  const entry = resolve(root, 'es/index.d.ts');
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    noEmit: true,
  });
  const source = program.getSourceFile(entry)!;
  const checker = program.getTypeChecker();
  const tags = [];
  for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(source)!)) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, source);
    const constructor = checker.getSignaturesOfType(type, ts.SignatureKind.Construct)[0];
    const instance = constructor?.getReturnType();
    const propsSymbol = instance?.getProperty('$props');
    const call = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
    const parameter = call?.getParameters()[0];
    const props = propsSymbol
      ? checker.getTypeOfSymbolAtLocation(propsSymbol, source)
      : parameter && checker.getTypeOfSymbolAtLocation(parameter, source);
    if (!props || !/^[A-Z]/.test(symbol.name)) continue;
    const attributes = checker
      .getPropertiesOfType(props)
      .filter((prop) => !prop.name.startsWith('$') && !/^on[A-Z]/.test(prop.name))
      .map((prop) => ({
        name: prop.name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        description: ts.displayPartsToString(prop.getDocumentationComment(checker)),
      }));
    if (attributes.length)
      tags.push({
        name: `sd-${symbol.name.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()}`,
        attributes,
      });
  }
  return { version: 1.1, tags };
}
