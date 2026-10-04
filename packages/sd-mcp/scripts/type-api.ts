import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

import { extractDescription, isPrivateApi } from '../../web-vue/scripts/utils/doc-tags.ts';

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (letter, offset: number) => `${offset ? '-' : ''}${letter.toLowerCase()}`);
const parse = (file: string, text: string) =>
  ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

/** Discover contracts from public exports and SFC macros; no per-component registry. */
export async function readTypeApi(webVue: string, sources: { dirname: string; file: string }[]) {
  const barrelFile = path.join(webVue, 'components/index.ts');
  const barrel = parse(barrelFile, await readFile(barrelFile, 'utf8'));
  const components: {
    name: string;
    dirname: string;
    exportName: string;
    sourceFile?: string;
    queryFile?: string;
  }[] = [];
  for (const statement of barrel.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.isTypeOnly ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    )
      continue;
    const module = statement.moduleSpecifier.text;
    if (!/^\.\/[^_/][^/]*$/.test(module)) continue;
    for (const entry of statement.exportClause.elements) {
      if (!entry.isTypeOnly && /^[A-Z]/.test(entry.name.text))
        components.push({
          name: entry.name.text,
          dirname: `components/${module.slice(2)}`,
          exportName: entry.propertyName?.text ?? entry.name.text,
        });
    }
  }
  const virtualFiles = new Map<string, string>();
  for (const { dirname, file } of sources) {
    if (!file.endsWith('.vue')) continue;
    const content = await readFile(file, 'utf8');
    const script = [...content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1])
      .join('\n');
    const ast = parse(file, script);
    let name: string | undefined;
    let props: ts.CallExpression | undefined;
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        if (
          node.expression.text === 'defineOptions' &&
          node.arguments[0] &&
          ts.isObjectLiteralExpression(node.arguments[0])
        ) {
          const option = node.arguments[0].properties.find(
            (entry) => entry.name?.getText(ast) === 'name',
          );
          if (option && ts.isPropertyAssignment(option) && ts.isStringLiteral(option.initializer))
            name = option.initializer.text;
        }
        if (node.expression.text === 'defineProps') props = node;
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
    const component = components.find(
      (entry) =>
        entry.dirname === dirname &&
        (entry.name === name || kebab(entry.name) === path.basename(file, '.vue')),
    );
    if (!component) continue;
    component.sourceFile = file;
    if (!props) continue;
    const call = props as ts.CallExpression;
    const type = call.typeArguments?.[0];
    const runtime = call.arguments[0];
    // Inline runtime objects are already handled by docgen. Imported objects need the checker.
    if (!type && (!runtime || !ts.isIdentifier(runtime))) continue;
    const query = type
      ? type.getText(ast)
      : `import('vue').ExtractPropTypes<typeof ${runtime!.getText(ast)}>`;
    component.queryFile = `${file}.__mcp.ts`;
    virtualFiles.set(component.queryFile, `${script}\nexport type __McpProps = ${query};\n`);
  }
  const files = await fg('components/**/*.ts', {
    cwd: webVue,
    absolute: true,
    ignore: ['**/__test__/**'],
  });
  const host = ts.createCompilerHost({});
  const read = host.readFile;
  host.readFile = (file) => virtualFiles.get(file) ?? read(file);
  const program = ts.createProgram(
    [...files, ...virtualFiles.keys()],
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
    },
    host,
  );
  const checker = program.getTypeChecker();
  const exportsOf = (file: string) => {
    const source = program.getSourceFile(file);
    const symbol = source && checker.getSymbolAtLocation(source);
    return symbol ? checker.getExportsOfModule(symbol) : [];
  };
  const symbolsByDirectory = new Map<string, ts.Symbol[]>();
  for (const file of files) {
    const dirname = path.relative(webVue, file).split(path.sep).slice(0, 2).join('/');
    symbolsByDirectory.set(dirname, [
      ...(symbolsByDirectory.get(dirname) ?? []),
      ...exportsOf(file),
    ]);
  }
  const descriptionOf = (symbol: ts.Symbol) => {
    const description = extractDescription(
      symbol.getJsDocTags(checker).map((tag) => ({
        title: tag.name,
        description: ts.displayPartsToString(tag.text),
      })),
      'description',
    );
    if (!description.zh && !description.en)
      description.en = ts.displayPartsToString(symbol.getDocumentationComment(checker));
    return description;
  };
  const fieldsOf = (symbol: ts.Symbol, camelCase = false) =>
    checker
      .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))
      .filter(
        (field) =>
          !isPrivateApi(
            field.getJsDocTags(checker).map((tag) => ({
              title: tag.name,
              description: ts.displayPartsToString(tag.text),
            })),
          ),
      )
      .map((field) => {
        const declaration = field.valueDeclaration ?? field.declarations?.[0];
        if (!declaration) throw new Error(`Missing declaration: ${symbol.name}.${field.name}`);
        const type = checker.getTypeOfSymbolAtLocation(field, declaration);
        // Imports of other SFC instances may be unresolved in this TS-only program.
        // Preserve the declared reference instead of publishing an inferred `any`.
        const declaredType = ts.isPropertySignature(declaration) ? declaration.type : undefined;
        // `any` 与 `TSFunctionType`/`TSTypeOperator` 这类内部类型种名都无法给调用方提供信息，
        // 回退到声明处的源码文本（形如 `(paths: string[]) => string`）。
        let printed = checker.typeToString(
          type,
          declaration,
          ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature,
        );
        // 函数类型打印不出来时（`TSFunctionType`），按调用签名手工拼出可读签名。
        if (/^TSFunctionType/.test(printed.trim())) {
          const signature = type.getCallSignatures()[0];
          if (signature) {
            const parameters = signature
              .getParameters()
              .map(
                (parameter) =>
                  `${parameter.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, declaration))}`,
              );
            printed = `(${parameters.join(', ')}) => ${checker.typeToString(signature.getReturnType(), declaration, ts.TypeFormatFlags.NoTruncation)}`;
          }
        }
        const unreadable = (type.flags & ts.TypeFlags.Any) !== 0 || /^TS[A-Z]/.test(printed.trim());
        return {
          name: camelCase ? field.name : kebab(field.name),
          type: unreadable && declaredType ? declaredType.getText() : printed,
          default: '',
          description: descriptionOf(field),
        };
      });
  const apis = new Map<
    string,
    {
      dirname: string;
      importName: string;
      sourceFile?: string;
      props: ReturnType<typeof fieldsOf>;
      config?: ReturnType<typeof fieldsOf>;
      methods?: ReturnType<typeof fieldsOf>;
      slots: { name: string; description: { zh: string; en: string } }[];
      events: { name: string; description: { zh: string; en: string } }[];
    }
  >();
  for (const component of components) {
    const symbols = symbolsByDirectory.get(component.dirname) ?? [];
    const candidates = [
      ...(component.queryFile
        ? exportsOf(component.queryFile).filter((entry) => entry.name === '__McpProps')
        : []),
      ...symbols.filter((entry) => entry.name === `${component.name}Props`),
    ];
    const props = candidates
      .map((symbol) => ({ symbol, fields: fieldsOf(symbol) }))
      .find((entry) => entry.fields.length);
    const config =
      !component.sourceFile && symbols.find((entry) => entry.name === `${component.name}Config`);
    const methods = config && symbols.find((entry) => entry.name === `${component.name}Method`);
    if (!props && !methods) continue;
    const api: NonNullable<ReturnType<typeof apis.get>> = {
      dirname: component.dirname,
      importName: component.name,
      sourceFile: component.sourceFile,
      props: props?.fields ?? [],
      slots: [],
      events: [],
    };
    if (config && methods) {
      api.config = fieldsOf(config, true);
      api.methods = fieldsOf(methods, true);
    }
    // Public interfaces can carry descriptions missing from a local SFC type.
    for (const symbol of symbols.filter((entry) => entry.name === `${component.name}Props`)) {
      for (const field of fieldsOf(symbol)) {
        const prop = api.props.find((entry) => entry.name === field.name);
        if (prop && (field.description.zh || field.description.en))
          prop.description = field.description;
      }
    }
    if (!component.sourceFile && props) {
      const slots = symbols.find((entry) => entry.name === `${component.name}Slots`);
      if (slots)
        api.slots = fieldsOf(slots, true).map(({ name, description }) => ({ name, description }));
      const entry = exportsOf(path.join(webVue, component.dirname, 'index.ts')).find(
        (symbol) => symbol.name === component.exportName,
      );
      const declaration = entry?.valueDeclaration ?? entry?.declarations?.[0];
      if (entry && declaration) {
        let type = checker.getTypeOfSymbolAtLocation(entry, declaration);
        const construct = type.getConstructSignatures()[0];
        if (construct) type = construct.getReturnType();
        else {
          const context = type.getCallSignatures()[0]?.parameters[1];
          if (context)
            type = checker.getNonNullableType(
              checker.getTypeOfSymbolAtLocation(context, declaration),
            );
        }
        const emit = type.getProperty('$emit') ?? type.getProperty('emit');
        if (emit)
          for (const signature of checker
            .getTypeOfSymbolAtLocation(emit, declaration)
            .getCallSignatures()) {
            const event = signature.parameters[0];
            if (!event) continue;
            const type = checker.getTypeOfSymbolAtLocation(event, declaration);
            if (type.isStringLiteral())
              api.events.push({ name: type.value, description: { zh: '', en: '' } });
          }
      }
    }
    // Follow ExtractPropTypes<typeof runtimeProps> to the object that owns defaults.
    if (props) {
      const declaration = props.symbol.declarations?.find(ts.isTypeAliasDeclaration);
      const node = declaration?.type;
      const argument =
        node && (ts.isTypeReferenceNode(node) || ts.isImportTypeNode(node))
          ? node.typeArguments?.[0]
          : undefined;
      if (argument && ts.isTypeQueryNode(argument)) {
        let symbol = checker.getSymbolAtLocation(argument.exprName);
        if (symbol && symbol.flags & ts.SymbolFlags.Alias)
          symbol = checker.getAliasedSymbol(symbol);
        const runtime = symbol?.valueDeclaration;
        if (
          runtime &&
          ts.isVariableDeclaration(runtime) &&
          runtime.initializer &&
          ts.isObjectLiteralExpression(runtime.initializer)
        ) {
          for (const property of runtime.initializer.properties) {
            if (
              !ts.isPropertyAssignment(property) ||
              !ts.isObjectLiteralExpression(property.initializer)
            )
              continue;
            const prop = api.props.find((entry) => entry.name === kebab(property.name.getText()));
            const value = property.initializer.properties.find(
              (entry) => entry.name?.getText() === 'default',
            );
            if (prop && value && ts.isPropertyAssignment(value))
              prop.default = value.initializer.getText();
          }
        }
      }
    }
    apis.set(kebab(component.name), api);
  }
  return apis;
}

export type TypeApi = NonNullable<ReturnType<Awaited<ReturnType<typeof readTypeApi>>['get']>>;
