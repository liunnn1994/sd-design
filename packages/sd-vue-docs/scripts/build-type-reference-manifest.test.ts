import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';

import { buildTypeReferenceManifest } from './build-type-reference-manifest.ts';

test('public Vue type references follow shared foundation re-exports', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'InputMaskProps',
    'InputMaskPattern',
    'InputMaskSelection',
    'InputMaskBeforeChange',
    'InputMaskPresetName',
  ]) {
    const entry = manifest.types[name];
    assert.ok(entry, `${name} missing from online editor type references`);
    assert.equal(entry.modulePath, 'packages/web-core/src/input-mask/types.ts');
    assert.match(entry.code, new RegExp(`export (?:type|interface) ${name}\\b`));
  }
});

test('Form public rules and validation results remain visible after foundation extraction', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'FieldRule',
    'ValidatedError',
    'ValidateStatus',
    'ValidateTrigger',
    'FormItemEventHandler',
  ]) {
    const entry = manifest.types[name];
    assert.ok(entry, `${name} missing from public type references`);
    assert.equal(entry.modulePath, 'packages/web-core/src/form/types.ts');
    assert.match(entry.code, new RegExp(`export (?:type|interface) ${name}\\b`));
  }
});

test('Tree and TreeSelect domain contracts resolve through their existing Vue exports', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const [name, modulePath] of [
    ['TreeFieldNames', 'packages/web-core/src/tree/types.ts'],
    ['LabelValue', 'packages/web-core/src/tree-select/types.ts'],
    ['TreeSelectValue', 'packages/web-core/src/tree-select/types.ts'],
  ]) {
    const entry = manifest.types[name];
    assert.ok(entry, `${name} missing from public type references`);
    assert.equal(entry.modulePath, modulePath);
    assert.match(entry.code, new RegExp(`export (?:type|interface) ${name}\\b`));
  }
});

test('Select and Cascader values and options remain available through public Vue type references', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const [name, modulePath] of [
    ['SelectOptionData', 'packages/web-core/src/select/types.ts'],
    ['SelectFieldNames', 'packages/web-core/src/select/types.ts'],
    ['CascaderModelValue', 'packages/web-core/src/cascader/types.ts'],
    ['CascaderPathValue', 'packages/web-core/src/cascader/types.ts'],
  ]) {
    assert.ok(manifest.types[name], `${name} missing from public type references`);
    assert.equal(manifest.types[name].modulePath, modulePath);
  }
});

test('TimePicker value type remains visible through the existing Vue public entry', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.ok(manifest.types.TimeValue, 'TimeValue missing from public type references');
  assert.equal(manifest.types.TimeValue.modulePath, 'packages/web-core/src/time-picker/types.ts');
});

test('DatePicker values and disabled callbacks remain available through public Vue type references', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'CalendarValue',
    'ValueFormat',
    'DisabledDate',
    'DisabledTime',
    'RangeDisabledDate',
    'RangeDisabledTime',
    'DisabledTimeProps',
  ]) {
    assert.ok(manifest.types[name], `${name} missing from public type references`);
    assert.equal(manifest.types[name].modulePath, 'packages/web-core/src/date-picker/types.ts');
  }
});

test('Upload file and request contracts resolve through existing public Vue types', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of ['FileItem', 'FileStatus', 'RequestOption', 'UploadRequest']) {
    assert.ok(manifest.types[name], `${name} missing from public type references`);
    assert.equal(manifest.types[name].modulePath, 'packages/web-core/src/upload/types.ts');
  }
  assert.equal(
    manifest.types.CustomIcon.modulePath,
    'packages/web-vue/components/upload/interfaces.ts',
  );
});

test('RichTextEditor engine types follow core while Vue render contracts retain their source', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'RichTextEditorValue',
    'RichTextEditorComponentNodeData',
    'RichTextEditorConfig',
    'RichTextEditorRef',
    'RichTextEditorInputNodeData',
    'RichTextEditorPlugin',
  ]) {
    assert.ok(manifest.types[name], `${name} missing from public type references`);
    assert.equal(
      manifest.types[name].modulePath,
      'packages/web-core/src/rich-text-editor/types.ts',
    );
  }
  assert.equal(
    manifest.types.RichTextEditorProps.modulePath,
    'packages/web-vue/components/rich-text-editor/types.ts',
  );
  assert.equal(
    manifest.types.RichTextEditorSlots.modulePath,
    'packages/web-vue/components/rich-text-editor/types.ts',
  );
});
test('JsonForm data contracts follow core while component schemas retain Vue types', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'JsonFormModel',
    'JsonFormAdapter',
    'JsonFormA2UI_0_9_1ComponentNode',
    'JsonFormA2UI_0_9_1ChoiceOption',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/json-form/types.ts');
  }
  for (const name of [
    'JsonFormSchema',
    'JsonFormComponentProps',
    'JsonFormComponentSlotRenderer',
  ]) {
    assert.equal(
      manifest.types[name]?.modulePath,
      'packages/web-vue/components/json-form/types.ts',
    );
  }
});
test('Transfer item data follows core through the existing public Vue export', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(manifest.types.TransferItem?.modulePath, 'packages/web-core/src/transfer/types.ts');
});
test('Radio value data follows core while choice labels retain Vue render contracts', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(manifest.types.RadioValue?.modulePath, 'packages/web-core/src/radio/types.ts');
  assert.equal(
    manifest.types.SwitchValue?.modulePath,
    'packages/web-core/src/switch/foundation.ts',
  );
  assert.equal(
    manifest.types.SwitchBeforeChange?.modulePath,
    'packages/web-core/src/switch/foundation.ts',
  );
  assert.equal(
    manifest.types.RadioOption?.modulePath,
    'packages/web-vue/components/radio/interface.ts',
  );
  assert.equal(
    manifest.types.CheckboxOption?.modulePath,
    'packages/web-vue/components/checkbox/interface.ts',
  );
});
test('Slider value and callback contracts resolve through the legacy public Vue entry', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of ['SliderValue', 'SliderFormatTooltip', 'SliderChangeHandler']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/slider/types.ts');
  }
});
test('InputNumber public data and handler types resolve through the preserved Vue export', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'InputNumberValue',
    'InputNumberFormatter',
    'InputNumberParser',
    'InputNumberChangeHandler',
    'InputNumberInputHandler',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/input-number/types.ts');
  }
});

