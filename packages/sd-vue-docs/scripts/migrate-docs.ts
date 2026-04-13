import { promises as fs } from 'node:fs';
import path from 'node:path';

type Frontmatter = Record<string, string>;

const workspaceRoot = path.resolve(import.meta.dir, '..', '..', '..');
const docsRoot = path.resolve(import.meta.dir, '..');
const sourceDocsRoot = path.resolve(docsRoot, 'guide-source');
const sourceComponentsRoot = path.resolve(workspaceRoot, 'packages', 'web-vue', 'components');
const guideRoot = path.resolve(docsRoot, 'guide');
const componentDocsRoot = path.resolve(docsRoot, 'components');
const generatedDemoRoot = path.resolve(docsRoot, '.vitepress', 'theme', 'generated');

const guideFiles = ['start.zh-CN.md', 'theme.zh-CN.md', 'dark.zh-CN.md', 'faq.zh-CN.md'];

const categoryOrder = ['通用', '布局', '导航', '数据录入', '数据展示', '反馈', '其他'];

await fs.rm(guideRoot, { recursive: true, force: true });
await fs.rm(componentDocsRoot, { recursive: true, force: true });
await fs.rm(generatedDemoRoot, { recursive: true, force: true });

await Promise.all([
  fs.mkdir(guideRoot, { recursive: true }),
  fs.mkdir(componentDocsRoot, { recursive: true }),
  fs.mkdir(generatedDemoRoot, { recursive: true }),
]);

await writeGuidePages();
const componentEntries = await writeComponentPages();
await writeComponentIndex(componentEntries);

async function writeGuidePages() {
  await Promise.all(
    guideFiles.map(async (fileName) => {
      const sourcePath = path.resolve(sourceDocsRoot, fileName);
      const outputPath = path.resolve(guideRoot, toGuideTarget(fileName));
      const raw = await fs.readFile(sourcePath, 'utf8');
      const { frontmatter, body } = splitFrontmatter(raw);
      const content = serializeFrontmatter({
        title: frontmatter.title || extractFirstHeading(body) || toGuideTitle(fileName),
        description: frontmatter.description || '',
      });

      await fs.writeFile(outputPath, `${content}\n${sanitizeInternalLinks(body).trim()}\n`);
    }),
  );
}

async function writeComponentPages() {
  const componentNames = await listDirectories(sourceComponentsRoot);
  const result: Array<{ name: string; title: string; category: string; description: string }> = [];

  for (const componentName of componentNames) {
    const readmePath = path.resolve(sourceComponentsRoot, componentName, 'README.zh-CN.md');
    const exists = await pathExists(readmePath);

    if (!exists) {
      continue;
    }

    const readme = await fs.readFile(readmePath, 'utf8');
    const { frontmatter, body } = splitFrontmatter(readme);
    const title = frontmatter.title || extractFirstHeading(body) || componentName;
    const description = normalizeDescription(frontmatter.description || '');
    const category = frontmatter.category || '其他';
    const outputDir = path.resolve(componentDocsRoot, componentName);
    const demosDir = path.resolve(sourceComponentsRoot, componentName, '__demo__');
    const outputDemoDir = path.resolve(generatedDemoRoot, componentName);

    await Promise.all([
      fs.mkdir(outputDir, { recursive: true }),
      fs.mkdir(outputDemoDir, { recursive: true }),
    ]);

    const demoContent = await buildDemoBlocks(componentName, demosDir, outputDemoDir);
    const transformedBody = sanitizeInternalLinks(
      removeDemoImports(removeFrontmatterHeadings(body)).trim(),
    );
    const pageContent = [
      serializeFrontmatter({ title, description, outline: 'deep' }),
      transformedBody,
      demoContent.scriptBlock,
      demoContent.blocks.length > 0 ? '## 示例\n' : '',
      demoContent.blocks.join('\n\n'),
    ]
      .filter(Boolean)
      .join('\n\n');

    await fs.writeFile(path.resolve(outputDir, 'index.md'), `${pageContent.trim()}\n`);
    result.push({ name: componentName, title, category, description });
  }

  return result.sort((left, right) => {
    const categoryDelta =
      categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category);

    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return left.name.localeCompare(right.name, 'zh-CN');
  });
}

async function buildDemoBlocks(componentName: string, demosDir: string, outputDemoDir: string) {
  const exists = await pathExists(demosDir);

  if (!exists) {
    return {
      scriptBlock: '',
      blocks: [] as string[],
    };
  }

  const demoFiles = (await fs.readdir(demosDir))
    .filter((fileName) => fileName.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));

  const scriptLines: string[] = [];
  const blocks: string[] = [];

  for (const demoFile of demoFiles) {
    const sourcePath = path.resolve(demosDir, demoFile);
    const raw = await fs.readFile(sourcePath, 'utf8');
    const demo = parseDemo(raw, demoFile);
    const componentFile = `${demo.slug}.vue`;
    const componentPath = path.resolve(outputDemoDir, componentFile);
    const importPath = `../../.vitepress/theme/generated/${componentName}/${componentFile}`;
    const sourceVarName = `${demo.slug}Source`;
    const titleVarName = `${demo.slug}Title`;
    const descriptionVarName = `${demo.slug}Description`;

    await fs.writeFile(componentPath, `${demo.vueSource.trim()}\n`);

    scriptLines.push(`import ${demo.componentVarName} from '${importPath}';`);
    scriptLines.push(`const ${sourceVarName} = ${toJsStringLiteral(demo.vueSource.trim())};`);
    scriptLines.push(`const ${titleVarName} = ${toJsStringLiteral(demo.title)};`);
    scriptLines.push(`const ${descriptionVarName} = ${toJsStringLiteral(demo.description)};`);

    blocks.push(
      [
        `<DemoBlock`,
        `  :title="${titleVarName}"`,
        `  :description="${descriptionVarName}"`,
        `  :code="${sourceVarName}"`,
        `>`,
        `  <${demo.componentVarName} />`,
        `</DemoBlock>`,
      ].join('\n'),
    );
  }

  return {
    scriptBlock:
      scriptLines.length > 0
        ? ['<script setup lang="ts">', ...scriptLines, '</script>'].join('\n')
        : '',
    blocks,
  };
}

