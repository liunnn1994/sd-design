const camel = (value: string) =>
  value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
const pascal = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const models: Record<string, string> = {
  Checkbox: 'modelValue',
  Radio: 'modelValue',
  BloomMenu: 'modelValue',
  Collapse: 'activeKey',
  Tabs: 'activeKey',
  Pagination: 'current',
  Carousel: 'current',
  JsonForm: 'model',
};
const slotProps: Record<string, string> = {
  'InputTag.tag': 'renderTag',
  'TreeSelect.tag': 'renderTag',
  'TreeSelect.tree-slot-extra': 'treeProps.renderExtra',
  'TreeSelect.tree-slot-title': 'treeProps.renderTitle',
  'TreeSelect.tree-slot-icon': 'treeProps.renderIcon',
  'TreeSelect.tree-slot-switcher-icon': 'treeProps.renderSwitcherIcon',
  'ConfigProvider.loading': 'renderLoading',
  'Calendar.week-number-cell': 'renderWeekNumber',
  'TagGroup.label': 'renderItem',
  'Upload.upload-item': 'renderItem',
  'Upload.extra-button': 'renderExtraButton',
  'Upload.image': 'renderImage',
  'Upload.file-name': 'renderFileName',
  'Upload.file-icon': 'customIcon.fileIcon',
  'Upload.remove-icon': 'customIcon.removeIcon',
  'Upload.preview-icon': 'customIcon.previewIcon',
  'Upload.start-icon': 'customIcon.startIcon',
  'Upload.cancel-icon': 'customIcon.cancelIcon',
  'Upload.retry-icon': 'customIcon.retryIcon',
  'Upload.success-icon': 'customIcon.successIcon',
  'Upload.error-icon': 'customIcon.errorIcon',
  'TableColumn.filter-icon': 'slots.filter-icon',
  'TableColumn.filter-content': 'slots.filter-content',
  'Button.tooltip': 'tooltipContent',
  'Button.ellipsis-tooltip': 'ellipsisTooltipContent',
  'Link.tooltip': 'tooltipContent',
  'Tag.tooltip': 'tooltipContent',
  'Ellipsis.tooltip': 'tooltipContent',
  'Switch.checked': 'checkedText',
  'Switch.unchecked': 'uncheckedText',
  'Radio.radio': 'renderRadio',
  'RadioGroup.radio': 'renderRadio',
  'RadioGroup.label': 'renderLabel',
  'Checkbox.checkbox': 'renderCheckbox',
  'CheckboxGroup.checkbox': 'renderCheckbox',
  'CheckboxGroup.label': 'renderLabel',
  'Select.label': 'renderLabel',
  'Select.option': 'renderOption',
  'Select.tag': 'renderTag',
  'Select.trigger': 'renderTrigger',
  'Cascader.option': 'renderOption',
  'Cascader.tag': 'renderTag',
  'Cascader.label': 'renderLabel',
  'Cascader.trigger': 'renderTrigger',
  'TreeSelect.trigger': 'renderTrigger',
  'TreeSelect.label': 'renderLabel',
  'AutoComplete.option': 'renderOption',
  'Mention.option': 'renderOption',
  'Tree.title': 'renderTitle',
  'Tree.icon': 'renderIcon',
  'Tree.extra': 'renderExtra',
  'Tree.switcher-icon': 'renderSwitcherIcon',
  'Tree.loading-icon': 'renderLoadingIcon',
  'Tree.drag-icon': 'renderDragIcon',
  'FilePreviewer.title': 'renderTitle',
  'FilePreviewer.content': 'renderContent',
  'FilePreviewer.pdf': 'renderPdf',
  'FilePreviewer.image': 'renderImage',
  'FilePreviewer.video': 'renderVideo',
  'FilePreviewer.audio': 'renderAudio',
  'DatePicker.cell': 'renderCell',
  'DatePicker.date': 'renderCell',
  'DatePicker.panelRender': 'renderPanel',
  'DatePicker.panel-render': 'renderPanel',
  'DatePicker.trigger': 'renderTrigger',
  'DatePicker.icon-next-double': 'headerIcons.nextDouble',
  'DatePicker.icon-prev-double': 'headerIcons.prevDouble',
  'DatePicker.icon-next': 'headerIcons.next',
  'DatePicker.icon-prev': 'headerIcons.prev',
  'RangePicker.cell': 'renderCell',
  'RangePicker.date': 'renderCell',
  'RangePicker.panelRender': 'renderPanel',
  'RangePicker.panel-render': 'renderPanel',
  'RangePicker.trigger': 'renderTrigger',
  'TimePicker.trigger': 'renderTrigger',
  'ColorPicker.trigger': 'renderTrigger',
  'Descriptions.label': 'renderLabel',
  'Descriptions.value': 'renderValue',
  'List.item': 'renderItem',
  'Rate.character': 'renderCharacter',
  'TagGroup.item': 'renderItem',
  'TagGroup.counter': 'renderCounter',
  'WrapClamp.item': 'renderItem',
  'ConfigProvider.empty': 'renderEmpty',
  'InputSearch.button-default': 'buttonText',
  'InputSearch.buttonDefault': 'buttonText',
  'NumberFlow.prefix': 'prefixContent',
  'NumberFlow.suffix': 'suffixContent',
  'KvList.key': 'renderKey',
  'KvList.value': 'renderValue',
  'KvList.row-actions': 'renderRowActions',
  'BloomMenu.trigger': 'renderTrigger',
  'BloomMenu.header': 'renderHeader',
  'BloomMenu.icon': 'renderIcon',
  'BloomMenu.item': 'renderItem',
  'Pagination.total': 'renderTotal',
  'Pagination.page-item': 'renderPageItem',
  'Pagination.page-item-step': 'renderPageItemStep',
  'Tour.title': 'renderTitle',
  'Tour.description': 'renderDescription',
  'Tour.progress': 'renderProgress',
  'Tour.footer': 'renderFooter',
  'Transfer.item': 'renderItem',
  'Transfer.source': 'renderSource',
  'Transfer.target': 'renderTarget',
  'Transfer.source-title': 'renderSourceTitle',
  'Transfer.target-title': 'renderTargetTitle',
  'QrCode.icon': 'iconContent',
  'QrCode.status': 'renderStatus',
  'RegexVis.empty': 'renderEmpty',
  'RegexVis.error': 'renderError',
  'RegexVis.footer': 'renderFooter',
  'Table.default': 'renderContent',
  'Table.columns': 'children',
  'Table.tr': 'renderTr',
  'Table.td': 'renderTd',
  'Table.th': 'renderTh',
  'Table.thead': 'renderThead',
  'Table.tbody': 'renderTbody',
  'Table.append': 'footer',
  'Table.expand-row': 'renderExpandRow',
  'Table.expand-icon': 'renderExpandIcon',
  'Table.summary-cell': 'renderSummaryCell',
  'TableColumn.cell': 'render',
  'TableColumn.title': 'slots.title',
};
const bags = new Set([
  'Sender',
  'SenderSwitch',
  'SenderSkill',
  'RichTextEditor',
  'JsonForm',
  'BasicCrudTable',
]);