test('Trigger translation data follows core while framework positioning props remain Vue-owned', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(
    manifest.types.TriggerPopupTranslate?.modulePath,
    'packages/web-core/src/trigger/position.ts',
  );
  assert.equal(
    manifest.types.TriggerProps?.modulePath,
    'packages/web-vue/components/trigger/interface.ts',
  );
  assert.equal(
    manifest.types.FloatingOptions?.modulePath,
    'packages/web-vue/components/_utils/floating.ts',
  );
});

test('Menu data and callbacks follow core while rendering props keep Vue ownership', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'MenuData',
    'MenuDataItem',
    'MenuMode',
    'MenuTheme',
    'MenuCollapseTrigger',
    'MenuCollapseHandler',
    'MenuItemClickHandler',
    'MenuSubMenuClickHandler',
    'MenuOpenKeys',
    'MenuSelectedKeys',
    'PopupMenuMaxHeightType',
    'SubMenuChildDataType',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/menu/types.ts');
  }
  for (const name of ['MenuProps', 'SubMenuProps']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-vue/components/menu/interface.ts');
  }
});

test('Tabs scalar options resolve through existing public exports', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of ['TabsPosition', 'TabsType', 'TabTriggerEvent', 'ScrollPosition']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/tabs/types.ts');
  }
});

test('Carousel options remain public and follow their shared type definitions', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'CarouselAutoPlayConfig',
    'CarouselArrowType',
    'CarouselIndicatorPosition',
    'CarouselIndicatorType',
    'CarouselTriggerEvent',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/carousel/types.ts');
  }
});

test('Tour native aliases and slot scope remain public through the core type entry', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'TourProps',
    'TourConfig',
    'TourController',
    'TourExpose',
    'TourStep',
    'TourPopoverDom',
    'TourSlotProps',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/tour/types.ts');
  }
});

test('InputTag public TagProps specialization stays in Vue after sharing generic data', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(
    manifest.types.TagData?.modulePath,
    'packages/web-vue/components/input-tag/interface.ts',
  );
  assert.match(manifest.types.TagData?.code ?? '', /CoreTagData<TagProps>/);
  assert.equal(
    manifest.types.InputTagFieldNames?.modulePath,
    'packages/web-vue/components/input-tag/interface.ts',
  );
});

test('AutoComplete public data and handler aliases follow their shared definitions', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'AutoCompleteData',
    'AutoCompleteFilterOption',
    'AutoCompleteChangeHandler',
    'AutoCompleteSearchHandler',
    'AutoCompleteSelectHandler',
    'AutoCompleteClearHandler',
    'AutoCompleteDropdownScrollHandler',
    'AutoCompleteDropdownReachBottomHandler',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/auto-complete/types.ts');
  }
});

test('Steps and Timeline public scalar types follow core while component props stay in Vue', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of ['StepData', 'StepStatus', 'StepsType', 'StepsChangeHandler']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/steps/types.ts');
  }
  for (const name of ['ModeType', 'LabelPositionType', 'DotType', 'LineType', 'PositionType']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/timeline/types.ts');
  }
});

test('NumberFlow pure contracts follow core while exposed element and style remain Vue contracts', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'NumberFlowValue',
    'NumberFlowFormat',
    'NumberFlowTrend',
    'NumberFlowDigitOptions',
    'NumberFlowDigits',
    'NumberFlowDigitContext',
    'NumberFlowPluginContext',
    'NumberFlowPlugin',
    'NumberFlowProps',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/number-flow/types.ts');
  }
  for (const name of ['NumberFlowExposed', 'NumberFlowStyle']) {
    assert.equal(
      manifest.types[name]?.modulePath,
      'packages/web-vue/components/number-flow/types.ts',
    );
  }
});

