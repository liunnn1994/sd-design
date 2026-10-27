import assert from 'node:assert/strict';
import { test } from 'node:test';

test('LiquidGlassLogo 发布入口保留 Core 预设身份，SSR 无需 DOM', async () => {
  const { renderToString } = await import('vue/server-renderer');
  const { h } = await import('vue');
  const root = await import('../es/index.js');
  const entry = await import('../es/liquid-glass-logo/index.js');
  const shared = await import('@sdata/web-core/liquid-glass-logo/foundation');
  assert.equal(root.LiquidGlassLogo, entry.default);
  assert.equal(root.liquidGlassLogoDefaults, shared.liquidGlassLogoDefaults);
  const html = await renderToString(
    h(entry.default, { ending: 'wordmark', text: '苏打设计', paused: true }),
  );
  assert.match(html, /aria-label="苏打设计"/);
  assert.match(html, /<canvas/);
  const themedHtml = await renderToString(
    h(root.ConfigProvider, { themeMode: 'dark' }, { default: () => h(entry.default) }),
  );
  assert.match(themedHtml, /data-liquid-glass-theme="dark"/);
  assert.equal(typeof entry.default.install, 'function');
});

test('ThinkingOrb keeps all engine facades, preset identity and the Vue theme hook contract', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/thinking-orb/index.js');
  assert.equal(root.ThinkingOrb, entry.default);
  for (const file of [
    'braid',
    'core',
    'lattice',
    'morph',
    'orbits',
    'profiles',
    'registry',
    'ribbon',
    'types',
    'web',
  ]) {
    const legacy = await import(`../es/thinking-orb/engine/${file}.js`);
    const shared = await import(`@sdata/web-core/thinking-orb/engine/${file}`);
    assert.deepEqual(Object.keys(legacy), Object.keys(shared));
    for (const name of Object.keys(shared))
      assert.equal(legacy[name], shared[name], `${file}/${name}`);
  }
  const legacy = await import('../es/thinking-orb/presets.js');
  const shared = await import('@sdata/web-core/thinking-orb/presets');
  assert.equal(legacy.STATE_TO_MODE, shared.STATE_TO_MODE);
  assert.equal(legacy.resolvePreset('working', 20), shared.resolvePreset('working', 20));
  const declaration = await readFile(
    new URL('../es/thinking-orb/thinking-orb.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.doesNotMatch(declaration, /node_modules/);
  const hook = await readFile(new URL('../es/_hooks/use-theme-mode.d.ts', import.meta.url), 'utf8');
  assert.match(hook, /Ref<ThemeMode>/);
  assert.match(hook, /@sdata\/web-core\/config-provider\/theme-mode/);
  const metadata = JSON.parse(
    await readFile(new URL('../json/web-types.json', import.meta.url), 'utf8'),
  );
  const orb = metadata.contributions.html.tags.find(
    (tag: { name: string }) => tag.name === 'sd-thinking-orb',
  );
  assert.ok(orb);
  assert.deepEqual(
    orb.attributes.map((attribute: { name: string }) => attribute.name),
    ['state', 'size', 'theme', 'speed', 'paused'],
  );
});

test('Typography and Copy retain compound entries, portable options and the shared clipboard SDK', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const typography = await import('../es/typography/index.js');
  const copy = await import('../es/copy/index.js');
  const clipboard = await import('@sdata/web-core/clipboard');
  assert.equal(root.Copy, copy.default);
  assert.equal(root.Typography, typography.default);
  for (const name of ['Text', 'Title', 'Paragraph'] as const) {
    assert.equal(typography.default[name], typography[`Typography${name}`]);
  }
  assert.equal(typeof clipboard.default, 'function');
  assert.equal(clipboard.copyToClipboard, clipboard.default);
  for (const file of [
    'typography/base',
    'typography/edit-content',
    'typography/operations',
    'copy/copy',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
  const types = await readFile(new URL('../es/typography/interface.d.ts', import.meta.url), 'utf8');
  assert.match(types, /@sdata\/web-core\/typography\/types/);
  assert.match(types, /import\(['"]vue['"]\)\.Component/);
  const copyTypes = await readFile(new URL('../es/copy/types.d.ts', import.meta.url), 'utf8');
  assert.match(copyTypes, /@sdata\/web-core\/clipboard/);
  assert.match(copyTypes, /LinkProps/);
  assert.match(copyTypes, /ButtonProps/);
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.dependencies['copy-to-clipboard'], undefined);
  const shared = JSON.parse(
    await readFile(new URL(import.meta.resolve('@sdata/web-core/package.json')), 'utf8'),
  );
  assert.equal(shared.dependencies['copy-to-clipboard'], '^4.0.2');
});

test('ModelSelector compound/deep exports retain provider identity and portable Vue contexts', async () => {
  const { readFile } = await import('node:fs/promises');
  const entry = await import('../es/model-selector/index.js');
  const core = await import('@sdata/web-core/model-selector/types');
  assert.equal(entry.MODEL_SELECTOR_PROVIDERS, core.MODEL_SELECTOR_PROVIDERS);
  const root = await import('../es/index.js');
  assert.equal(root.MODEL_SELECTOR_PROVIDERS, core.MODEL_SELECTOR_PROVIDERS);
  assert.equal(root.ModelSelector, entry.default);
  for (const name of [
    'Trigger',
    'Content',
    'Dialog',
    'Input',
    'List',
    'Empty',
    'Group',
    'Item',
    'Shortcut',
    'Separator',
    'Logo',
    'LogoGroup',
    'Name',
  ] as const) {
    assert.equal(entry.default[name], entry[`ModelSelector${name}`]);
  }
  for (const file of [
    'model-selector',
    'model-selector-group',
    'model-selector-item',
    'model-selector-input',
    'model-selector-dialog',
  ]) {
    const declaration = await readFile(
      new URL(`../es/model-selector/${file}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    if (file !== 'model-selector-input') assert.match(declaration, /__VLS_WithSlots/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
  const context = await readFile(
    new URL('../es/model-selector/context.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(context, /ComputedRef/);
  assert.match(context, /Ref<boolean>/);
  const types = await readFile(new URL('../es/model-selector/types.d.ts', import.meta.url), 'utf8');
  assert.match(types, /@sdata\/web-core\/model-selector\/types/);
});

test('BasicCrudTable deep components and data contracts remain portable after extraction', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const [file, name] of [
    ['basic-crud-table', 'BasicCrudTable'],
    ['basic-crud-modal', 'BasicCrudModal'],
  ]) {
    const component = await import(`../es/basic-crud-table/${file}.js`);
    assert.equal(component.default.name, name);
    const declaration = await readFile(
      new URL(`../es/basic-crud-table/${file}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /__VLS_WithSlots/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
  const declaration = await readFile(
    new URL('../es/basic-crud-table/types.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /@sdata\/web-core\/basic-crud-table\/types/);
  assert.match(declaration, /TRow extends TableData = TableData/);
  const metadata = JSON.parse(
    await readFile(new URL('../json/web-types.json', import.meta.url), 'utf8'),
  );
  const component = metadata.contributions.html.tags.find(
    (item: { name: string }) => item.name === 'sd-basic-crud-table',
  );
  assert.ok(component);
  for (const name of [
    'columns',
    'table-props',
    'toolbar-props',
    'modal-form-props',
    'fetch-table-api',
    'before-modal-submit',
    'delete-name-key',
  ]) {
    assert.ok(
      component.attributes.some((item: { name: string }) => item.name === name),
      name,
    );
  }
});

test('Sender recorder deep/root exports retain the complete shared SDK factory without a DOM', async () => {
  const legacy = await import('../es/sender/recorder-core.js');
  const sender = await import('../es/sender/index.js');
  const shared = await import('@sdata/web-core/sender/recorder-engine');
  assert.ok(legacy.default === shared.default, 'legacy SDK facade must retain factory identity');
  assert.ok(
    sender.RecorderCore === shared.default,
    'Sender deep entry must export the shared factory',
  );
  assert.equal(Reflect.get(shared.default, 'TrafficImgUrl'), '');
  for (const name of [
    'ASR_Aliyun_Short',
    'BufferStreamPlayer',
    'DTMF_Decode',
    'DTMF_Encode',
    'FrequencyHistogramView',
    'LibFFT',
    'NMN2PCM',
    'Sonic',
    'WaveSurferView',
    'WaveView',
  ]) {
    assert.equal(typeof Reflect.get(shared.default, name), 'function', name);
  }
  assert.equal(typeof globalThis.document, 'undefined');
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/sender/sender.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /ReadonlyDeep<JsonValue>/);
  assert.match(declaration, /slot-\$\{string\}/);
  assert.doesNotMatch(declaration, /_ReadonlyObjectDeep/);
});

test('Sender production ESM bundle initializes the SDK before its format extensions', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdtemp, realpath, rm, writeFile } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { build } = await import('vite');
  const temporaryRoot = await realpath(tmpdir());
  const directory = await mkdtemp(join(temporaryRoot, 'sd-recorder-order-'));
  assert.equal(dirname(directory), temporaryRoot);
  try {
    const entry = join(directory, 'entry.mjs');
    await writeFile(
      entry,
      `import Recorder from '@sdata/web-core/sender/recorder-engine';
      if (typeof Recorder.Support !== 'function' || typeof Recorder.Sonic !== 'function' ||
          typeof Recorder.prototype.mp3 !== 'function' || typeof Recorder.prototype.amr !== 'function') {
        throw Error('Incomplete recorder SDK');
      }
      if (Recorder.TrafficImgUrl !== '') throw Error('Recorder traffic reporting is enabled');
      console.log('recorder-order-ok');`,
    );
    await build({
      configFile: false,
      logLevel: 'silent',
      resolve: {
        alias: {
          '@sdata/web-core/sender/recorder-engine': fileURLToPath(
            import.meta.resolve('@sdata/web-core/sender/recorder-engine'),
          ),
        },
      },
      build: {
        target: 'es2022',
        minify: false,
        emptyOutDir: false,
        outDir: join(directory, 'dist'),
        lib: { entry, formats: ['es'], fileName: () => 'entry.mjs' },
      },
    });
    const output = execFileSync(process.execPath, [join(directory, 'dist/entry.mjs')], {
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.match(output, /recorder-order-ok/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Responsive observer deep import retains the shared singleton and breakpoint exports', async () => {
  const legacy = await import('../es/_utils/responsive-observe.js');
  const shared = await import('@sdata/web-core/_utils/responsive-observe');
  assert.equal(legacy.default, shared.default);
  assert.equal(legacy.responsiveArray, shared.responsiveArray);
  assert.equal(legacy.responsiveMap, shared.responsiveMap);
});

test('Tree utility deep imports retain all pre-extraction runtime exports', async () => {
  const query = await import('../es/tree/utils/index.js');
  const data = await import('../es/tree/utils/tree-data.js');
  for (const name of [
    'getFlattenTreeData',
    'getKey2TreeNode',
    'isNodeSelectable',
    'isNodeExpandable',
    'isLeafNode',
  ]) {
    assert.equal(
      typeof query[name as keyof typeof query],
      'function',
      `missing old Tree utility: ${name}`,
    );
  }
  assert.equal(typeof data.generateTreeData, 'function');
  assert.equal(typeof data.generateKey, 'function');
});

test('Select and Cascader utility deep entries retain their original runtime exports', async () => {
  const select = await import('../es/select/utils.js');
  const cascader = await import('../es/cascader/utils.js');
  for (const name of [
    'isGroupOption',
    'isGroupOptionInfo',
    'getValueString',
    'getKeyFromValue',
    'hasEmptyStringKey',
    'createOptionInfo',
    'getOptionInfos',
    'getValidOptions',
    'isValidOption',
  ]) {
    assert.equal(
      typeof select[name as keyof typeof select],
      'function',
      `missing old Select utility: ${name}`,
    );
  }
  for (const name of [
    'getOptionInfos',
    'getCheckedStatus',
    'getLeafOptionKeys',
    'getLeafOptionInfos',
    'getValueKey',
    'getValidValues',
    'getOptionLabel',
  ]) {
    assert.equal(
      typeof cascader[name as keyof typeof cascader],
      'function',
      `missing old Cascader utility: ${name}`,
    );
  }
});

test('TimePicker utility deep entry retains its original runtime exports', async () => {
  const time = await import('../es/time-picker/utils/index.js');
  for (const name of [
    'getColumnsFromFormat',
    'scrollTo',
    'getFormattedValue',
    'isValidRangeValue',
    'isValidInputValue',
    'isDisabledTime',
  ]) {
    assert.equal(
      typeof time[name as keyof typeof time],
      'function',
      `missing old TimePicker utility: ${name}`,
    );
  }
});

test('DatePicker utility and format deep entries retain their original runtime exports', async () => {
  const date = await import('../es/date-picker/utils/index.js');
  const format = await import('../es/date-picker/hooks/use-format.js');
  const value = await import('../es/date-picker/hooks/use-value-format.js');
  for (const name of [
    'newArray',
    'normalizeRangeValue',
    'isCompleteRangeValue',
    'isValidRangeValue',
    'mergeValueWithTime',
    'isDisabledDate',
  ]) {
    assert.equal(
      typeof date[name as keyof typeof date],
      'function',
      `missing old DatePicker utility: ${name}`,
    );
  }
  assert.equal(typeof format.default, 'function');
  assert.equal(typeof format.getDefaultFormat, 'function');
  assert.equal(typeof format.getDefaultValueFormat, 'function');
  assert.equal(typeof value.getReturnValue, 'function');
  assert.equal(typeof value.getReturnRangeValue, 'function');
  assert.equal(typeof value.useReturnValue, 'function');
});

test('Upload utility deep entry retains its original runtime exports', async () => {
  const upload = await import('../es/upload/utils.js');
  for (const name of [
    'getProgressStatus',
    'uploadRequest',
    'loopDirectory',
    'isImage',
    'getFiles',
  ]) {
    assert.equal(
      typeof upload[name as keyof typeof upload],
      'function',
      `missing old Upload utility: ${name}`,
    );
  }
});

test('BloomMenu legacy entry retains portable Vue slots and item types', async () => {
  const component = await import('../es/bloom-menu/index.js');
  assert.equal(component.default.name, 'BloomMenu');
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/bloom-menu/bloom-menu.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /BloomMenuItem/);
  assert.match(declaration, /VNode/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('Toolbar public reset/search declaration remains portable after controller extraction', async () => {
  const component = await import('../es/toolbar/index.js');
  assert.equal(component.default.name, 'Toolbar');
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/toolbar/toolbar.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /reset/);
  assert.match(declaration, /search/);
  assert.doesNotMatch(declaration, /node_modules/);
  const metadata: {
    contributions: {
      html: { tags: { name: string; attributes: { name: string; value: { type: string } }[] }[] };
    };
  } = JSON.parse(await readFile(new URL('../json/web-types.json', import.meta.url), 'utf8'));
  const toolbar = metadata.contributions.html.tags.find((tag) => tag.name === 'sd-toolbar');
  assert.ok(toolbar);
  assert.deepEqual(
    toolbar.attributes.map((attribute) => attribute.name),
    [
      'schemas',
      'loading',
      'spin-props',
      'show-search',
      'show-reset',
      'search-btn',
      'reset-btn',
      'show-actions',
      'search-text',
      'reset-text',
      'expand-text',
      'collapse-text',
      'allow-expand',
      'default-expand',
      'item-height',
      'span-width',
      'item-max-width',
      'show-border-bottom',
      'reset-skip-keys',
    ],
  );
  assert.equal(
    toolbar.attributes.find((attribute) => attribute.name === 'spin-props')?.value.type,
    'SpinProps',
  );
  assert.equal(
    toolbar.attributes.find((attribute) => attribute.name === 'search-btn')?.value.type,
    'ButtonProps',
  );
});

test('Avatar compound component, context and portable declarations retain their legacy entries', async () => {
  const component = await import('../es/avatar/index.js');
  const context = await import('../es/avatar/context.js');
  assert.equal(component.default.Group, component.AvatarGroup);
  assert.equal(context.avatarGroupInjectionKey.description, 'SDAvatarGroup');
  const { readFile } = await import('node:fs/promises');
  for (const name of ['avatar', 'avatar-group']) {
    const declaration = await readFile(
      new URL(`../es/avatar/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /AvatarShape/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('Tag native color registry and public declarations retain their legacy entries', async () => {
  const legacy = await import('../es/tag/interface.js');
  const native = await import('@sdata/web-core/tag/types');
  assert.equal(legacy.TAG_COLORS, native.TAG_COLORS);
  const component = await import('../es/tag/index.js');
  assert.equal(component.default.name, 'Tag');
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(new URL('../es/tag/tag.vue.d.ts', import.meta.url), 'utf8');
  assert.match(declaration, /ellipsisTooltip/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('InputMask legacy engine/preset entries and component declarations survive controller extraction', async () => {
  const component = await import('../es/input-mask/index.js');
  const root = await import('../es/index.js');
  const engine = await import('../es/input-mask/mask-engine.js');
  const nativeEngine = await import('@sdata/web-core/input-mask/mask-engine');
  const presets = await import('../es/input-mask/presets.js');
  assert.equal(component.formatInputMask, nativeEngine.formatInputMask);
  assert.equal(root.formatInputMask, nativeEngine.formatInputMask);
  assert.equal(root.defaultInputMaskFormatChars, nativeEngine.defaultInputMaskFormatChars);
  assert.equal(engine.resolveDeletion, nativeEngine.resolveDeletion);
  assert.equal(component.inputMaskPresets, presets.inputMaskPresets);
  assert.equal(presets.inputMaskPresets.ip.inputMode, 'text');
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/input-mask/input-mask.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /InputMaskProps/);
  assert.match(declaration, /inputRef/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('VirtualList legacy generic component and interface retain portable declarations', async () => {
  const component = await import(
    new URL('../es/_components/virtual-list/index.js', import.meta.url).href
  );
  assert.ok(component.default);
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/_components/virtual-list/virtual-list.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /TItem/);
  assert.match(declaration, /cacheSnapshot/);
  assert.doesNotMatch(declaration, /node_modules/);
  const types = await readFile(
    new URL('../es/_components/virtual-list/interface.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(types, /@sdata\/web-core\/virtual-list\/types/);
  assert.match(types, /CacheSnapshot/);
  assert.match(types, /CSSProperties/);
});

test('VoiceGlow legacy native entries retain shared functions, context and portable declarations', async () => {
  const audio = await import('../es/voice-glow/audio.js');
  const nativeAudio = await import('@sdata/web-core/voice-glow/audio');
  const driver = await import('../es/voice-glow/voiceDriver.js');
  const nativeDriver = await import('@sdata/web-core/voice-glow/voiceDriver');
  const styles = await import('../es/voice-glow/styles.js');
  const nativeStyles = await import('@sdata/web-core/voice-glow/styles');
  const presets = await import('../es/voice-glow/presets.js');
  const nativePresets = await import('@sdata/web-core/voice-glow/presets');
  const counter = await import('../es/voice-glow/instance-id.js');
  const nativeCounter = await import('@sdata/web-core/voice-glow/instance-id');
  const color = await import('../es/voice-glow/color.js');
  const nativeColor = await import('@sdata/web-core/voice-glow/color');
  assert.equal(audio.getAudioContext, nativeAudio.getAudioContext);
  assert.equal(audio.acquireAnalyser, nativeAudio.acquireAnalyser);
  assert.equal(audio.isAudioSupported(), false);
  assert.equal(driver.registerVoiceInstance, nativeDriver.registerVoiceInstance);
  assert.equal(styles.generateVoiceBeamCSS, nativeStyles.generateVoiceBeamCSS);
  assert.equal(styles.voiceLobes, nativeStyles.voiceLobes);
  assert.equal(presets.voiceDefaults, nativePresets.voiceDefaults);
  assert.equal(presets.resolveVoiceDefaults, nativePresets.resolveVoiceDefaults);
  assert.equal(counter.nextInstanceId, nativeCounter.nextInstanceId);
  assert.equal(color.parseRgb, nativeColor.parseRgb);
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/voice-glow/voice-glow.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /VoiceGlowProps/);
  assert.doesNotMatch(declaration, /node_modules/);
  const component = await import(new URL('../es/voice-glow/voice-glow.js', import.meta.url).href);
  for (const name of ['level', 'stream', 'scale', 'flow', 'style', 'innerOpacity', 'bloomOpacity'])
    assert.ok(name in component.default.props, `Missing VoiceGlow runtime prop: ${name}`);
  const metadata: {
    contributions: { html: { tags: { name: string; attributes: { name: string }[] }[] } };
  } = JSON.parse(await readFile(new URL('../json/web-types.json', import.meta.url), 'utf8'));
  const attributes = metadata.contributions.html.tags.find(
    (tag) => tag.name === 'sd-voice-glow',
  )?.attributes;
  for (const name of ['inner-opacity', 'bloom-opacity'])
    assert.ok(
      attributes?.some((attribute) => attribute.name === name),
      `Missing VoiceGlow metadata: ${name}`,
    );
});

test('BorderBeam native style, pulse and counter deep entries retain shared identities and portable declarations', async () => {
  const legacy = await import('../es/border-beam/styles.js');
  const styles = await import('@sdata/web-core/border-beam/styles');
  const pulse = await import('../es/border-beam/pulseDriver.js');
  const nativePulse = await import('@sdata/web-core/border-beam/pulseDriver');
  const counter = await import('../es/border-beam/instance-id.js');
  const nativeCounter = await import('@sdata/web-core/border-beam/instance-id');
  assert.equal(legacy.generateBeamCSS, styles.generateBeamCSS);
  assert.equal(legacy.getPulseDriverConfig, styles.getPulseDriverConfig);
  assert.equal(legacy.sizePresets, styles.sizePresets);
  assert.equal(legacy.sizeThemePresets, styles.sizeThemePresets);
  assert.equal(pulse.registerPulseInstance, nativePulse.registerPulseInstance);
  assert.equal(counter.nextInstanceId, nativeCounter.nextInstanceId);
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/border-beam/border-beam.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /BorderBeamExposed/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('Layout compound and deep entries retain portable SFC declarations and collapse event types', async () => {
  const { readFile } = await import('node:fs/promises');
  const component = await import('../es/layout/index.js');
  const sider = await import(new URL('../es/layout/sider.js', import.meta.url).href);
  const layout = await import(new URL('../es/layout/layout.js', import.meta.url).href);
  assert.equal(component.default.Sider, sider.default);
  assert.equal(component.LayoutSider, sider.default);
  assert.equal(component.default, layout.default);
  for (const name of ['sider', 'layout']) {
    const declaration = await readFile(
      new URL(`../es/layout/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
  const types = await readFile(new URL('../es/layout/interface.d.ts', import.meta.url), 'utf8');
  assert.match(types, /@sdata\/web-core\/layout\/sider/);
  assert.match(types, /CollapseType/);
});

test('RichTextEditor inline node facade retains the shared class identity and all legacy helpers', async () => {
  const { readFile } = await import('node:fs/promises');
  const component = await import('../es/rich-text-editor/index.js');
  const legacy = await import('../es/rich-text-editor/nodes/inline-component-node.js');
  const core = await import('@sdata/web-core/rich-text-editor/nodes/inline-component-node');
  assert.equal(legacy.InlineComponentNode, core.InlineComponentNode);
  assert.equal(legacy.$createInlineComponentNode, core.$createInlineComponentNode);
  assert.equal(legacy.$isInlineComponentNode, core.$isInlineComponentNode);
  assert.equal(component.InlineComponentNode, core.InlineComponentNode);
  assert.equal(component.$createInlineComponentNode, core.$createInlineComponentNode);
  assert.equal(component.$isInlineComponentNode, core.$isInlineComponentNode);
  assert.ok(component.RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES.includes('tag'));
  for (const file of ['index.d.ts', 'rich-text-editor.vue.d.ts']) {
    const declaration = await readFile(
      new URL(`../es/rich-text-editor/${file}`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(declaration, /node_modules/);
    assert.match(declaration, file === 'index.d.ts' ? /install:/ : /RichTextEditorRef/);
  }
});
test('JsonForm legacy helpers and typed component entry survive extraction', async () => {
  const legacy = await import('../es/json-form/utils.js');
  const component = await import('../es/json-form/index.js');
  const core = await import('@sdata/web-core/json-form/schema');
  const types = await import('../es/json-form/types.js');
  for (const name of [
    'shouldStretchJsonFormControl',
    'parseJsonFormPath',
    'getJsonFormValue',
    'setJsonFormValue',
    'mergeJsonFormClassName',
  ] as const) {
    assert.equal(legacy[name], core[name]);
  }
  assert.equal(typeof legacy.resolveJsonFormComponents, 'function');
  assert.equal(typeof legacy.translateA2UI_0_9_1ToJsonFormSchemas, 'function');
  assert.ok(legacy.jsonFormBuiltInComponents.input);
  const schemas = [{ field: 'name' }];
  assert.equal(component.defineJsonFormSchemas()(schemas), schemas);
  assert.equal(component.A2UI_0_9_1, 'a2ui-0.9.1');
  assert.equal(types.A2UI_0_9_1, component.A2UI_0_9_1);
  assert.equal(types.JSON_FORM_ADAPTERS.default, 'default');
  assert.equal(types.JSON_FORM_COMPONENT_TYPES.input, 'input');
});
test('Radio context deep entry preserves its public constants and injection key', async () => {
  const legacy = await import('../es/radio/context.js');
  const core = await import('@sdata/web-core/radio/types');
  assert.equal(legacy.RADIO_TYPES, core.RADIO_TYPES);
  assert.equal(typeof legacy.radioGroupKey, 'symbol');
});
test('Slider utility deep entry retains its percentage and Vue style helpers', async () => {
  const legacy = await import('../es/slider/utils.js');
  const core = await import('@sdata/web-core/slider/data');
  assert.equal(legacy.getOffsetPercent, core.getOffsetPercent);
  assert.deepEqual(legacy.getPositionStyle('25%', 'vertical'), { bottom: '25%' });
});

test('Pagination deep entries preserve their public type constant and legal-page helper', async () => {
  const legacy = await import('../es/pagination/interface.js');
  const core = await import('@sdata/web-core/pagination/types');
  const utils = await import('../es/pagination/utils.js');
  const coreUtils = await import('@sdata/web-core/pagination/utils');
  assert.equal(legacy.PAGE_ITEM_TYPES, core.PAGE_ITEM_TYPES);
  assert.equal(utils.getLegalPage, coreUtils.getLegalPage);
});

test('Trigger legacy geometry and scroll utilities retain shared function identities', async () => {
  const legacy = await import('../es/trigger/utils.js');
  const core = await import('@sdata/web-core/trigger/utils');
  for (const name of ['getTransformOrigin', 'isScrollElement', 'getScrollElements'] as const) {
    assert.equal(legacy[name], core[name]);
  }
});

test('Tabs legacy scroll utility retains the shared browser helper identity', async () => {
  const legacy = await import('../es/tabs/utils.js');
  const core = await import('@sdata/web-core/tabs/utils');
  assert.equal(legacy.updateScrollOffset, core.updateScrollOffset);
});

test('Overlay legacy focus, overflow lock and stack constants preserve shared identities', async () => {
  const focus = await import('../es/_hooks/use-focus-trap.js');
  const coreFocus = await import('@sdata/web-core/popup/focus-trap');
  const overflow = await import('../es/_utils/overflow-lock.js');
  const coreOverflow = await import('@sdata/web-core/popup/overflow-lock');
  const stack = await import('../es/style/theme/z-index.js');
  const coreStack = await import('@sdata/web-core/popup/z-index');
  assert.equal(focus.getFocusableElements, coreFocus.getFocusableElements);
  assert.equal(overflow.acquireOverflowLock, coreOverflow.acquireOverflowLock);
  assert.equal(overflow.releaseOverflowLock, coreOverflow.releaseOverflowLock);
  assert.deepEqual({ ...stack }, { ...coreStack });
});

test('The complete ESM package entry loads on the server without a DOM', async () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const library = await import('../es/index.js');
  assert.ok(library.Modal && library.Drawer && library.Popconfirm && library.Sender);
  assert.equal(typeof library.RecorderCore, 'function');
});

test('Message and Notification position constants retain their legacy deep entry identities', async () => {
  const message = await import('../es/message/interface.js');
  const notification = await import('../es/notification/interface.js');
  const core = await import('@sdata/web-core/notice/types');
  assert.equal(message.MESSAGE_POSITION, core.MESSAGE_POSITION);
  assert.equal(notification.NOTIFICATION_POSITION, core.NOTIFICATION_POSITION);
});

test('Image utilities and frame scheduling retain legacy deep import identities', async () => {
  const image = await import('../es/image/utils/index.js');
  const coreImage = await import('@sdata/web-core/image/utils/index');
  const scale = await import('../es/image/utils/get-scale.js');
  const coreScale = await import('@sdata/web-core/image/utils/get-scale');
  const fix = await import('../es/image/utils/get-fix-translate.js');
  const coreFix = await import('@sdata/web-core/image/utils/get-fix-translate');
  const throttle = await import('../es/_utils/throttle-by-raf.js');
  const coreThrottle = await import('@sdata/web-core/_utils/throttle-by-raf');
  assert.equal(image.normalizeImageSizeProp, coreImage.normalizeImageSizeProp);
  assert.equal(scale.default, coreScale.default);
  assert.equal(fix.default, coreFix.default);
  assert.equal(throttle.throttleByRaf, coreThrottle.throttleByRaf);
  const { default: useImageLoadStatus } =
    await import('../es/image/hooks/use-image-load-status.js');
  const state = useImageLoadStatus();
  assert.equal(state.isBeforeLoad.value, true);
  state.setLoadStatus('error');
  assert.equal(state.isError.value, true);
});

test('ColorPicker legacy utilities preserve every exported core identity', async () => {
  const legacy = await import('../es/color-picker/utils.js');
  const core = await import('@sdata/web-core/color-picker/utils');
  assert.deepEqual(Object.keys(legacy).sort(), Object.keys(core).sort());
  for (const key of Object.keys(core)) {
    assert.equal(Reflect.get(legacy, key), Reflect.get(core, key), key);
  }
});

test('Carousel keeps its compound component and injection-key deep entries', async () => {
  const root = await import('../es/index.js');
  const { default: carousel, CarouselItem } = await import('../es/carousel/index.js');
  const { carouselInjectionKey } = await import('../es/carousel/context.js');
  assert.equal(root.Carousel, carousel);
  assert.equal(root.CarouselItem, CarouselItem);
  assert.equal(carousel.Item, CarouselItem);
  assert.equal(carousel.name, 'Carousel');
  assert.equal(CarouselItem.name, 'CarouselItem');
  assert.equal(typeof carouselInjectionKey, 'symbol');
});

test('Tour keeps the native driver engine identity and its existing deep component entry', async () => {
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(new URL('../es/tour/tour.vue.d.ts', import.meta.url), 'utf8');
  assert.match(declaration, /DefineComponent<Config, TourController/);
  assert.doesNotMatch(declaration, /node_modules/);
  const native = await import('driver.js');
  const shared = await import('@sdata/web-core/tour/engine');
  const root = await import('../es/index.js');
  const { default: tour } = await import('../es/tour/index.js');
  assert.equal(shared.driver, native.driver);
  assert.equal(tour, root.Tour);
  assert.equal(tour.name, 'Tour');
});

test('Scroll component deep utilities retain shared identities and portable SFC declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const legacyDom = await import('../es/_utils/dom.js');
  const coreDom = await import('@sdata/web-core/_utils/dom');
  for (const key of Object.keys(coreDom))
    assert.equal(Reflect.get(legacyDom, key), Reflect.get(coreDom, key), key);
  const legacyAnchor = await import('../es/anchor/utils.js');
  const coreAnchor = await import('@sdata/web-core/anchor/utils');
  assert.equal(legacyAnchor.slide, coreAnchor.slide);
  assert.equal(legacyAnchor.BOUNDARY_POSITIONS, coreAnchor.BOUNDARY_POSITIONS);
  const legacyTime = await import('../es/time-picker/utils/index.js');
  const coreTime = await import('@sdata/web-core/_utils/scroll-to');
  assert.equal(legacyTime.scrollTo, coreTime.scrollTo);
  for (const name of ['anchor/anchor', 'affix/affix', 'back-top/back-top']) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('InputTag, Mention and readonly helpers retain legacy identities and real SFC declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  await import('@sdata/web-core/auto-complete/types');
  const autoTypes = await readFile(
    new URL('./types.d.ts', import.meta.resolve('@sdata/web-core/auto-complete/types')),
    'utf8',
  );
  assert.match(autoTypes, /export type AutoCompleteData/);
  const tag = await import('../es/input-tag/utils.js');
  const coreTag = await import('@sdata/web-core/input-tag/utils');
  assert.equal(tag.getValueData, coreTag.getValueData);
  const mention = await import('../es/mention/utils.js');
  const coreMention = await import('@sdata/web-core/mention/utils');
  for (const name of Object.keys(coreMention))
    assert.equal(Reflect.get(mention, name), Reflect.get(coreMention, name));
  const readonly = await import('../es/_hooks/use-readonly-tip.js');
  const coreReadonly = await import('@sdata/web-core/text-input/readonly');
  assert.equal(readonly.isReadonlyModificationKey, coreReadonly.isReadonlyModificationKey);
  for (const name of ['input-tag/input-tag', 'auto-complete/auto-complete', 'mention/mention']) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('VerificationCode, Steps, Timeline and index hook retain legacy entries and declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const steps = await import('../es/steps/index.js');
  const timeline = await import('../es/timeline/index.js');
  const constants = await import('../es/steps/interface.js');
  const core = await import('@sdata/web-core/steps/types');
  const hook = await import('../es/_hooks/use-index.js');
  assert.equal(root.Steps, steps.default);
  assert.equal(steps.default.Step, root.Step);
  assert.equal(root.Timeline, timeline.default);
  assert.equal(timeline.default.Item, root.TimelineItem);
  assert.equal(constants.STEPS_TYPES, core.STEPS_TYPES);
  assert.equal(constants.STEP_STATUSES, core.STEP_STATUSES);
  assert.equal(typeof hook.useIndex, 'function');
  for (const name of [
    'verification-code/verification-code',
    'steps/steps',
    'steps/step',
    'timeline/timeline',
    'timeline/item',
  ]) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('Badge constants and Statistic compound component retain legacy identities and declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const statistic = await import('../es/statistic/index.js');
  const badge = await import('../es/badge/constants.js');
  const core = await import('@sdata/web-core/badge/constants');
  const utils = await import('../es/statistic/utils.js');
  const coreUtils = await import('@sdata/web-core/statistic/utils');
  assert.equal(root.Statistic, statistic.default);
  assert.equal(root.Countdown, statistic.Countdown);
  assert.equal(root.Statistic.Countdown, root.Countdown);
  assert.equal(badge.COLORS, core.COLORS);
  assert.equal(badge.BADGE_STATUSES, core.BADGE_STATUSES);
  assert.equal(utils.getDateString, coreUtils.getDateString);
  for (const name of ['badge/badge', 'statistic/statistic', 'statistic/countdown']) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('NumberFlow pure helpers and compound group preserve legacy deep entries and declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const flow = await import('../es/number-flow/index.js');
  const formatter = await import('../es/number-flow/formatter.js');
  const coreFormatter = await import('@sdata/web-core/number-flow/formatter');
  const continuous = await import('../es/number-flow/continuous.js');
  const coreContinuous = await import('@sdata/web-core/number-flow/continuous');
  const key = await import('../es/number-flow/group-key.js');
  const motion = await import('../es/number-flow/use-can-animate.js');
  assert.equal(root.NumberFlow, flow.default);
  assert.equal(root.NumberFlowGroup, flow.NumberFlowGroup);
  assert.equal(root.continuous, coreContinuous.continuous);
  assert.equal(flow.continuous, coreContinuous.continuous);
  assert.equal(continuous.continuous, coreContinuous.continuous);
  assert.equal(formatter.formatNumberFlow, coreFormatter.formatNumberFlow);
  assert.equal(typeof key.GROUP_KEY, 'symbol');
  assert.equal(typeof motion.useCanAnimate, 'function');
  for (const name of ['number-flow/number-flow', 'number-flow/number-flow-group']) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('Watermark old utilities and observer/theme hooks retain legacy entries', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const watermark = await import('../es/watermark/index.js');
  const utils = await import('../es/watermark/utils/index.js');
  const core = await import('@sdata/web-core/watermark/utils');
  const observer = await import('../es/watermark/hooks/use-mutation-observer.js');
  const theme = await import('../es/watermark/hooks/use-theme.js');
  assert.equal(root.Watermark, watermark.default);
  for (const name of ['styleToString', 'canvasToGray', 'camelToKebab'] as const)
    assert.equal(utils[name], core[name]);
  for (const name of ['useMutationObserver', 'unrefElement', 'tryOnScopeDispose'] as const)
    assert.equal(typeof observer[name], 'function');
  assert.equal(observer.defaultWindow, undefined);
  assert.equal(typeof theme.useTheme, 'function');
  const declaration = await readFile(
    new URL('../es/watermark/watermark.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('Cropper root and deep entries stay inert on the server and retain their public declaration', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/cropper/index.js');
  const engine = await import('@sdata/web-core/cropper/engine');
  assert.equal(root.Cropper, entry.default);
  assert.equal(typeof engine.loadCropper, 'function');
  const declaration = await readFile(
    new URL('../es/cropper/cropper.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('Scrollbar root/deep entries and native engine stay importable without a DOM', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/scrollbar/index.js');
  const engine = await import('@sdata/web-core/scrollbar/engine');
  const native = await import('overlayscrollbars');
  assert.equal(root.Scrollbar, entry.default);
  assert.equal(engine.OverlayScrollbars, native.OverlayScrollbars);
  const declaration = await readFile(
    new URL('../es/scrollbar/scrollbar.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.doesNotMatch(declaration, /node_modules/);
});

test('QrCode installed root/deep entries and shared encoder load without a DOM', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/qr-code/index.js');
  const engine = await import('@sdata/web-core/qr-code/engine');
  const native = await import('qrcode');
  assert.equal(root.QrCode, entry.default);
  assert.equal(engine.QRCode, native.default);
  const declaration = await readFile(
    new URL('../es/qr-code/qr-code.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.doesNotMatch(declaration, /node_modules/);
  const types = await readFile(new URL('../es/qr-code/types.d.ts', import.meta.url), 'utf8');
  assert.match(types, /@sdata\/web-core\/qr-code\/types/);
  assert.match(types, /spinProps\?: SpinProps/);
});

test('PanelGroup preserves every engine deep entry and Vue reactive/motion adapters', async () => {
  const { readFile } = await import('node:fs/promises');
  const { isReactive } = await import('vue');
  const root = await import('../es/index.js');
  const entry = await import('../es/panel-group/index.js');
  assert.equal(root.PanelGroup, entry.default);
  assert.equal(root.Panel, entry.Panel);
  assert.equal(root.PanelSeparator, entry.PanelSeparator);
  for (const [file, names] of Object.entries({
    axes: ['AXES'],
    dom: [
      'FILL_ATTRIBUTE',
      'SEPARATOR_ATTRIBUTE',
      'hasFillAfter',
      'isRtl',
      'isSeparator',
      'lockBody',
    ],
    env: ['coarsePointer', 'reducedMotion', 'edgeSize'],
    grips: ['grips'],
    reorder: ['reorder'],
    separator: ['attachSeparator'],
    transition: ['DEFAULT_TRANSITION', 'bezier', 'timing', 'cssEasing'],
    utils: ['noop', 'emitter'],
  })) {
    const legacy = await import(`../es/panel-group/core/${file}.js`);
    const core = await import(`@sdata/web-core/panel-group/${file}`);
    for (const name of names) assert.equal(legacy[name], core[name], `${file}.${name}`);
  }
  const { createEngineGroup } = await import('../es/panel-group/core/group.js');
  const { createPanel } = await import('../es/panel-group/core/panel.js');
  const { MotionValue } = await import('../es/panel-group/core/motion.js');
  const group = createEngineGroup();
  assert.equal(isReactive(group.axes), true);
  assert.equal(isReactive(group.fill), true);
  assert.equal(isReactive(group.panels), false);
  const panel = createPanel(group, { size: 200 });
  assert.equal(panel.motion.size instanceof MotionValue, true);
  const value = new MotionValue();
  value.animate(10, { duration: 0, easing: (progress: number) => progress });
  assert.equal(value.get(), 10);
  panel.destroy();
  for (const name of ['panel-group', 'panel', 'panel-separator']) {
    const declaration = await readFile(
      new URL(`../es/panel-group/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('Calendar event/config and special-hours deep entries retain exports and server import safety', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/calendar/index.js');
  const config = await import('../es/calendar/core/config.js');
  const constants = await import('@sdata/web-core/calendar/constants');
  const events = await import('../es/calendar/core/events.js');
  const drag = await import('../es/calendar/modules/drag-and-drop.js');
  const view = await import('../es/calendar/core/view.js');
  const texts = await import('../es/calendar/core/i18n.js');
  const coreTexts = await import('@sdata/web-core/calendar/i18n');
  const hours = await import('../es/calendar/utils/special-hours-allow-events.js');
  const coreHours = await import('@sdata/web-core/calendar/special-hours-allow-events');
  assert.equal(root.Calendar, entry.default);
  for (const name of ['defaults', 'months', 'weekdays'] as const)
    assert.equal(config[name], constants[name]);
  assert.equal(typeof config.useConfig, 'function');
  assert.equal(typeof events.useEvents, 'function');
  assert.equal(typeof drag.useDragAndDrop, 'function');
  assert.equal(typeof view.useView, 'function');
  assert.equal(texts.createCalendarTexts.length, 1);
  const eventComponent = await import(
    new URL('../es/calendar/components/event.js', import.meta.url).href
  );
  assert.ok(eventComponent.default);
  const eventDeclaration = await readFile(
    new URL('../es/calendar/components/event.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(eventDeclaration, /DefineComponent/);
  assert.match(eventDeclaration, /CalendarEvent/);
  const cellComponent = await import(
    new URL('../es/calendar/components/cell.js', import.meta.url).href
  );
  assert.ok(cellComponent.default);
  const cellDeclaration = await readFile(
    new URL('../es/calendar/components/cell.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(cellDeclaration, /ComputedRef<CalendarEvent\[\]>/);
  assert.match(cellDeclaration, /'cell-content'/);
  const propsDefinitions = await import('../es/calendar/core/props-definitions.js');
  assert.equal(propsDefinitions.minutesInADay, constants.minutesInADay);
  for (const file of ['body', 'header', 'headings-bar', 'time-column']) {
    const surface = await import(
      new URL(`../es/calendar/components/${file}.js`, import.meta.url).href
    );
    assert.ok(surface.default);
    const declaration = await readFile(
      new URL(`../es/calendar/components/${file}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /__VLS_WithSlots/);
  }
  assert.deepEqual(
    texts.createCalendarTexts(undefined, 'en'),
    coreTexts.createCalendarTexts(undefined, 'en'),
  );
  const configDeclaration = await readFile(
    new URL('../es/calendar/core/config.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(configDeclaration, /ComputedRef/);
  assert.match(configDeclaration, /CalendarSchedule/);
  assert.doesNotMatch(configDeclaration, /CalendarConfigInput/);
  for (const name of [
    'eventRangeViolatesAllowEvents',
    'maxValidEndForFixedStart',
    'minValidStartForFixedEnd',
    'clampDragCreateDayMinutes',
    'clampResizeProposedRange',
  ] as const)
    assert.equal(hours[name], coreHours[name]);
  const declaration = await readFile(
    new URL('../es/calendar/components/index.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.match(declaration, /view:/);
  assert.doesNotMatch(declaration, /node_modules/);
  const types = await readFile(new URL('../es/calendar/types.d.ts', import.meta.url), 'utf8');
  assert.match(types, /@sdata\/web-core\/calendar\/types/);
  assert.match(types, /CSSProperties/);
  assert.match(types, /UnwrapRef/);
  const eventsDeclaration = await readFile(
    new URL('../es/calendar/core/events.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(eventsDeclaration, /ShallowReactive/);
});

test('Picker input deep entries retain portable SFC declarations and native shared rules', async () => {
  const { readFile } = await import('node:fs/promises');
  const core = await import('@sdata/web-core');
  const native = await import('@sdata/web-core/picker/input');
  assert.equal(core.pickerInput.resolvePickerInputValue, native.resolvePickerInputValue);
  for (const file of ['input', 'input-range']) {
    const component = await import(
      new URL(`../es/_components/picker/${file}.js`, import.meta.url).href
    );
    assert.equal(typeof component.default, 'object');
    const declaration = await readFile(
      new URL(`../es/_components/picker/${file}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    assert.match(declaration, /focus/);
    assert.match(declaration, /blur/);
    assert.doesNotMatch(declaration, /node_modules|PickerRangeInputState/);
  }
});

test('ThemeProvider deep entries share the native global owner stack and preserve Vue declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/theme-provider/index.js');
  const component = await import(
    new URL('../es/config-provider/theme-provider.js', import.meta.url).href
  );
  const legacy = await import('../es/config-provider/global-theme.js');
  const native = await import('@sdata/web-core/config-provider/global-theme');
  assert.equal(root.ThemeProvider, entry.default);
  assert.equal(entry.default, component.default);
  assert.equal(legacy.applyGlobalTheme, native.applyGlobalTheme);
  assert.equal(legacy.releaseGlobalTheme, native.releaseGlobalTheme);
  const declaration = await readFile(
    new URL('../es/config-provider/theme-provider.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(declaration, /DefineComponent/);
  assert.match(declaration, /SdThemeConfig/);
  assert.doesNotMatch(declaration, /ThemeProviderFoundationState|node_modules/);
});

test('Ellipsis compound/deep entries preserve exposed measurement and portable Vue declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/ellipsis/index.js');
  const standard = await import(new URL('../es/ellipsis/ellipsis.js', import.meta.url).href);
  const performant = await import(
    new URL('../es/ellipsis/performant-ellipsis.js', import.meta.url).href
  );
  assert.equal(root.Ellipsis, entry.default);
  assert.equal(root.Ellipsis, standard.default);
  assert.equal(root.PerformantEllipsis, entry.PerformantEllipsis);
  assert.equal(root.PerformantEllipsis, performant.default);
  for (const name of ['ellipsis', 'performant-ellipsis']) {
    const declaration = await readFile(
      new URL(`../es/ellipsis/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(
      declaration,
      /EllipsisFoundationState|PerformantEllipsisState|node_modules/,
    );
    if (name === 'ellipsis') {
      assert.match(declaration, /waitForMeasurement/);
      assert.match(declaration, /toggleExpanded/);
      assert.match(declaration, /triggerElement/);
    }
  }
});

test('Descriptions preserves compound items and Vue render types around generic shared grouping', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await import('../es/index.js');
  const entry = await import('../es/descriptions/index.js');
  const item = await import(
    new URL('../es/descriptions/descriptions-item.js', import.meta.url).href
  );
  assert.equal(root.Descriptions, entry.default);
  assert.equal(root.DescriptionsItem, entry.DescriptionsItem);
  assert.equal(entry.default.DescriptionsItem, item.default);
  const types = await readFile(
    new URL('../es/descriptions/interface.d.ts', import.meta.url),
    'utf8',
  );
  assert.match(types, /@sdata\/web-core\/descriptions\/types/);
  assert.match(types, /interface DescData/);
  assert.match(types, /RenderFunction/);
  assert.match(types, /interface DescItemData/);
  assert.match(types, /interface RenderData/);
  for (const name of ['descriptions', 'descriptions-item']) {
    const declaration = await readFile(
      new URL(`../es/descriptions/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /DefineComponent/);
    assert.doesNotMatch(declaration, /node_modules/);
  }
});

test('Table column hooks retain live Vue refs and portable deep declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const { effectScope, isRef, reactive, ref } = await import('vue');
  const { useColumnFilter } = await import('../es/table/hooks/use-column-filter.js');
  const { useColumnSorter } = await import('../es/table/hooks/use-column-sorter.js');
  const scope = effectScope();
  scope.run(() => {
    const column = ref({ dataIndex: 'name', sortable: { sortDirections: ['ascend' as const] } });
    const context = reactive({ filters: { name: ['native'] } });
    const filter = useColumnFilter({ column, tableCtx: context });
    const sorter = useColumnSorter({ column, tableCtx: context });
    for (const value of [
      filter.columnFilterValue,
      filter.filterPopupVisible,
      filter.isFilterActive,
      filter.isMultipleFilter,
      sorter.sortOrder,
      sorter.hasSorter,
      sorter.hasAscendBtn,
      sorter.hasDescendBtn,
      sorter.nextSortOrder,
    ])
      assert.equal(isRef(value), true);
    assert.deepEqual(filter.columnFilterValue.value, ['native']);
    filter.handleRadioFilterChange('changed');
    assert.deepEqual(filter.columnFilterValue.value, ['changed']);
    assert.deepEqual(context.filters.name, ['native']);
    assert.equal(sorter.nextSortOrder.value, 'ascend');
  });
  scope.stop();
  for (const name of ['filter', 'sorter']) {
    const declaration = await readFile(
      new URL(`../es/table/hooks/use-column-${name}.d.ts`, import.meta.url),
      'utf8',
    );
    assert.match(declaration, /Ref/);
    assert.doesNotMatch(declaration, /ColumnFilterState|ColumnSorterState|node_modules/);
  }
});

test('Legacy input and column-resize hooks retain inert SSR refs and portable declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const { createSSRApp, defineComponent, h, isRef, ref } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { useInput } = await import('../es/_hooks/use-input.js');
  const { useColumnResize } = await import('../es/table/hooks/use-column-resize.js');
  const html = await renderToString(
    createSSRApp(
      defineComponent({
        setup() {
          const input = useInput({ defaultValue: ref('native'), emit() {} });
          const resize = useColumnResize(ref({}), () => {});
          assert.equal(isRef(input.inputRef), true);
          assert.equal(isRef(input._value), true);
          assert.equal(isRef(input.computedValue), true);
          assert.equal(isRef(resize.resizingColumn), true);
          assert.equal(Object.getPrototypeOf(resize.columnWidth), null);
          return () => h('span', input.computedValue.value);
        },
      }),
    ),
  );
  assert.equal(html, '<span>native</span>');
  for (const file of ['_hooks/use-input', 'table/hooks/use-column-resize']) {
    const declaration = await readFile(new URL(`../es/${file}.d.ts`, import.meta.url), 'utf8');
    assert.match(declaration, /Ref/);
    assert.doesNotMatch(declaration, /LegacyInputState|ColumnResizeState|node_modules/);
  }
});

test('Native transition, focus and time-value adapters retain portable deep declarations and SSR', async () => {
  const { readFile } = await import('node:fs/promises');
  const { h, reactive } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: useTimePickerValue } =
    await import('../es/date-picker/hooks/use-time-picker-value.js');
  const { default: useRangeTimePickerValue } =
    await import('../es/date-picker/hooks/use-range-time-picker-value.js');
  const html = await renderToString(
    h({
      setup() {
        const [single] = useTimePickerValue(
          reactive({
            selectedValue: undefined,
            timePickerProps: { defaultValue: '01:02:03', format: 'HH:mm:ss' },
          }),
        );
        const [range] = useRangeTimePickerValue(
          reactive({
            selectedValue: undefined,
            timePickerProps: { defaultValue: ['04:05:06', '07:08:09'], format: 'HH:mm:ss' },
          }),
        );
        return () =>
          h(
            'span',
            [single.value, ...range.value].map((value) => value.format('HH:mm:ss')).join('|'),
          );
      },
    }),
  );
  assert.equal(html, '<span>01:02:03|04:05:06|07:08:09</span>');
  for (const file of [
    '_components/transition/expand-transition.vue',
    'tree/expand-transition.vue',
    '_components/select-view/select-view.vue',
    'date-picker/hooks/use-time-picker-value',
    'date-picker/hooks/use-range-time-picker-value',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(declaration, /TimePickerValueState|sidePropsState|node_modules/);
  }
});

test('Locale data keeps core identity, Vue interface declarations and SSR translation fallback', async () => {
  const { readFile } = await import('node:fs/promises');
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: zhCN } = await import('../es/locale/lang/zh-cn.js');
  const { default: enUS } = await import('../es/locale/lang/en-us.js');
  const { default: coreZhCN } = await import('@sdata/web-core/locale/lang/zh-cn');
  const { default: coreEnUS } = await import('@sdata/web-core/locale/lang/en-us');
  const { default: ConfigProvider } = await import('../es/config-provider/index.js');
  const { useI18n } = await import('../es/locale/index.js');
  assert.equal(zhCN, coreZhCN);
  assert.equal(enUS, coreEnUS);
  const language = { ...enUS, readonlyTip: undefined };
  const html = await renderToString(
    h(ConfigProvider, { locale: language }, () =>
      h({
        setup() {
          const { t, locale } = useI18n();
          return () => h('span', `${locale.value}|${t('readonlyTip')}|${t('missing.key')}`);
        },
      }),
    ),
  );
  assert.match(html, new RegExp(`en-US\\|${zhCN.readonlyTip}\\|missing.key`));
  const declaration = await readFile(
    new URL('../es/locale/interface.d.ts', import.meta.url),
    'utf8',
  );
  for (const name of ['SDCalendarLang', 'ValidateMessage', 'SdA11yLang', 'SdLang'])
    assert.match(declaration, new RegExp(`interface ${name}\\b`));
  assert.doesNotMatch(declaration, /node_modules/);
});

test('Legacy pagination and cursor hooks preserve SSR refs, local release state and deep declarations', async () => {
  const { readFile } = await import('node:fs/promises');
  const { effectScope, h, ref, reactive, isRef, watchEffect, nextTick } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { usePagination: useShared } = await import('../es/_hooks/use-pagination.js');
  const { usePagination: useList } = await import('../es/list/use-pagination.js');
  const { usePagination: useTable } = await import('../es/table/hooks/use-pagination.js');
  const { useCursor } = await import('../es/_hooks/use-cursor.js');
  const scope = effectScope();
  scope.run(() => {
    const options = reactive<{ current?: number; pageSize?: number }>({ current: 1, pageSize: 2 });
    const shared = useShared({ pagination: options }, { emit() {} });
    const list = useList({ paginationProps: options }, { emit() {} });
    const table = useTable({ pagination: options }, () => {});
    for (const api of [shared, list, { ...table, current: table.page }]) {
      assert.equal(isRef(api.current), true);
      api.handlePageChange(9);
      assert.equal(api.current.value, 1);
    }
    delete options.current;
    assert.equal(shared.current.value, 9);
    assert.equal(list.current.value, 9);
    assert.equal(table.page.value, 9);
    const [record, restore] = useCursor(ref());
    record();
    restore();
  });
  scope.stop();
  const trackingScope = effectScope();
  let runs = 0;
  let recordSelection = () => {};
  trackingScope.run(() => {
    const input = ref<HTMLInputElement | undefined>({
      value: 'abcXYZ',
      selectionStart: 3,
      selectionEnd: 3,
      setSelectionRange() {},
    } as unknown as HTMLInputElement);
    const [record, restore] = useCursor(input);
    recordSelection = record;
    watchEffect(() => {
      restore();
      runs++;
    });
  });
  recordSelection();
  await nextTick();
  assert.equal(runs, 2);
  trackingScope.stop();
  const html = await renderToString(
    h({
      setup() {
        const pagination = useShared(
          { pagination: { defaultCurrent: 4, defaultPageSize: 6 } },
          { emit() {} },
        );
        return () => h('span', `${pagination.current.value}|${pagination.pageSize.value}`);
      },
    }),
  );
  assert.equal(html, '<span>4|6</span>');
  for (const file of [
    '_hooks/use-pagination',
    'list/use-pagination',
    'table/hooks/use-pagination',
    '_hooks/use-cursor',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(declaration, /LegacyPaginationState|paginationState|node_modules/);
  }
});

test('Tree state and popup adapters retain portable declarations and inert teleport SSR state', async () => {
  const { readFile } = await import('node:fs/promises');
  const { h, ref, reactive, effectScope, nextTick } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: useCheckedState } = await import('../es/tree/hooks/use-checked-state.js');
  const { useTrigger } = await import('../es/_hooks/use-trigger.js');
  const { useTeleportContainer } = await import('../es/_hooks/use-teleport-container.js');
  const scope = effectScope();
  const props = reactive({
    defaultCheckedKeys: ['default'],
    checkedKeys: undefined as (string | number)[] | undefined,
    halfCheckedKeys: undefined,
    key2TreeNode: new Map(),
    checkStrictly: true,
    onlyCheckLeaf: false,
  });
  let tree!: ReturnType<typeof useCheckedState>;
  scope.run(() => {
    tree = useCheckedState(props);
    const popup = useTrigger({ emit() {} });
    assert.equal(popup.computedPopupVisible.value, false);
    popup.handlePopupVisibleChange(true);
    assert.equal(popup.computedPopupVisible.value, true);
  });
  assert.deepEqual([...tree.checkedKeys.value], ['default']);
  props.checkedKeys = ['held'];
  await nextTick();
  assert.deepEqual([...tree.checkedKeys.value], ['held']);
  props.checkedKeys = undefined;
  await nextTick();
  assert.deepEqual([...tree.checkedKeys.value], []);
  scope.stop();
  const html = await renderToString(
    h({
      setup() {
        const api = useTeleportContainer({ popupContainer: ref('#missing'), visible: ref(false) });
        return () =>
          h('span', `${api.teleportContainer.value}|${api.containerRef.value === undefined}`);
      },
    }),
  );
  assert.equal(html, '<span>#missing|true</span>');
  for (const file of [
    'tree/hooks/use-checked-state',
    '_hooks/use-trigger',
    '_hooks/use-teleport-container',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /\bCheckedState\b|CompatTriggerState|TeleportContainerState|node_modules/,
    );
  }
});

test('configuration priority and legacy state hooks retain installed Ref and SSR contracts', async () => {
  const { readFile } = await import('node:fs/promises');
  const { h, ref, reactive, effectScope, nextTick, isReadonly } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: ConfigProvider } = await import('../es/config-provider/index.js');
  const { default: useMergeState } = await import('../es/_hooks/use-merge-state.js');
  const { default: usePopupContainer } = await import('../es/_hooks/use-popup-container.js');
  const { useAllowClear } = await import('../es/_hooks/use-allow-clear.js');
  const { useAllowSearch } = await import('../es/_hooks/use-allow-search.js');
  const { useConfigProviderProp } = await import('../es/_hooks/use-config-provider-prop.js');
  const { useDropdownVirtualListProps } =
    await import('../es/_hooks/use-dropdown-virtual-list-props.js');
  const scope = effectScope(),
    props = reactive({ value: undefined as string | undefined });
  const tuple = scope.run(() => useMergeState('seed', props))!;
  assert.equal(tuple[0].value, 'seed');
  assert.equal(tuple[2].value, 'seed');
  assert.equal(isReadonly(tuple[0]), true);
  tuple[1]('pending');
  props.value = 'held';
  await nextTick();
  assert.equal(tuple[0].value, 'held');
  assert.equal(tuple[2].value, 'pending');
  props.value = undefined;
  await nextTick();
  assert.equal(tuple[0].value, undefined);
  assert.equal(tuple[2].value, undefined);
  scope.stop();
  const html = await renderToString(
    h(
      ConfigProvider,
      { allowClear: true, allowSearch: true, virtualListProps: { height: 33 } },
      () =>
        h({
          setup() {
            const clear = useAllowClear(ref(undefined)).mergedAllowClear;
            const search = useAllowSearch(ref(undefined)).mergedAllowSearch;
            const generic = useConfigProviderProp(ref<boolean | undefined>(undefined), {
              propNames: ['value'],
              getGlobalValue: (context) => context?.allowClear,
            }).mergedValue;
            const virtual = useDropdownVirtualListProps(
              ref(undefined),
            ).mergedDropdownVirtualListProps;
            const container = usePopupContainer(undefined, { popupContainer: '#missing' });
            return () =>
              h(
                'span',
                `${clear.value}|${search.value}|${generic.value}|${virtual.value?.height}|${container.value === undefined}`,
              );
          },
        }),
    ),
  );
  assert.match(html, /true\|true\|true\|33\|true/);
  for (const file of [
    'use-config-provider-prop',
    'use-dropdown-virtual-list-props',
    'use-allow-search',
    'use-allow-clear',
    'use-merge-state',
    'use-popup-container',
  ]) {
    const declaration = await readFile(
      new URL(`../es/_hooks/${file}.d.ts`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(
      declaration,
      /ConfigPropState|AllowSearchState|AllowClearState|DropdownVirtualListState|node_modules/,
    );
  }
});

test('RegexVis layout deep entry and SSR use portable foundations without leaking state types', async () => {
  const { readFile } = await import('node:fs/promises');
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: RegexVis } = await import('../es/regex-vis/index.js');
  const { createRegexVisDiagram } = await import('../es/regex-vis/layout.js');
  const shared = await import('@sdata/web-core/regex-vis/layout');
  assert.equal(createRegexVisDiagram, shared.createRegexVisDiagram);
  const html = await renderToString(
    h(RegexVis, { modelValue: String.raw`^(foo|bar)+\d$`, flags: ['i'] }),
  );
  assert.match(html, /sd-regex-vis-node-choice/);
  assert.match(html, /sd-regex-vis-quantifier/);
  assert.match(html, /viewBox=/);
  const error = await renderToString(h(RegexVis, { modelValue: '[' }));
  assert.match(error, /role="alert"/);
  const declaration = await readFile(
    new URL('../es/regex-vis/regex-vis.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(declaration, /RegexVisState|node_modules/);
});

test('Tree node status and date body/range artifacts preserve server-rendered state', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: Tree } = await import('../es/tree/index.js');
  const { default: Body } = (await import(
    new URL('../es/date-picker/panels/body.js', import.meta.url).href
  )) as typeof import('../es/date-picker/panels/body.vue.d.ts');
  const { dayjs } = await import('@sdata/web-core/_utils/date');
  const tree = await renderToString(
    h(Tree, {
      data: [{ key: 'parent', title: 'Parent', children: [{ key: 'leaf', title: 'Leaf' }] }],
      defaultExpandedKeys: ['parent'],
      defaultSelectedKeys: ['leaf'],
      defaultCheckedKeys: ['leaf'],
      checkable: true,
    }),
  );
  assert.match(tree, /sd-tree-node-selected/);
  assert.match(tree, /sd-checkbox-checked/);
  const date = dayjs('2024-02-15');
  const body = await renderToString(
    h(Body, {
      prefixCls: 'test-calendar',
      rows: [[{ value: date, label: '15' }]],
      value: date,
      isSameTime: (a: import('dayjs').Dayjs, b: import('dayjs').Dayjs) => a.isSame(b, 'date'),
      rangeValues: [dayjs('2024-02-20'), dayjs('2024-02-10')],
      now: date,
      mode: 'date',
    }),
  );
  assert.match(body, /test-calendar-cell-in-range/);
  assert.match(body, /aria-selected="true"/);
  const { readFile } = await import('node:fs/promises');
  for (const name of [
    'tree/base-node.vue.d.ts',
    'date-picker/panels/body.vue.d.ts',
    'date-picker/hooks/use-cell-class-name.d.ts',
  ]) {
    const declaration = await readFile(new URL(`../es/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /TreeNodeState|DatePanelBodyState|DatePanelSameTimeCell|DateCellRangeState|node_modules/,
    );
  }
});

test('List paging/grid and InputPassword masking artifacts preserve SSR and public exposure', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: List } = await import('../es/list/index.js');
  const { InputPassword } = await import('../es/input/index.js');
  const html = await renderToString(
    h(
      List,
      {
        data: ['Alpha', 'Beta', 'Gamma'],
        gridProps: { span: 12 },
        paginationProps: { defaultPageSize: 2, total: 3 },
      },
      {
        item: ({ item }: { item: unknown }) => h('strong', String(item)),
      },
    ),
  );
  assert.match(html, /<strong>Alpha<\/strong>/);
  assert.match(html, /<strong>Beta<\/strong>/);
  assert.doesNotMatch(html, /<strong>Gamma<\/strong>/);
  const shown = await renderToString(h(InputPassword, { visibility: false, modelValue: 'secret' }));
  const hidden = await renderToString(
    h(InputPassword, { defaultVisibility: true, modelValue: 'secret' }),
  );
  assert.match(shown, /type="text"/);
  assert.match(hidden, /type="password"/);
  assert.match(shown, /value="secret"/);
  const { readFile } = await import('node:fs/promises');
  for (const name of ['list/list', 'input/input-password']) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(declaration, /ListState|InputPasswordState|node_modules/);
  }
});

test('CascaderOption artifact derives path labels and checked state through the portable option foundation', async () => {
  const { h, defineComponent, provide } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: Option } = (await import(
    new URL('../es/cascader/cascader-option.js', import.meta.url).href
  )) as typeof import('../es/cascader/cascader-option.vue.d.ts');
  const { cascaderInjectionKey } = await import('../es/cascader/context.js');
  type Info = import('../es/cascader/interface.js').CascaderOptionInfo;
  const parent: Info = {
    raw: { label: 'Parent', value: 'parent' },
    key: 'parent',
    valueKey: 'parent',
    value: 'parent',
    label: 'Parent',
    level: 0,
    index: 0,
    disabled: false,
    selectionDisabled: false,
    isLeaf: false,
    path: [],
    pathValue: ['parent'],
  };
  const option: Info = {
    raw: { label: 'Leaf', value: 'leaf' },
    key: 'parent-leaf',
    valueKey: 'leaf',
    value: 'leaf',
    label: 'Leaf',
    level: 1,
    index: 0,
    disabled: false,
    selectionDisabled: false,
    isLeaf: true,
    path: [],
    pathValue: ['parent', 'leaf'],
  };
  parent.path = [parent];
  option.path = [parent, option];
  const actions: string[] = [];
  const Wrapper = defineComponent({
    setup() {
      provide(cascaderInjectionKey, {
        onClickOption: () => actions.push('select'),
        setActiveKey: () => actions.push('active'),
        setSelectedPath: () => actions.push('path'),
        loadOption: () => actions.push('load'),
        isLoading: () => false,
        separator: ' → ',
        slots: {},
        valueMap: new Map([['parent-leaf', 'leaf']]),
        expandTrigger: 'click',
        ellipsis: false,
      });
      return () => h(Option, { option, pathLabel: true, multiple: true });
    },
  });
  const html = await renderToString(h(Wrapper));
  assert.match(html, /Parent → Leaf/);
  assert.match(html, /sd-checkbox-checked/);
  assert.deepEqual(actions, []);
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/cascader/cascader-option.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(
    declaration,
    /CascaderOptionState|CascaderOptionContext|CascaderOptionCheckedStatus|node_modules/,
  );
});

test('TagGroup normalization and Dropdown panel artifacts preserve server rendering without port leaks', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: TagGroup } = await import('../es/tag-group/index.js');
  const { default: Dropdown } = await import('../es/dropdown/index.js');
  const { default: DropdownPanel } = (await import(
    new URL('../es/dropdown/dropdown-panel.js', import.meta.url).href
  )) as typeof import('../es/dropdown/dropdown-panel.vue.d.ts');
  const tags = await renderToString(
    h(TagGroup, {
      maxCount: 1,
      options: [
        { label: 'Alpha', value: 0 },
        { label: 'Beta', value: 0 },
      ],
    }),
  );
  assert.match(tags, /Alpha/);
  assert.match(tags, /\+1/);
  const panel = await renderToString(
    h(
      DropdownPanel,
      { trigger: 'hover' },
      {
        default: () => [
          h(Dropdown.Option, { value: 0 }, () => 'Zero'),
          h(Dropdown.Option, { disabled: true }, () => 'Blocked'),
        ],
      },
    ),
  );
  assert.match(panel, /role="menu"/);
  assert.match(panel, /role="menuitem"/);
  assert.match(panel, /aria-disabled="true"/);
  assert.match(panel, /max-height:none/);
  const { readFile } = await import('node:fs/promises');
  for (const name of [
    'tag-group/tag-group',
    'dropdown/dropdown',
    'dropdown/dropdown-option',
    'dropdown/dropdown-panel',
  ]) {
    const declaration = await readFile(new URL(`../es/${name}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /TagGroupState|DropdownState|DropdownOptionState|DropdownPanelState|DropdownPanelEnvironment|node_modules/,
    );
  }
});

test('pressable, alert and selectable card artifacts preserve SSR and hide foundation ports', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: Button } = await import('../es/button/index.js');
  const { default: Link } = await import('../es/link/index.js');
  const { default: Alert } = await import('../es/alert/index.js');
  const { default: SelectableCard } = await import('../es/selectable-card/index.js');
  const events: unknown[] = [];
  const html = await renderToString(
    h('main', [
      h(
        Button,
        { href: '/target', disabled: true, onClick: (ev: MouseEvent) => events.push(ev) },
        () => '确认',
      ),
      h(Link, { loading: true, onClick: (ev: MouseEvent) => events.push(ev) }, () => 'Link'),
      h(Alert, { closable: true, onClose: (ev: Event) => events.push(ev) }, () => 'Notice'),
      h(SelectableCard, {
        label: 'Plan',
        isSelected: true,
        padding: 2,
        width: 240,
        onChange: (value: boolean) => events.push(value),
      }),
    ]),
  );
  assert.match(html, /sd-btn-disabled/);
  assert.match(html, /sd-link-loading/);
  assert.match(html, /role="alert"/);
  assert.match(html, /data-selected="true"/);
  assert.match(html, /padding:8px/);
  assert.match(html, /width:240px/);
  assert.deepEqual(events, []);
  const { readFile } = await import('node:fs/promises');
  for (const name of ['button', 'link', 'alert', 'selectable-card']) {
    const declaration = await readFile(
      new URL(`../es/${name}/${name}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(
      declaration,
      /PressableState|ButtonTextState|AlertState|SelectableCardState|node_modules/,
    );
  }
});

test('KvList preserves its utils deep entry and initializes models during SSR', async () => {
  const utils = await import('../es/kv-list/utils.js');
  const shared = await import('@sdata/web-core/kv-list/utils');
  for (const name of [
    'normalizeKvList',
    'parseBulkKvList',
    'stringifyKvList',
    'isSameKvList',
  ] as const) {
    assert.equal(utils[name], shared[name]);
  }
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: KvList } = await import('../es/kv-list/index.js');
  const events: string[] = [];
  const html = await renderToString(
    h(KvList, {
      'json': [{ key: 'a', value: 'b' }],
      'bulk': 'conflict: value',
      'onUpdate:bulk': (value: string) => events.push(value),
    }),
  );
  assert.match(html, /sd-kv-list-row/);
  assert.deepEqual(events, ['a: b']);
  const { readFile } = await import('node:fs/promises');
  const declaration = await readFile(
    new URL('../es/kv-list/kv-list.vue.d.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(declaration, /KvListState|node_modules/);
});

test('SelectDropdown, input label/search and ModelSelectorTrigger artifacts keep Vue contracts', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: InputLabel } = (await import(
    new URL('../es/_components/input-label/input-label.js', import.meta.url).href
  )) as {
    default: (typeof import('../es/_components/input-label/input-label.vue.d.ts'))['default'];
  };
  const { default: Dropdown } = (await import(
    new URL('../es/select/select-dropdown.js', import.meta.url).href
  )) as { default: (typeof import('../es/select/select-dropdown.vue.d.ts'))['default'] };
  const label = await renderToString(
    h(InputLabel, {
      modelValue: { value: 'id', label: 'Label', closable: false },
      enabledInput: true,
      formatLabel: () => 'Formatted',
    }),
  );
  assert.match(label, /placeholder="Formatted"/);
  assert.match(label, /sd-input-label-input-hidden/);
  const dropdown = await renderToString(
    h(
      Dropdown,
      { empty: true, showHeaderOnEmpty: true },
      { header: () => h('b', 'Header'), empty: () => h('i', 'Empty') },
    ),
  );
  assert.match(dropdown, /<b>Header<\/b>/);
  assert.match(dropdown, /<i>Empty<\/i>/);
  const { readFile } = await import('node:fs/promises');
  for (const path of [
    'select/select-dropdown',
    'model-selector/model-selector-trigger',
    'input/input-search',
    '_components/input-label/input-label',
  ]) {
    const declaration = await readFile(new URL(`../es/${path}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /SelectDropdownState|ModelSelectorTriggerState|InputSearchState|InputLabelState|InputLabelProps|node_modules/,
    );
  }
});

test('Markdown custom node artifacts share parser policies and preserve entity facade', async () => {
  const { h, defineComponent, provide } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { MARKSTREAM_NODE_LIFECYCLE_KEY } = await import('markstream-vue');
  const { default: Image } = (await import(
    new URL('../es/markdown-render/nodes/image.js', import.meta.url).href
  )) as { default: (typeof import('../es/markdown-render/nodes/image.vue.d.ts'))['default'] };
  const { default: Html } = (await import(
    new URL('../es/markdown-render/nodes/html.js', import.meta.url).href
  )) as { default: (typeof import('../es/markdown-render/nodes/html.vue.d.ts'))['default'] };
  const facade = await import('../es/markdown-render/nodes/html-entities.js');
  const shared = await import('@sdata/web-core/markdown/html-entities');
  assert.equal(facade.decodeHtmlEntities, shared.decodeHtmlEntities);
  assert.equal(facade.decodeHtmlEntities('&amp;lt;'), '<');
  const events: unknown[] = [];
  const component = defineComponent({
    setup() {
      provide(MARKSTREAM_NODE_LIFECYCLE_KEY, {
        markPending: (key) => events.push(['pending', key]),
        markSettled: (key) => events.push(['settled', key]),
        reportHeight: (key, height) => events.push(['height', key, height]),
      });
      return () =>
        h('main', [
          h(Image, {
            node: { type: 'image', src: 'javascript:alert(1)', alt: 'Image', title: null, raw: '' },
            fallbackSrc: '/fallback.png',
            indexKey: 0,
          }),
          h(Html, {
            node: {
              type: 'html_inline',
              content: '<p><a href="#one">One</a> <a href="#two">Two</a></p>',
            },
          }),
        ]);
    },
  });
  const html = await renderToString(h(component));
  assert.match(html, /src="\/fallback.png"/);
  assert.match(html, /sd-typography/);
  assert.doesNotMatch(html, /javascript:alert/);
  assert.deepEqual(events, [
    ['pending', 0],
    ['settled', 0],
  ]);
  const { readFile } = await import('node:fs/promises');
  for (const file of ['image', 'html']) {
    const declaration = await readFile(
      new URL(`../es/markdown-render/nodes/${file}.vue.d.ts`, import.meta.url),
      'utf8',
    );
    assert.doesNotMatch(
      declaration,
      /MarkdownImageState|MarkdownHtmlState|MarkdownImageLifecycle|node_modules/,
    );
  }
});

test('Pagination item and TreeSelect panel artifacts keep private foundations out of Vue props', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { default: Pager } = (await import(
    new URL('../es/pagination/page-item.js', import.meta.url).href
  )) as { default: (typeof import('../es/pagination/page-item.vue.d.ts'))['default'] };
  const { default: Step } = (await import(
    new URL('../es/pagination/page-item-step.js', import.meta.url).href
  )) as { default: (typeof import('../es/pagination/page-item-step.vue.d.ts'))['default'] };
  const { default: Panel } = (await import(
    new URL('../es/tree-select/panel.js', import.meta.url).href
  )) as { default: (typeof import('../es/tree-select/panel.vue.d.ts'))['default'] };
  const html = await renderToString(
    h('main', [
      h(Pager, { current: 3, pageNumber: 3 }),
      h(Step, { current: 1, pages: 5, type: 'previous' }),
      h(Panel, {
        treeProps: { data: [{ key: 0, title: 'Zero' }], checkable: true },
        showCheckable: true,
        selectedKeys: [0],
      }),
    ]),
  );
  assert.match(html, /aria-current="page"/);
  assert.match(html, /sd-pagination-item-disabled/);
  assert.match(html, /sd-checkbox-checked/);
  const { readFile } = await import('node:fs/promises');
  for (const file of [
    'pagination/page-item',
    'pagination/page-item-step',
    'pagination/page-item-ellipsis',
    'pagination/page-options',
    'tree-select/panel',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /PagerState|PagerTargetState|PageOptionsState|TreeSelectPanelState|node_modules/,
    );
  }
});

test('Grid column and Space artifacts retain portable sizing and Vue slot contracts', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { Row, Col, Space } = await import('../es/index.js');
  const html = await renderToString(
    h(Row, { gutter: [16, 8] }, () =>
      h(Col, { flex: '120px' }, () =>
        h(Space, { size: ['mini', 'large'] }, () => [h('b', 'First'), h('i', 'Second')]),
      ),
    ),
  );
  assert.match(html, /flex:0 0 120px/);
  assert.match(html, /padding-left:8px/);
  assert.match(html, /column-gap:4px;row-gap:24px/);
  assert.match(html, /sd-space-item/);
  const { readFile } = await import('node:fs/promises');
  for (const file of ['grid/grid-col', 'space/space']) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(declaration, /GridColumnProps|GridColumnContext|SpaceState|node_modules/);
  }
});

test('Table cell and Breadcrumb artifacts preserve selection, slots and public declarations', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { Table, Breadcrumb } = await import('../es/index.js');
  const html = await renderToString(
    h('main', [
      h(Table, {
        data: [{ key: 0, name: 'Zero', isLeaf: true }],
        columns: [{ dataIndex: 'name' }],
        selectedKeys: [0],
        rowSelection: { type: 'checkbox' },
        pagination: false,
      }),
      h(Breadcrumb, {
        routes: [
          { path: '/a', label: 'A' },
          { path: '/b', label: 'B' },
        ],
      }),
    ]),
  );
  assert.match(html, /sd-checkbox-checked/);
  assert.match(html, /href="#\/a"/);
  assert.match(html, />B<\/span>/);
  const { readFile } = await import('node:fs/promises');
  for (const file of [
    'table/table-td',
    'table/table-operation-th',
    'table/table-operation-td',
    'breadcrumb/breadcrumb',
    'breadcrumb/breadcrumb-item',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /TableCellLoadingState|TableSelectionContext|TableOperationCachedState|BreadcrumbContext|node_modules/,
    );
  }
});

test('Date header and activation artifacts preserve labels, native roles and Vue declarations', async () => {
  assert.equal(
    (await import('../es/_utils/keyboard.js')).onActivate,
    (await import('@sdata/web-core/_utils/keyboard')).onActivate,
  );
  const { h, defineComponent, provide } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { dayjs } = await import('../es/_utils/date.js');
  const { PageHeader } = await import('../es/index.js');
  const { default: Header } = (await import(
    new URL('../es/date-picker/panels/header.js', import.meta.url).href
  )) as { default: (typeof import('../es/date-picker/panels/header.vue.d.ts'))['default'] };
  const html = await renderToString(
    h('main', [
      h(Header, {
        prefixCls: 'sd-datepicker',
        title: 'Fallback',
        mode: 'date',
        value: dayjs('2025-07-08'),
        onLabelClick() {},
      }),
      h(PageHeader, { title: 'Page' }),
    ]),
  );
  assert.match(html, />2025<\/span>/);
  assert.match(html, />07<\/span>/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  const { uploadInjectionKey } = await import('../es/upload/context.js');
  const { default: Picture } = (await import(
    new URL('../es/upload/upload-picture-item.js', import.meta.url).href
  )) as { default: (typeof import('../es/upload/upload-picture-item.vue.d.ts'))['default'] };
  const pictureHost = (override: boolean) =>
    defineComponent({
      setup() {
        provide(uploadInjectionKey, {
          slots: {},
          iconCls: 'sd-upload-icon',
          showRemoveButton: true,
          onRemove() {},
          onAbort() {},
          onUpload() {},
          onPreview() {},
        });
        return () =>
          h(
            Picture,
            { file: { uid: 'ssr', name: 'image.png', status: 'done' } },
            override
              ? { default: () => h('b', { 'data-parent-action': '' }, 'Parent action') }
              : {},
          );
      },
    });
  assert.match(await renderToString(h(pictureHost(false))), /sd-icon-delete/);
  const overridden = await renderToString(h(pictureHost(true)));
  assert.match(overridden, /data-parent-action/);
  assert.doesNotMatch(overridden, /sd-icon-delete/);
  const { readFile } = await import('node:fs/promises');
  for (const file of [
    'date-picker/panels/header',
    'page-header/page-header',
    'carousel/carousel-arrow',
    'upload/upload-progress',
    'upload/upload-picture-item',
  ]) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      declaration,
      /DatePanelHeaderLabelState|createDatePanelHeaderLabels|node_modules/,
    );
  }
});

test('Tooltip and Popover wrapper artifacts preserve controlled fallback SSR and public types', async () => {
  const { h } = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const { Tooltip, Popover } = await import('../es/index.js');
  for (const component of [Tooltip, Popover]) {
    const html = await renderToString(
      h(
        component,
        { popupVisible: false, defaultPopupVisible: true, content: 'Hidden content' },
        () => h('button', 'Target'),
      ),
    );
    assert.match(html, /Target/);
    assert.doesNotMatch(html, /Hidden content/);
  }
  const { readFile } = await import('node:fs/promises');
  for (const file of ['tooltip/tooltip', 'popover/popover']) {
    const declaration = await readFile(new URL(`../es/${file}.vue.d.ts`, import.meta.url), 'utf8');
    assert.doesNotMatch(declaration, /PopupWrapperState|createPopupWrapperFoundation|node_modules/);
  }
});

test('FilePreviewer legacy PDF hook remains inert on the server with its existing return contract', async () => {
  const { usePdfJs } = await import('../es/file-previewer/use-pdf-js.js');
  const statuses: string[] = [];
  const pdf = usePdfJs({
    src: () => '',
    pdfProps: () => undefined,
    onStatus: (status) => statuses.push(status),
  });
  await pdf.load();
  pdf.goto(3);
  assert.equal(pdf.doc.value, null);
  assert.equal(pdf.numPages.value, 0);
  assert.equal(pdf.page.value, 1);
  assert.deepEqual(statuses, []);
  await pdf.destroy();
});

test('Clamp views consume portable controllers while retaining their installed component and declaration entries', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const vue = await import('../es/index.js');
  const core = await import('@sdata/web-core');
  for (const [kind, name, factory, factoryName] of [
    [
      'inline',
      'InlineClamp',
      core.clampInline.createInlineClampFoundation,
      'createInlineClampFoundation',
    ],
    ['line', 'LineClamp', core.clampLine.createLineClampFoundation, 'createLineClampFoundation'],
    [
      'rich-line',
      'RichLineClamp',
      core.clampRichLine.createRichLineClampFoundation,
      'createRichLineClampFoundation',
    ],
    ['wrap', 'WrapClamp', core.clampWrap.createWrapClampFoundation, 'createWrapClampFoundation'],
  ] as const) {
    const shared = await import(`@sdata/web-core/clamp/${kind}/foundation`);
    assert.equal(factory, shared[factoryName]);
    assert.equal(vue[name], (await import(`../es/clamp/${kind}/${name}.js`)).default);
    const folder = new URL(`../es/clamp/${kind}/`, import.meta.url);
    const scripts = (await readdir(folder)).filter((file) => file.endsWith('.js'));
    const code = (
      await Promise.all(scripts.map((file) => readFile(new URL(file, folder), 'utf8')))
    ).join('\n');
    assert.match(code, new RegExp(`@sdata/web-core/clamp/${kind}/foundation`));
    const declaration = await readFile(new URL(`${name}.vue.d.ts`, folder), 'utf8');
    assert.doesNotMatch(
      declaration,
      /FoundationOptions|create(?:Inline|Line|RichLine|Wrap)ClampFoundation|node_modules/,
    );
  }
});

test('root Table/Tree/TreeSelect/Upload views retain their entries while consuming shared interaction rules', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const vue = await import('../es/index.js');
  const core = await import('@sdata/web-core');
  for (const [module, shared, member] of [
    ['tree/drag', core.treeDrag, 'createTreeDragFoundation'],
    ['tree-select/interaction', core.treeSelectInteraction, 'createTreeSelectInteraction'],
    ['tree-select/presentation', core.treeSelectPresentation, 'getTreeSelectViewValues'],
    ['table/interaction', core.tableInteraction, 'createTableChangeFoundation'],
    ['table/drag', core.tableDrag, 'createTableDragFoundation'],
    ['upload/files', core.uploadFiles, 'previewUploadFile'],
  ] as const) {
    assert.equal(Reflect.get(shared, member), (await import(`@sdata/web-core/${module}`))[member]);
  }
  for (const [kind, name, module] of [
    ['table', 'Table', 'table/interaction'],
    ['tree', 'Tree', 'tree/drag'],
    ['tree-select', 'TreeSelect', 'tree-select/interaction'],
    ['upload', 'Upload', 'upload/files'],
  ] as const) {
    const folder = new URL(`../es/${kind}/`, import.meta.url);
    assert.equal(vue[name], (await import(new URL(`${kind}.js`, folder).href)).default);
    const files = (await readdir(folder)).filter((file) => file.endsWith('.js'));
    const code = (
      await Promise.all(files.map((file) => readFile(new URL(file, folder), 'utf8')))
    ).join('\n');
    assert.match(code, new RegExp(`@sdata/web-core/${module}`));
    const declaration = await readFile(new URL(`${kind}.vue.d.ts`, folder), 'utf8');
    assert.doesNotMatch(
      declaration,
      /TreeDragAdapter|TreeSelectInteractionState|TableChangeState|TableDragState|node_modules/,
    );
  }
});
