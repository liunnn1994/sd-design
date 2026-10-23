import { INSERT_LINE_BREAK_COMMAND } from 'lexical';

import type {
  RichTextEditorRef,
  RichTextEditorContentSnapshot,
} from '../rich-text-editor/types.js';
import type {
  SenderSlotData,
  SenderTextSlotConfig,
  SenderInsertPosition,
  SenderSubmitType,
  SenderFocusOptions,
  SenderActionContext,
} from './types.js';

import { isReadonlyModificationKey } from '../text-input/readonly.js';
import {
  createSenderSlotNode,
  createSenderSkillNode,
  createSenderSlotContent,
  resolveSenderSlotValue,
  formatSenderSlot,
  shouldSenderSubmit,
} from './values.js';
export interface SenderSkillData {
  value: string;
  closable?: boolean | { disabled?: boolean; onClose?: (event: MouseEvent) => void };
}
export interface SenderValueData<Config extends SenderSlotData, Skill> {
  value: string;
  slotConfig: (SenderTextSlotConfig | (Config & { value?: unknown }))[];
  skill?: Skill | undefined;
}
export type SenderEditor = Pick<
  RichTextEditorRef,
  | 'rootElement'
  | 'getContent'
  | 'setContent'
  | 'focus'
  | 'blur'
  | 'insertText'
  | 'insertContent'
  | 'dispatchCommand'
>;
export type SenderTextarea =
  | HTMLTextAreaElement
  | { readonly $el?: unknown; focus?: () => void; blur?: () => void };
export interface SenderFoundationState<
  Config extends SenderSlotData,
  Skill extends SenderSkillData,
> {
  readonly props: {
    disabled?: boolean | undefined;
    loading?: boolean | undefined;
    readonly?: boolean | string | undefined;
    modelValue?: string | undefined;
    slotConfig?: readonly Config[] | undefined;
    skill?: Skill | undefined;
    submitType: SenderSubmitType;
    onKeydown?: ((event: KeyboardEvent) => void | false) | undefined;
  };
  readonly prefixCls: string;
  readonly controlled: boolean;
  readonly mergedValue: string;
  readonly slotMode: boolean;
  readonly configs: readonly Config[];
  readonly configByKey: ReadonlyMap<string, Config>;
  readonly editor: SenderEditor | undefined;
  readonly exposedTextarea: SenderTextarea | null | undefined;
  readonly container: HTMLDivElement | null;
  readonly submitDisabled: boolean;
  readonly clearDisabled: boolean;
  readonly cancelDisabled: boolean;
  readonly speechAvailable: boolean;
  readonly speechRequesting: boolean;
  readonly speechStopping: boolean;
  readonly recording: boolean;
  editorReady: boolean;
  runtimeConfig: Config[];
  activeSkill: Skill | undefined;
  slotValue: SenderValueData<Config, Skill>;
  innerValue: string;
  readonlyHover: boolean;
}
export interface SenderFoundationCallbacks<Config extends SenderSlotData, Skill> {
  update(value: string): void;
  change(value: SenderValueData<Config, Skill>, event?: Event): void;
  submit(value: SenderValueData<Config, Skill>): void;
  cancel(): void;
  speech(): void;
  pasteFile(files: FileList): void;
  paste(event: ClipboardEvent): void;
  afterRender(callback: () => void): unknown;
  showReadonlyTip(): void;
  hideReadonlyTip(): void;
}
export function createSenderFoundation<
  Config extends SenderSlotData,
  Skill extends SenderSkillData,
