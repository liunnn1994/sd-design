import { Checkbox } from '../../checkbox/index.js';
import { getMarkdownNodeEvents, type MarkdownNodeEvents } from './events.js';

export interface MarkdownCheckboxNodeProps extends MarkdownNodeEvents {
  node: { checked: boolean };
}
export function MarkdownCheckboxNode(props: MarkdownCheckboxNodeProps) {
  return (
    <Checkbox
      {...getMarkdownNodeEvents(props)}
      modelValue={props.node.checked}
      disabled
      aria-label={props.node.checked ? 'checked' : 'unchecked'}
    />
  );
}
