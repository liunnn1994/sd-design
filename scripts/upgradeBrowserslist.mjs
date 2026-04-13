import { uniq } from 'es-toolkit';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const README_PATH = 'README.md';
const START_PATH = resolve(process.cwd(), 'packages/sd-vue-docs/guide-source/start.zh-CN.md');
const SECTION_TITLE = '## 浏览器兼容性';
const GENERATED_START = '<!-- browserslist:start -->';
const GENERATED_END = '<!-- browserslist:end -->';

main();

function main() {
  const browsers = loadBrowserslistTargets();
  const condensedBrowsers = condenseBrowsers(browsers);
  const markdown = buildMarkdown(condensedBrowsers);
  const readmeContent = readFileSync(README_PATH, 'utf8');
  const startContent = readFileSync(START_PATH, 'utf8');
  const nextReadmeContent = upsertSupportSection(readmeContent, markdown);
  const nextStartContent = upsertSupportSection(startContent, markdown);

  writeFileSync(README_PATH, nextReadmeContent, 'utf8');
  writeFileSync(START_PATH, nextStartContent, 'utf8');
  console.log('README 支持版本已更新');
  console.log('开始使用文档支持版本已更新');
  console.log(markdown);
}

function loadBrowserslistTargets() {
  const commands = [
    ['exec', 'browserslist', '--mobile-to-desktop', '--json'],
    ['dlx', 'browserslist', '--mobile-to-desktop', '--json'],
  ];

  for (const [subCommand, ...args] of commands) {
    try {
      const output = execFileSync('pnpm', [subCommand, ...args], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      return extractBrowsersFromOutput(output);
    } catch (error) {
      if (subCommand === 'dlx') {
        throw new Error(
          `获取 Browserslist 结果失败: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  throw new Error('获取 Browserslist 结果失败');
}

function extractBrowsersFromOutput(output) {
  const jsonStart = output.indexOf('{');

  if (jsonStart === -1) {
    throw new Error('Browserslist 输出中未找到 JSON 内容');
  }

  const parsed = JSON.parse(output.slice(jsonStart));

  if (!Array.isArray(parsed.browsers)) {
    throw new Error('Browserslist 输出格式不正确');
  }

  return parsed.browsers;
}

function condenseBrowsers(browsers) {
  const browserOrder = uniq(
    browsers
      .map((browser) => parseBrowserTarget(browser)?.name)
      .filter((browserName) => browserName !== undefined),
  );
  const minimumVersionMap = new Map();

  for (const browser of browsers) {
    const parsedTarget = parseBrowserTarget(browser);

    if (!parsedTarget) {
      continue;
    }

    const { name, version } = parsedTarget;
    const currentMinimum = minimumVersionMap.get(name);

    if (!currentMinimum || compareVersions(version, currentMinimum) < 0) {
      minimumVersionMap.set(name, version);
    }
  }

  return [...minimumVersionMap.entries()].sort(([leftName], [rightName]) => {
    const leftIndex = browserOrder.indexOf(leftName);
    const rightIndex = browserOrder.indexOf(rightName);

    if (leftIndex !== -1 || rightIndex !== -1) {
      return normalizeOrderIndex(leftIndex) - normalizeOrderIndex(rightIndex);
    }

    return leftName.localeCompare(rightName);
  });
}

function normalizeOrderIndex(index) {
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function parseBrowserTarget(browser) {
  const separatorIndex = browser.lastIndexOf(' ');

  if (separatorIndex === -1) {
    return null;
  }

  return {
    name: browser.slice(0, separatorIndex),
    version: normalizeVersion(browser.slice(separatorIndex + 1)),
  };
}

function normalizeVersion(version) {
  const [minimumVersion] = version.split('-');
  return minimumVersion;
}

function compareVersions(leftVersion, rightVersion) {
  const leftParts = leftVersion.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = rightVersion.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;

    if (leftPart !== rightPart) {
      return leftPart - rightPart;
    }
  }

  return 0;
}

function buildMarkdown(browsers) {
  const lines = [
    GENERATED_START,
    '以下版本号基于当前 [Browserslist 配置](https://web.dev/baseline?hl=zh-cn)自动生成：',
    '',
    ...browsers.map(([name, version]) => `- ${name}>=${version}`),
    GENERATED_END,
  ];

  return lines.join('\n');
}

function upsertSupportSection(readmeContent, markdown) {
  const headingIndex = readmeContent.indexOf(SECTION_TITLE);

  if (headingIndex === -1) {
    throw new Error(`README 中未找到标题: ${SECTION_TITLE}`);
  }

  const markerPattern = new RegExp(
    `${escapeRegExp(GENERATED_START)}[\\s\\S]*?${escapeRegExp(GENERATED_END)}`,
  );

  if (markerPattern.test(readmeContent)) {
    return readmeContent.replace(markerPattern, markdown);
  }

  const sectionStart = headingIndex + SECTION_TITLE.length;
  const nextHeadingIndex = readmeContent.indexOf('\n## ', sectionStart);
  const sectionEnd = nextHeadingIndex === -1 ? readmeContent.length : nextHeadingIndex;
  const beforeSection = readmeContent.slice(0, sectionStart).replace(/\s*$/, '');
  const afterSection = readmeContent.slice(sectionEnd).replace(/^\s*/, '');

  const trailingContent = afterSection ? `\n\n${afterSection}` : '\n';

  return `${beforeSection}\n\n${markdown}${trailingContent}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
