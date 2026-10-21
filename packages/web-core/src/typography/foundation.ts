import type { ClipboardOptions } from '../clipboard.js';
import type { BaseProps } from './types.js';
export interface TypographyFoundationState<Slot> {
  readonly props: Pick<BaseProps, 'ellipsis' | 'copyable' | 'editable' | 'copyDelay'> & {
    readonly copyText?: string | undefined;
    readonly clipboardProps?: ClipboardOptions | undefined;
    readonly editTooltipProps?: Record<string, unknown> | undefined;
    readonly copyTooltipProps?: Record<string, unknown> | undefined;
  };
  readonly slots: Readonly<Record<string, Slot | undefined>>;
  fullText: string;
  isEllipsis: boolean;
  expanded: boolean;
  isCopied: boolean;
  readonly editing: boolean;
  readonly editTextValue: string;
  readonly ellipsisConfig: { expandable: boolean; showTooltip: boolean };
}
export function createTypographyFoundation<Slot>(
  state: TypographyFoundationState<Slot>,
  callbacks: {
    getInnerText(): string;
    copy(text: string, options: ClipboardOptions | undefined): unknown;
    setEditing(value: boolean): void;
    updateEditing(value: boolean): void;
    editStart(): void;
    updateEditText(text: string): void;
    change(text: string): void;
    editEnd(): void;
    copied(text: string): void;
    ellipsis(value: boolean): void;
    expand(value: boolean): void;
  },
) {
  function getMergeEditing() {
    return state.props.editable && state.editing;
  }
  function getEditTextValue(editText: string | undefined) {
    return editText ?? state.fullText;
  }
  function getRootAttrs(attrs: Record<string, unknown>) {
    return {
      ...(state.props.ellipsis &&
      state.isEllipsis &&
      !state.expanded &&
      !state.ellipsisConfig.showTooltip
        ? { title: state.fullText }
        : {}),
      ...attrs,
    };
  }
  const updateFullText = () => {
    if (state.props.ellipsis || state.props.copyable || state.props.editable) {
      const nextFullText = callbacks.getInnerText();
      if (state.fullText !== nextFullText) {
        state.fullText = nextFullText;
      }
    }
  };
  const handleClampChange = (value: boolean) => {
    if (state.isEllipsis !== value) {
      state.isEllipsis = value;
      callbacks.ellipsis(value);
    }
  };
  const onEditStart = () => {
    callbacks.updateEditing(true);
    callbacks.editStart();
    callbacks.setEditing(true);
  };
  const handleEditContentChange = (text: string) => {
    if (text !== state.editTextValue) {
      callbacks.updateEditText(text);
      callbacks.change(text);
    }
  };
  const onEditEnd = () => {
    if (!state.editing) return;
    callbacks.updateEditing(false);
    callbacks.editEnd();
    callbacks.setEditing(false);
  };
  let copyTimer: ReturnType<typeof setTimeout> | null = null;
  const onCopyClick = () => {
    if (state.props.copyText === undefined) updateFullText();
    const text = state.props.copyText ?? state.fullText;
    callbacks.copy(text, state.props.clipboardProps);
    state.isCopied = true;
    callbacks.copied(text);
    // copyDelay 内连点时先清掉上一个 timer，避免被上一次提前复位
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (state.isCopied = false), state.props.copyDelay);
  };
  const onExpandClick = () => {
    state.expanded = !state.expanded;
    callbacks.expand(state.expanded);
  };
  const getOperationsProps = () => ({
    editable: state.props.editable,
    copyable: state.props.copyable,
    expandable: state.ellipsisConfig.expandable,
    isCopied: state.isCopied,
    isEllipsis: state.isEllipsis,
    expanded: state.expanded,
    forceRenderExpand: Boolean(state.props.ellipsis) && state.expanded,
    editTooltipProps: state.props.editTooltipProps,
    copyTooltipProps: state.props.copyTooltipProps,
    onEdit: onEditStart,
    onCopy: onCopyClick,
    onExpand: onExpandClick,
    copyTooltip: state.slots['copy-tooltip'],
    copyIcon: state.slots['copy-icon'],
    expandNode: state.slots['expand-node'],
  });

  function dispose() {
    if (copyTimer) clearTimeout(copyTimer);
  }
  return {
    getMergeEditing,
    getEditTextValue,
    getRootAttrs,
    updateFullText,
    handleClampChange,
    onEditStart,
    handleEditContentChange,
    onEditEnd,
    onCopyClick,
    onExpandClick,
    getOperationsProps,
    dispose,
  };
}
