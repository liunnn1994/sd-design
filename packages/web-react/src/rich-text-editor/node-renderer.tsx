import type { JsonValue } from 'type-fest';

import { shouldStretchJsonFormControl } from '@sdata/web-core/json-form/schema';

import type { RichTextEditorNodeRenderContext } from './types.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { resolveJsonFormComponents, jsonFormBuiltInComponents } from '../json-form/components.js';
import { Tag } from '../tag/index.js';

const fitWidthNames = new Set([
  'autoComplete',
  'cascader',
  'datePicker',
  'input',
  'inputMask',
  'inputNumber',
  'inputPassword',
  'inputSearch',
  'inputTag',
  'mention',
  'rangePicker',
  'select',
  'textarea',
  'timePicker',
  'treeSelect',
]);
export function RichTextNodeRenderer({
  node,
  disabled,
  readonly,
  update,
  remove,
}: RichTextEditorNodeRenderContext) {
  const config = useConfig();
  const prefix = usePrefix('rich-text-editor');
  const components = resolveJsonFormComponents(config.jsonForm?.components);
  const label = node.props?.label ?? node.textValue ?? node.value;
  const componentLabel =
    typeof label === 'string' || typeof label === 'number' ? String(label) : '';
  const {
    class: nodeClass,
    className,
    disabled: _disabled,
    readonly: _readonly,
    ...props
  } = node.props ?? {};
  const classes = [
    typeof nodeClass === 'string' && nodeClass,
    typeof className === 'string' && className,
  ]
    .filter(Boolean)
    .join(' ');
  const fallback = <span className={`${prefix}-component-fallback`}>{node.textValue}</span>;
  if (node.name === 'tag') {
    const { label: _label, ...tagProps } = props;
    return (
      <Tag
        {...tagProps}
        className={[`${prefix}-component-control`, `${prefix}-component-tag`, classes]
          .filter(Boolean)
          .join(' ')}
        closable={Boolean(node.props?.closable) && !disabled && !readonly}
        onClose={remove}
      >
        {label !== null && typeof label === 'object'
          ? JSON.stringify(label, null, 2)
          : String(label ?? '')}
      </Tag>
    );
  }
  if (node.name === 'noFormItem')
    return (
      <span
        className={`${prefix}-component-control ${prefix}-component-noFormItem ${prefix}-component-fallback`}
      >
        {fallback}
      </span>
    );
  const Component = Object.hasOwn(components, node.name) ? components[node.name] : undefined;
  if (!Component) return fallback;
  const supportsFit =
    fitWidthNames.has(node.name) &&
    Component === jsonFormBuiltInComponents[node.name as keyof typeof jsonFormBuiltInComponents];
  const fitWidth = supportsFit && props.fitWidth !== false;
  const stretch = (shouldStretchJsonFormControl(node.name) || node.name === 'slider') && !fitWidth;
  const model = node.name === 'checkbox' || node.name === 'radio' ? 'modelValue' : 'value';
  const change = node.name === 'switch' ? 'onChange' : 'onValueChange';
  const controlProps = {
    ...props,
    [model]: node.value,
    ...(supportsFit ? { fitWidth } : {}),
    disabled: disabled || readonly || node.props?.disabled === true,
    readonly,
    className: classes,
    [change]: (value: unknown) => update(value as JsonValue),
  };
  return (
    <span
      className={[
        `${prefix}-component-control`,
        `${prefix}-component-${node.name}`,
        stretch && `${prefix}-component-stretch`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Component {...controlProps}>
        {['checkbox', 'radio', 'row'].includes(node.name) ? componentLabel : undefined}
      </Component>
    </span>
  );
}
