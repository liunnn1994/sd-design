import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '..');
const sourceDocsRoot = resolve(packageRoot, '..', 'sd-vue-docs', 'docs');
const sourceWebVueRoot = resolve(packageRoot, '..', 'web-vue');
const sourceComponentsRoot = resolve(sourceWebVueRoot, 'components');
const guideOutputRoot = resolve(packageRoot, 'guide');
const componentOutputRoot = resolve(packageRoot, 'components');
const demoOutputRoot = resolve(packageRoot, '.vitepress', 'theme', 'generated');

const guidePages = [
  ['start', resolve(sourceDocsRoot, 'start.zh-CN.md')],
  ['theme', resolve(sourceDocsRoot, 'theme.zh-CN.md')],
  ['dark', resolve(sourceDocsRoot, 'dark.zh-CN.md')],
  ['faq', resolve(sourceDocsRoot, 'faq.zh-CN.md')],
];

function toPosixPath(filePath) {
  return filePath.split('\\').join('/');
}

function slugToName(input) {
  const normalized = input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

  return /^\d/.test(normalized) ? `Demo${normalized}` : normalized;
}

function stripMetaBlock(content) {
  return content.replace(/^```yaml\n[\s\S]*?\n```\n*/u, '').trim();
}

function getField(content, field) {
  const match = content.match(new RegExp(`^\\s*${field}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function toFrontmatterValue(value) {
  return JSON.stringify(value ?? '');
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function sanitizeInternalLinks(content) {
  return content
    .replace(/\/vue\/docs\/faq/gi, '/guide/faq')
    .replace(/\/(vue|react)\/components?\/([A-Za-z0-9-]+)/g, (_, _prefix, name) => {
      return `/components/${toKebabCase(name)}/`;
    })
    .replace(/\/vue\/component\/([A-Za-z0-9-]+)/g, (_, name) => {
      return `/components/${toKebabCase(name)}/`;
    });
}

function sanitizeGuideContent(content, pageName) {
  if (pageName !== 'dark') {
    return content;
  }

  return content.replace(
    '## 原理和内置颜色\n\n可参考 [暗黑模式](https://sd.design/react/docs/palette) 和 [颜色](https://sd.design/react/docs/palette)',
    '## 原理和内置颜色\n\n暗黑模式通过组件库提供的主题变量和 body 上的 sd-theme 属性协同生效，建议在业务项目中统一封装主题切换入口。',
  );
}

function parseDemoFile(content) {
  const title = content.match(/zh-CN:\s*(.+)/)?.[1]?.trim() ?? '示例';
  const descriptionMatch = content.match(/## zh-CN\n\n([\s\S]*?)\n\n---/u);
  const codeMatch = content.match(/```vue\n([\s\S]*?)\n```/u);

  return {
    title,
    description: descriptionMatch?.[1]?.trim() ?? '',
    code: codeMatch?.[1]?.trim() ?? '',
  };
}

async function ensureEmptyDir(targetDir) {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
}

async function writeGuidePages() {
  await ensureEmptyDir(guideOutputRoot);

  for (const [name, sourcePath] of guidePages) {
    const content = await readFile(sourcePath, 'utf8');
    const title = getField(content, 'title') || name;
    const description = getField(content, 'description');
    const body = sanitizeInternalLinks(sanitizeGuideContent(stripMetaBlock(content), name));
    const output = `---\ntitle: ${toFrontmatterValue(title)}\ndescription: ${toFrontmatterValue(description)}\n---\n\n# ${title}\n\n${body}\n`;

    await writeFile(resolve(guideOutputRoot, `${name}.md`), output, 'utf8');
  }
}

async function getComponentFolders() {
  const entries = await readdir(sourceComponentsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function writeComponentPages() {
  await ensureEmptyDir(componentOutputRoot);
  await ensureEmptyDir(demoOutputRoot);

  const componentFolders = await getComponentFolders();
  const componentLinks = [];

  for (const componentName of componentFolders) {
    const readmePath = resolve(sourceComponentsRoot, componentName, 'README.zh-CN.md');

    try {
      const rawReadme = await readFile(readmePath, 'utf8');
      const title = getField(rawReadme, 'title') || componentName;
      const description = getField(rawReadme, 'description');
      const category = getField(rawReadme, 'category') || '其他';
      const body = stripMetaBlock(rawReadme);
      const demoImports = [...body.matchAll(/^@import\s+(.+)$/gm)].map((match) => match[1].trim());
      const markdownBody = sanitizeInternalLinks(body.replace(/^@import\s+.+$/gm, '').trim());
      const pageDir = resolve(componentOutputRoot, componentName);
      const demoDir = resolve(demoOutputRoot, componentName);

      await mkdir(pageDir, { recursive: true });
      await mkdir(demoDir, { recursive: true });

      const scriptImports = [];
      const demoSections = [];

      for (const demoImport of demoImports) {
        const demoSourcePath = resolve(
          sourceComponentsRoot,
          componentName,
          demoImport.replace('./', ''),
        );
        const demoSource = await readFile(demoSourcePath, 'utf8');
        const demo = parseDemoFile(demoSource);

        if (!demo.code) {
          continue;
        }

        const baseName = slugToName(
          relative(
            resolve(sourceComponentsRoot, componentName, '__demo__'),
            demoSourcePath,
          ).replace(extname(demoSourcePath), ''),
        );
        const componentImportName = `${baseName}Demo`;
        const sourceImportName = `${baseName}Source`;
        const generatedVuePath = resolve(
          demoDir,
          `${relative(resolve(sourceComponentsRoot, componentName, '__demo__'), demoSourcePath).replace(extname(demoSourcePath), '')}.vue`,
        );

        await mkdir(dirname(generatedVuePath), { recursive: true });
        await writeFile(generatedVuePath, `${demo.code}\n`, 'utf8');

        const componentImportPath = toPosixPath(relative(pageDir, generatedVuePath));

        scriptImports.push(`import ${componentImportName} from '${componentImportPath}';`);
        scriptImports.push(`import ${sourceImportName} from '${componentImportPath}?raw';`);

        demoSections.push(
          `## ${demo.title}\n\n${sanitizeInternalLinks(demo.description)}\n\n<DemoBlock :code="${sourceImportName}">\n  <${componentImportName} />\n</DemoBlock>`,
        );
      }

      const pageContent = [
        '---',
        `title: ${toFrontmatterValue(title)}`,
        `description: ${toFrontmatterValue(description)}`,
        `category: ${toFrontmatterValue(category)}`,
        '---',
        '',
        '<script setup lang="ts">',
        ...scriptImports,
        '</script>',
        '',
        `# ${title}`,
        '',
        description || '',
        '',
        ...demoSections,
        '',
        markdownBody,
        '',
      ].join('\n');

      await writeFile(resolve(pageDir, 'index.md'), pageContent, 'utf8');
      componentLinks.push(`- [${title}](/components/${componentName}/)`);
    } catch {
      continue;
    }
  }

  const overview = `---\ntitle: ${toFrontmatterValue('组件总览')}\ndescription: ${toFrontmatterValue('所有组件文档入口')}\n---\n\n# 组件总览\n\n以下页面由旧组件 README 和示例自动迁移生成。\n\n${componentLinks.join('\n')}\n`;
  await writeFile(resolve(componentOutputRoot, 'index.md'), overview, 'utf8');
}

async function main() {
  await writeGuidePages();
  await writeComponentPages();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
