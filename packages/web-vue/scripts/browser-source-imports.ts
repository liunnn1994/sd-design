import { parseJSON5 } from 'confbox/json5';
import { list } from 'postcss';
import { parse as parseScss } from 'postcss-scss';
import { parseSync, Visitor, type VisitorObject } from 'vite';
import { parse as parseSfc } from 'vue/compiler-sfc';

export function imports(file: string, source: string, visitors?: VisitorObject): string[] {
  if (file.endsWith('.vue')) {
    const { descriptor, errors } = parseSfc(source, { filename: file });
    if (errors.length) throw new Error(`Cannot parse ${file}: ${errors.join(', ')}`);
    return [descriptor.script, descriptor.scriptSetup, ...descriptor.styles].flatMap((block) =>
      block
        ? block.src
          ? [block.src]
          : imports(
              `${file}.${block.lang ?? (block.type === 'style' ? 'css' : 'js')}`,
              block.content,
            )
        : [],
    );
  }
  if (file.endsWith('.scss') || file.endsWith('.css')) {
    const dependencies: string[] = [];
    parseScss(source, { from: file }).walkAtRules((rule) => {
      if (!['use', 'forward', 'import'].includes(rule.name)) return;
      for (const value of list.comma(rule.params)) {
        const specifier = list.space(value)[0];
        if (specifier?.startsWith('"') || specifier?.startsWith("'"))
          dependencies.push(parseJSON5<string>(specifier));
      }
    });
    return dependencies;
  }
  const result = parseSync(file, source);
  if (result.errors.length)
    throw new Error(
      `Cannot parse ${file}: ${result.errors.map((error) => error.message).join(', ')}`,
    );
  const dependencies = [
    ...result.module.staticImports
      .filter((entry) => !entry.entries.length || entry.entries.some((item) => !item.isType))
      .map((entry) => entry.moduleRequest.value),
    ...result.module.staticExports.flatMap((entry) =>
      entry.entries
        .filter((item) => !item.isType && item.moduleRequest)
        .map((item) => item.moduleRequest!.value),
    ),
  ];
  new Visitor({
    ...visitors,
    ImportExpression(node) {
      if (node.source.type === 'Literal' && typeof node.source.value === 'string')
        dependencies.push(node.source.value);
      else if (node.source.type === 'TemplateLiteral' && !node.source.expressions.length)
        dependencies.push(node.source.quasis[0].value.cooked!);
      visitors?.ImportExpression?.(node);
    },
  }).visit(result.program);
  return dependencies;
}
