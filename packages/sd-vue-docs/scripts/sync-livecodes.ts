import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { buildVueHtmlData } from './build-vue-html-data.ts';

const root = resolve(import.meta.dirname, '..');
const version = 'v49';
const preparedVersion = `${version}-docs-6`;
const checksum = 'e8ede45a372217283222f68ec0f0234d6d73524add88bb0b7a547f70d9fe9864';
const archive = resolve(root, `node_modules/.cache/livecodes/${version}.tar.gz`);
const destination = resolve(root, 'public/vendor/livecodes');
const run = promisify(execFile);

await mkdir(resolve(destination, 'livecodes'), { recursive: true });
const htmlData = buildVueHtmlData();
if (
  !htmlData.tags
    .find((tag) => tag.name === 'sd-select')
    ?.attributes.some((attr) => attr.name === 'size')
)
  throw new Error('Vue playground component props are missing');
await writeFile(resolve(destination, 'livecodes/sd-vue-html-data.json'), JSON.stringify(htmlData));

try {
  if ((await readFile(resolve(destination, 'version'), 'utf8')) === preparedVersion)
    process.exit(0);
} catch {}

await mkdir(resolve(archive, '..'), { recursive: true });
let data: Buffer;
try {
  data = await readFile(archive);
} catch {
  const url = `https://github.com/live-codes/livecodes/releases/download/${version}/livecodes-${version}.tar.gz`;
  // PowerShell honors Windows system proxy settings, unlike Node's default fetch.
  if (process.platform === 'win32') {
    await run('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri '${url}' -OutFile '${archive.replaceAll("'", "''")}'`,
    ]);
    data = await readFile(archive);
  } else {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`LiveCodes download failed (${response.status})`);
    data = Buffer.from(await response.arrayBuffer());
    await writeFile(archive, data);
  }
}
if (createHash('sha256').update(data).digest('hex') !== checksum) {
  throw new Error(`LiveCodes archive checksum mismatch: remove ${archive} and retry`);
}
await mkdir(destination, { recursive: true });
await run('tar', ['-xzf', archive, '-C', destination, '--strip-components=1']);
const bundle = (await readdir(resolve(destination, 'livecodes'))).find((file) =>
  /^embed\..*\.js$/.test(file),
);
if (!bundle) throw new Error('LiveCodes embed bundle missing');
const bundlePath = resolve(destination, 'livecodes', bundle);
const code = await readFile(bundlePath, 'utf8');
const developmentSandbox = 'location.hostname==="localhost"||location.hostname==="127.0.0.1"?qg:RM';
if (!code.includes(developmentSandbox)) throw new Error('LiveCodes sandbox configuration changed');
// Use the official hosted sandbox on localhost as well; its development server runs on port 8085.
const vueAppLanguage = /editorSupport:\{\.\.\.([\w$]+)\.editorSupport,monaco:\{language:"vue"\}\}/;
if (!vueAppLanguage.test(code)) throw new Error('LiveCodes Vue language configuration changed');
// Keep Vue's TypeScript service and augment its templates with HTML custom data.
await writeFile(
  bundlePath,
  code
    .replace(developmentSandbox, 'RM')
    .replace(
      vueAppLanguage,
      'editorSupport:{...$1.editorSupport,monaco:{language:"vue",languageSupport:new URL("./sd-vue-language.js",import.meta.url).href}}',
    ),
);
const monacoBundle = (await readdir(resolve(destination, 'livecodes'))).find((file) =>
  /^monaco\..*\.js$/.test(file),
);
if (!monacoBundle) throw new Error('LiveCodes Monaco bundle missing');
const monacoPath = resolve(destination, 'livecodes', monacoBundle);
const monacoCode = await readFile(monacoPath, 'utf8');
const initialModel = 'Ke(E,e.value,l(d,"monaco"))';
if (!monacoCode.includes(initialModel)) throw new Error('LiveCodes Monaco model creation changed');
// Preserve TSX when choosing the model's file extension; Monaco's language ID is only "typescript".
await writeFile(monacoPath, monacoCode.replace(initialModel, 'Ke(E,e.value,d)'));
await writeFile(
  resolve(destination, 'livecodes/sd-vue-language.js'),
  `import setupVue from 'https://cdn.jsdelivr.net/npm/@live-codes/monaco-languages@0.2.0/dist/vue.js';

export default async function(monaco, getEditor) {
  const response = await fetch(new URL('./sd-vue-html-data.json', import.meta.url));
  if (!response.ok) throw new Error('Vue component props could not be loaded');
  const sd = await response.json();
  const defaults = monaco.languages.html.htmlDefaults;
  // The HTML service uses its language ID as the worker label; the CDN loader only recognizes "html".
  const environment = globalThis.MonacoEnvironment;
  const getWorkerUrl = environment.getWorkerUrl.bind(environment);
  environment.getWorkerUrl = (moduleId, label) => getWorkerUrl(moduleId, label === 'vue' ? 'html' : label);
  monaco.languages.html.registerHTMLLanguageService('vue',
    {...defaults.options, data: {useDefaultDataProvider: true, dataProviders: {sd}}},
    {completionItems: true, hovers: true});
  setupVue(monaco, getEditor);
}
`,
);
await writeFile(resolve(destination, 'version'), preparedVersion);
console.log(`Prepared official LiveCodes ${version} assets`);