async function writeComponentIndex(
  entries: Array<{ name: string; title: string; category: string; description: string }>,
) {
  const groups = new Map<string, Array<{ name: string; title: string; description: string }>>();

  for (const entry of entries) {
    const current = groups.get(entry.category) || [];
    current.push({ name: entry.name, title: entry.title, description: entry.description });
    groups.set(entry.category, current);
  }

  const sections = categoryOrder
    .filter((category) => groups.has(category))
    .map((category) => {
      const items = groups.get(category) || [];
      const lines = items.map(
        (item) =>
          `- [${item.title}](/components/${item.name}/)${item.description ? ` - ${item.description}` : ''}`,
      );

      return [`## ${category}`, ...lines].join('\n');
    });

  const content = [
    serializeFrontmatter({ title: '组件总览', description: '按分类浏览所有组件文档' }),
    '# 组件总览',
    '全部组件文档均由仓库内中文 README 与示例自动生成。',
    ...sections,
  ].join('\n\n');

  await fs.writeFile(path.resolve(componentDocsRoot, 'index.md'), `${content.trim()}\n`);
}

function parseDemo(raw: string, fileName: string) {
  const { frontmatter, body } = splitFrontmatter(raw);
  const vueMatch = body.match(/```vue\s*([\s\S]*?)```/i);

  if (!vueMatch) {
    throw new Error(`Demo file ${fileName} does not contain a vue code block.`);
  }

  const title = frontmatter.title || extractFirstHeading(body) || toReadableName(fileName);
  const description = extractDemoDescription(body);
  const slug = toSafeIdentifier(fileName.replace(/\.md$/i, ''));

  return {
    title,
    description,
    slug,
    componentVarName: `${slug}Demo`,
    vueSource: vueMatch[1],
  };
}

function extractDemoDescription(content: string) {
  const withoutCode = stripCodeBlocks(content);
  const localized = withoutCode.match(/##\s+zh-CN\s*([\s\S]*?)(?:\n+---\n+##\s+en-US|$)/i);
  const chineseSection = localized ? localized[1] : removeHeadingLines(withoutCode);

  return chineseSection.replace(/^[-\s]+|[-\s]+$/g, '').trim();
}

function splitFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return { frontmatter: {} as Frontmatter, body: content };
  }

  const frontmatter: Frontmatter = {};

  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');

    if (separator < 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    body: content.slice(match[0].length),
  };
}

function serializeFrontmatter(frontmatter: Record<string, string>) {
  const lines = Object.entries(frontmatter)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);

  return ['---', ...lines, '---'].join('\n');
}

function sanitizeInternalLinks(content: string) {
  return content
    .replace(/\/vue\/component\/([a-z0-9-]+)(\/index)?/gi, '/components/$1/')
    .replace(/\/react\/components?\/([a-z0-9-]+)(\/index)?/gi, '/components/$1/')
    .replace(/\/vue\/docs\/(start|theme|dark|faq)/gi, '/guide/$1')
    .replace(/\/vue\/components/gi, '/components')
    .replace(/\/react\/components/gi, '/components')
    .replace(/\]\((\.\/)?CHANGELOG\.zh-CN\.md\)/gi, '')
    .replace(/\/components\/([A-Z][A-Za-z0-9]+)(\/index)?/g, (_, name: string) => {
      const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

      return `/components/${kebabName}/`;
    })
    .replace(/\/components\/([^/]+)\/+/g, '/components/$1/');
}

function removeFrontmatterHeadings(content: string) {
  const lines = content.split('\n');

  while (lines[0]?.startsWith('# ')) {
    lines.shift();
  }

  return lines.join('\n').trim();
}

function removeHeadingLines(content: string) {
  return content
    .split('\n')
    .filter((line) => !line.startsWith('# '))
    .join('\n');
}

function removeDemoImports(content: string) {
  return content
    .split('\n')
    .filter((line) => !line.trim().startsWith('@import ./__demo__/'))
    .join('\n');
}

function stripCodeBlocks(content: string) {
  return content.replace(/```[\s\S]*?```/g, '').trim();
}

function extractFirstHeading(content: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function toGuideTarget(fileName: string) {
  return fileName.replace('.zh-CN.md', '.md');
}

function toGuideTitle(fileName: string) {
  return toReadableName(fileName.replace('.zh-CN.md', ''));
}

function toReadableName(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSafeIdentifier(value: string) {
  const normalized = value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const identifier = normalized
    .split('-')
    .filter(Boolean)
    .map((segment, index) => {
      const lower = segment.toLowerCase();
      return index === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join('');

  return /^[0-9]/.test(identifier)
    ? `demo${identifier[0].toUpperCase()}${identifier.slice(1)}`
    : identifier || 'demoExample';
}

function normalizeDescription(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function toJsStringLiteral(value: string) {
  return JSON.stringify(value).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
}

async function listDirectories(targetDir: string) {
  const entries = await fs.readdir(targetDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