test('Watermark font follows core while component props remain Vue-derived', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(
    manifest.types.WatermarkFont?.modulePath,
    'packages/web-core/src/watermark/types.ts',
  );
  assert.equal(
    manifest.types.WatermarkProps?.modulePath,
    'packages/web-vue/components/watermark/index.ts',
  );
});

test('Cropper scalar options follow core while the public native exposure stays in Vue', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'CropperCanvasProps',
    'CropperImageProps',
    'CropperSelectionProps',
    'CropperSelectionChangeDetail',
    'CropperImageTransformDetail',
    'CropperProps',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/cropper/types.ts');
  }
  assert.equal(
    manifest.types.CropperExpose?.modulePath,
    'packages/web-vue/components/cropper/interface.ts',
  );
});

test('Scrollbar SDK options follow core while the recursive Vue StyleValue specialization stays public', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'ScrollbarType',
    'ScrollbarOptions',
    'ScrollbarOptionsResolved',
    'ScrollbarReadonlyOptions',
    'ScrollbarEventListeners',
    'ScrollbarEventListenerArgs',
    'ScrollbarEventListener',
    'ScrollbarUpdatedEvent',
    'ScrollbarElements',
    'ScrollbarState',
    'ScrollbarPlugin',
    'ScrollbarExpose',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/scrollbar/types.ts');
  }
  assert.equal(
    manifest.types.ScrollbarProps?.modulePath,
    'packages/web-vue/components/scrollbar/interface.ts',
  );
  assert.match(manifest.types.ScrollbarProps?.code ?? '', /CoreScrollbarProps<StyleValue>/);
});

test('QrCode keeps its encoding/status types deep-only and instance at the Vue root', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'QrCodeType',
    'QrCodeErrorLevel',
    'QrCodeStatusType',
    'QrCodeInactiveStatus',
    'QrCodeIconSize',
    'QrCodeValue',
    'QrCodeStatusRenderInfo',
    'QrCodeStatusProps',
  ]) {
    assert.equal(manifest.types[name], undefined);
  }
  assert.equal(
    manifest.types.QrCodeInstance?.modulePath,
    'packages/web-vue/components/qr-code/index.ts',
  );
});

test('PanelGroup scalar contracts follow core while CSSProperties fold poses stay in Vue', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of ['PanelSize', 'PanelTransition', 'PanelSlotProps']) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/panel-group/types.ts');
  }
  for (const name of ['PanelPose', 'PanelFold']) {
    assert.equal(
      manifest.types[name]?.modulePath,
      'packages/web-vue/components/panel-group/types.ts',
    );
  }
});

test('Calendar keeps domain contracts at deep entries and the root instance at the Vue adapter', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'CalendarEvent',
    'CalendarEventInput',
    'CalendarRange',
    'CalendarTexts',
    'CalendarSchedule',
    'SpecialHoursInput',
  ]) {
    assert.equal(manifest.types[name], undefined);
  }
  assert.equal(
    manifest.types.CalendarInstance?.modulePath,
    'packages/web-vue/components/calendar/index.ts',
  );
});

test('Grid responsive values follow core through the existing Vue public export', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  assert.equal(
    manifest.types.ResponsiveValue?.modulePath,
    'packages/web-core/src/_utils/responsive.ts',
  );
  assert.equal(
    manifest.types.ColProps?.modulePath,
    'packages/web-vue/components/grid/interface.ts',
  );
});

test('Sender portable slot/action types follow core while render and component contracts stay in Vue', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'SenderSubmitType',
    'SenderInsertPosition',
    'SenderActionContext',
    'SenderFocusOptions',
    'SenderTextSlotConfig',
    'SenderInputSlotConfig',
    'SenderSelectSlotConfig',
    'SenderTagSlotConfig',
    'SenderContentSlotConfig',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/sender/types.ts');
  }
  assert.equal(
    manifest.types.SenderAllowSpeech?.modulePath,
    'packages/web-core/src/sender/recorder.ts',
  );
  for (const name of [
    'SenderCustomSlotRender',
    'SenderCustomSlotConfig',
    'SenderSlotConfig',
    'SenderSkill',
    'SenderProps',
    'SenderRef',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-vue/components/sender/types.ts');
  }
});

test('FilePreviewer shared data and PDF types follow core while Image view contracts stay in Vue', async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
  const manifest = await buildTypeReferenceManifest({
    workspaceRoot,
    webVueRoot: path.join(workspaceRoot, 'packages/web-vue'),
  });
  for (const name of [
    'FilePreviewerType',
    'FilePreviewerStatus',
    'FilePreviewerMediaSkin',
    'FilePreviewerMediaProps',
    'FilePreviewerPdfRotation',
    'FilePreviewerPdfProps',
    'FilePreviewerContentSlotProps',
    'FilePreviewerPdfSlotProps',
    'FilePreviewerMediaSlotProps',
  ]) {
    assert.equal(manifest.types[name]?.modulePath, 'packages/web-core/src/file-previewer/types.ts');
  }
  for (const name of [
    'FilePreviewerImageProps',
    'FilePreviewerImageSlotProps',
    'FilePreviewerProps',
  ]) {
    assert.equal(
      manifest.types[name]?.modulePath,
      'packages/web-vue/components/file-previewer/types.ts',
    );
  }
});