export function componentName(value: string) {
  return pascal(value.replace(/^sd-/, ''));
}
export function reactPropName(component: string, value: string): string {
  if (value === 'v-model') return models[component] ?? 'value';
  if (value.startsWith('v-model:')) return reactPropName(component, value.slice(8));
  let name = camel(value);
  if (name === 'modelValue') name = models[component] ?? 'value';
  if (name === 'class') return 'className';
  if (name === 'autofocus') return 'autoFocus';
  if (name === 'tabindex') return 'tabIndex';
  if (name === 'checked' && ['Switch', 'Checkbox'].includes(component))
    return component === 'Switch' ? 'value' : 'modelValue';
  return name;
}
export function reactEventName(component: string, value: string) {
  if (component === 'Scrollbar' && ['initialized', 'updated', 'destroyed'].includes(value))
    return `events.${value}`;
  const special: Record<string, string> = {
    'keydown': 'onKeyDown',
    'keyup': 'onKeyUp',
    'mouseover': 'onMouseOver',
    'mouseout': 'onMouseOut',
    'animationsstart': 'onAnimationsStart',
    'animationsfinish': 'onAnimationsFinish',
    'selection:change': 'onSelectionChange',
    'image:transform': 'onImageTransform',
    'canvas:action': 'onCanvasAction',
    'canvas:actionstart': 'onCanvasActionStart',
    'canvas:actionmove': 'onCanvasActionMove',
    'canvas:actionend': 'onCanvasActionEnd',
  };
  if (special[value]) return special[value]!;
  if (value.startsWith('update:')) {
    const prop = reactPropName(component, value.slice(7));
    if (component === 'Calendar') return `onUpdate${pascal(prop)}`;
    if (component === 'Switch' && prop === 'value') return 'onChange';
    if (component === 'BloomMenu' && prop === 'modelValue') return 'onModelValueChange';
    if (prop === 'value' || prop === 'modelValue') return 'onValueChange';
    if (component === 'Pagination' && prop === 'pageSize') return 'onPageSizeValueChange';
    return `on${pascal(prop)}Change`;
  }
  return `on${pascal(value)}`;
}
export function reactSlotName(component: string, value: string) {
  if (bags.has(component)) return `slots.${value}`;
  if (
    component === 'Toolbar' &&
    !['extra', 'action-prepend', 'action-append', 'expand-icon', 'default'].includes(value)
  )
    return `slots.${value}`;
  const mapped = slotProps[`${component}.${value}`];
  if (mapped) return mapped;
  if (component === 'Calendar') {
    if (value.startsWith('title.')) return `renderViewTitle.${value.slice(6)}`;
    if (value.startsWith('event.')) return `renderViewEvent.${value.slice(6)}`;
    return ['previous-button', 'next-button', 'all-day-label'].includes(value)
      ? camel(value)
      : `render${pascal(value)}`;
  }
  return value === 'default' ? 'children' : camel(value);
}