>(
  state: SenderFoundationState<Config, Skill>,
  callbacks: SenderFoundationCallbacks<Config, Skill>,
) {
  let pendingValue: string | undefined;
  const createSkillNode = () => createSenderSkillNode(state.activeSkill);
  const createSlotEditorContent = (
    previousContent: readonly RichTextEditorContentSnapshot[] = [],
  ) => createSenderSlotContent(state.configs, state.activeSkill, state.prefixCls, previousContent);
  const resolveSlotValue = (
    content: readonly RichTextEditorContentSnapshot[],
  ): SenderValueData<Config, Skill> =>
    resolveSenderSlotValue(content, {
      get configByKey() {
        return state.configByKey;
      },
      get skill() {
        return state.activeSkill;
      },
    });
  const syncSlotEditor = () => {
    if (!state.editorReady || !state.editor) return;
    const content = createSlotEditorContent(state.editor.getContent());
    state.editor.setContent(content, { tag: 'sd-sender-slot-sync' });
  };
  const handleSlotEditorReady = () => {
    state.editorReady = true;
    syncSlotEditor();
  };
  const handleSlotEditorChange = () => {
    if (!state.editorReady) return;
    const content = state.editor?.getContent() ?? [];
    const keys = new Set(content.flatMap((item) => (typeof item === 'string' ? [] : [item.key])));
    state.runtimeConfig = state.runtimeConfig.filter(
      (config) => !config.key || keys.has(config.key),
    );
    if (
      state.activeSkill &&
      !content.some((item) => typeof item !== 'string' && item.name === 'senderSkill')
    ) {
      state.activeSkill = undefined;
    }
    state.slotValue = resolveSlotValue(content);
    callbacks.change(state.slotValue);
  };
  const getCustomConfig = (key: string): Extract<Config, { type: 'custom' }> | undefined => {
    const config = state.configByKey.get(key);
    return config?.type === 'custom' ? (config as Extract<Config, { type: 'custom' }>) : undefined;
  };
  const removeSkill = (event: Event, remove: () => void) => {
    if (!state.activeSkill?.closable || state.props.disabled || state.props.readonly) return;
    const config =
      typeof state.activeSkill.closable === 'object' ? state.activeSkill.closable : undefined;
    if (config?.disabled) return;
    state.activeSkill = undefined;
    remove();
    config?.onClose?.(event as MouseEvent);
  };
  function clearSlotEditor() {
    state.runtimeConfig = [];
    state.activeSkill = state.props.skill;
    const skillNode = createSkillNode();
    state.editor?.setContent(skillNode ? [skillNode] : [], {
      tag: 'sd-sender-slot-clear',
    });
  }
  const getNormalValue = (): SenderValueData<Config, Skill> => ({
    value: state.mergedValue,
    slotConfig: [],
    skill: undefined,
  });
  const getCurrentValue = () => (state.slotMode ? state.slotValue : getNormalValue());
  const setNormalValue = (value: string, event?: Event) => {
    if (!state.controlled) state.innerValue = value;
    callbacks.update(value);
    callbacks.change({ value, slotConfig: [], skill: undefined }, event);
  };
  const handleValueUpdate = (value: string) => {
    pendingValue = value;
    queueMicrotask(() => {
      if (pendingValue !== value) return;
      pendingValue = undefined;
      setNormalValue(value);
    });
  };
  const handleInput = (value: string, event: Event) => {
    pendingValue = undefined;
    setNormalValue(value, event);
  };
  const triggerSend = () => {
    if (state.props.loading || state.props.disabled || state.submitDisabled) return;
    const value = getCurrentValue();
    callbacks.submit(value);
  };
  const triggerClear = () => {
    if (state.props.disabled || state.clearDisabled) return;
    if (state.slotMode) clearSlotEditor();
    else setNormalValue('');
  };
  const triggerCancel = () => {
    if (state.cancelDisabled || state.props.disabled) return;
    callbacks.cancel();
  };
  const triggerSpeech = () => {
    if (state.props.disabled) return;
    callbacks.speech();
  };
  const shouldSubmit = (event: KeyboardEvent) => shouldSenderSubmit(event, state.props.submitType);
  const handleKeydown = (event: KeyboardEvent) => {
    const result = state.props.onKeydown?.(event);
    if (result === false) return;
    if (shouldSubmit(event)) {
      event.preventDefault();
      triggerSend();
    }
  };
  const handleSlotKeydown = (event: KeyboardEvent) => {
    const result = state.props.onKeydown?.(event);
    if (result === false || event.isComposing || event.key !== 'Enter') return;
    const target = event.target;
    if (target instanceof Element && target.closest(`.${state.prefixCls}-skill-tag`)) return;
    const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
    if (shouldSubmit(event)) {
      event.preventDefault();
      event.stopPropagation();
      triggerSend();
      return;
    }
    if (!modifierPressed) {
      event.preventDefault();
      event.stopPropagation();
      if (!state.props.disabled && !state.props.readonly) {
        state.editor?.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
      }
    }
  };
  const handlePaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    if (!text && files?.length) {
      event.preventDefault();
      callbacks.pasteFile(files);
    }
    callbacks.paste(event);
  };
  const handleSlotPaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    handlePaste(event);
    if (!text && files?.length) event.stopPropagation();
  };
  const getNativeTextarea = () => {
    const exposed = state.exposedTextarea;
    if (exposed instanceof HTMLTextAreaElement) return exposed;

    const element = exposed?.$el;
    if (element instanceof HTMLTextAreaElement) return element;
    if (element instanceof Element) {
      const textarea = element.querySelector('textarea');
      if (textarea) return textarea;
    }
    return state.container?.querySelector('textarea') ?? null;
  };
  const focus = (options?: SenderFocusOptions) => {
    if (state.slotMode) {
      const { cursor = 'end', preventScroll = false, key } = options ?? {};
      if (cursor === 'slot') {
        const root = state.editor?.rootElement;
        const selector = key
          ? `[data-rich-text-component-key="${CSS.escape(key)}"]`
          : '[data-rich-text-component]';
        const component = root?.querySelector<HTMLElement>(selector);
        const control = component?.querySelector<HTMLElement>(
          'input, textarea, button, [contenteditable="true"]',
        );
        (control ?? component)?.focus({ preventScroll });
        return;
      }
      state.editor?.focus(undefined, {
        preventScroll,
        selection: cursor === 'all' ? 'all' : cursor,
      });
      return;
    }
    const textarea = getNativeTextarea();
    if (textarea) textarea.focus({ preventScroll: options?.preventScroll });
    else state.exposedTextarea?.focus?.();
    if (!textarea) return;
    const cursor = options?.cursor ?? 'end';
    const position = cursor === 'start' ? 0 : textarea.value.length;
    if (cursor === 'all') textarea.select();
    else textarea.setSelectionRange(position, position);
  };
  const blur = () => {
    if (state.slotMode) state.editor?.blur();
    else {
      const textarea = getNativeTextarea();
      if (textarea) textarea.blur();
      else state.exposedTextarea?.blur?.();
    }
  };
  const insert = (
    value: string | Config[],
    position: SenderInsertPosition = 'cursor',
    replaceCharacters?: string,
    preventScroll?: boolean,
  ) => {
    if (state.slotMode) {
      if (typeof value === 'string') {
        state.editor?.insertText(value, { position, replaceCharacters });
      } else {
        state.runtimeConfig = [...state.runtimeConfig, ...value];
        state.editor?.insertContent(
          value.map((config) =>
            config.type === 'text'
              ? (config.value ?? '')
              : createSenderSlotNode(config, state.prefixCls),
          ),
          { position, replaceCharacters },
        );
      }
      if (preventScroll) callbacks.afterRender(() => focus({ cursor: 'end', preventScroll: true }));
      return;
    }
    const insertValue = typeof value === 'string' ? value : value.map(formatSenderSlot).join('');
    const textarea = getNativeTextarea();
    const current = state.mergedValue;
    let start = position === 'start' ? 0 : current.length;
    let end = start;
    if (position === 'cursor' && textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    if (replaceCharacters && current.slice(0, start).endsWith(replaceCharacters)) {
      start -= replaceCharacters.length;
    }
    setNormalValue(`${current.slice(0, start)}${insertValue}${current.slice(end)}`);
    requestAnimationFrame(() => {
      focus({ preventScroll });
      const nextPosition = start + insertValue.length;
      getNativeTextarea()?.setSelectionRange(nextPosition, nextPosition);
    });
  };
  const clear = () => {
    if (state.slotMode) clearSlotEditor();
    else setNormalValue('');
  };
  const getValue = () => getCurrentValue();
  const handleContentMousedown = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      focus();
    }
  };
  const handleReadonlyKeydown = (event: KeyboardEvent) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      state.readonlyHover = false;
      callbacks.hideReadonlyTip();
      return;
    }
    if (isReadonlyModificationKey(event)) {
      callbacks.showReadonlyTip();
    }
  };
  const mergedValue = () => (state.controlled ? (state.props.modelValue ?? '') : state.innerValue);
  const slotMode = () => state.props.slotConfig !== undefined || Boolean(state.props.skill);
  const valueEmpty = () => !getCurrentValue().value;
  const cancelDisabled = () => !state.props.loading;
  const actionContext = (): SenderActionContext => ({
    send: triggerSend,
    clear: triggerClear,
    cancel: triggerCancel,
    speech: triggerSpeech,
    submitDisabled: Boolean(state.props.disabled || state.submitDisabled),
    clearDisabled: Boolean(state.props.disabled || state.clearDisabled),
    cancelDisabled: Boolean(state.props.disabled || state.cancelDisabled),
    speechDisabled: Boolean(
      state.props.disabled ||
      !state.speechAvailable ||
      state.speechRequesting ||
      state.speechStopping,
    ),
    recording: state.recording,
    loading: Boolean(state.props.loading),
  });
  const syncSkill = (skill: Skill | undefined) => {
    state.activeSkill = skill;
    syncSlotEditor();
  };
  const syncSlotMode = (enabled: boolean) => {
    if (!enabled) state.editorReady = false;
  };
  return {
    syncSlotEditor,
    handleSlotEditorReady,
    handleSlotEditorChange,
    getCustomConfig,
    removeSkill,
    handleValueUpdate,
    handleInput,
    triggerSend,
    triggerClear,
    triggerCancel,
    triggerSpeech,
    handleKeydown,
    handleSlotKeydown,
    handlePaste,
    handleSlotPaste,
    getNativeTextarea,
    focus,
    blur,
    insert,
    clear,
    getValue,
    handleContentMousedown,
    handleReadonlyKeydown,
    mergedValue,
    slotMode,
    valueEmpty,
    cancelDisabled,
    actionContext,
    syncSkill,
    syncSlotMode,
  };
}
