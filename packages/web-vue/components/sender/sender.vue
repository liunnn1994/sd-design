<template>
  <DefineSuffix>
    <div :class="[`${prefixCls}-actions-list`, classNames?.suffix]" :style="styles?.suffix">
      <slot name="suffix" :actions="actionContext">
        <div :class="`${prefixCls}-actions-list-presets`">
          <Button
            v-if="allowSpeech"
            type="text"
            :loading="speechRequesting || speechStopping"
            :disabled="actionContext.speechDisabled"
            :title="speechStatusText"
            :class="[
              `${prefixCls}-actions-btn`,
              {
                [`${prefixCls}-actions-btn-disabled`]: actionContext.speechDisabled,
              },
            ]"
            :aria-label="speechStatusText"
            @click="triggerSpeech()"
          >
            <template #icon>
              <RecordingIcon v-if="recording" :class="`${prefixCls}-actions-btn-recording-icon`" />
              <IconMute v-else-if="actionContext.speechDisabled" />
              <IconVoice v-else />
            </template>
          </Button>

          <Button
            v-if="loading"
            type="text"
            shape="circle"
            :disabled="actionContext.cancelDisabled"
            :class="[`${prefixCls}-actions-btn`, `${prefixCls}-actions-btn-loading-button`]"
            :aria-label="t('sender.stopGenerating')"
            @click="triggerCancel"
          >
            <template #icon>
              <StopLoadingIcon :class="`${prefixCls}-actions-btn-loading-icon`" />
            </template>
          </Button>
          <Button
            v-else
            type="primary"
            shape="circle"
            :disabled="actionContext.submitDisabled"
            :class="[
              `${prefixCls}-actions-btn`,
              {
                [`${prefixCls}-actions-btn-disabled`]: actionContext.submitDisabled,
              },
            ]"
            :aria-label="t('sender.send')"
            @click="triggerSend"
          >
            <template #icon>
              <IconArrowUp />
            </template>
          </Button>
        </div>
      </slot>
    </div>
  </DefineSuffix>

  <Tooltip
    :popup-visible="readonlyTipVisible"
    :content="readonlyTipText"
    :disabled="readonlyTipDisabled"
    position="top"
    @popup-visible-change="handleReadonlyTipVisibleChange"
  >
    <div
      ref="containerRef"
      v-bind="$attrs"
      :class="rootClass"
      :style="styles?.root"
      @click="showReadonlyTip"
      @keydown.capture="handleReadonlyKeydown"
    >
      <slot name="header" :actions="actionContext" />

      <div
        :class="[`${prefixCls}-content`, classNames?.content]"
        :style="styles?.content"
        @mousedown="handleContentMousedown"
      >
        <div
          v-if="$slots.prefix"
          :class="[`${prefixCls}-prefix`, classNames?.prefix]"
          :style="styles?.prefix"
        >
          <slot name="prefix" :actions="actionContext" />
        </div>

        <RichTextEditor
          v-if="isSlotMode"
          ref="slotInputRef"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="Boolean(readonly)"
          :auto-size="autoSize"
          :class-names="slotEditorClassNames"
          :styles="slotEditorStyles"
          :aria-label="t('sender.messageInput')"
          @ready="handleSlotEditorReady"
          @change="handleSlotEditorChange"
          @keydown.capture="handleSlotKeydown"
          @keyup.capture="onKeyup"
          @paste.capture="handleSlotPaste"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        >
          <template #node-senderSkill="{ remove }">
            <SkillTag
              v-if="activeSkill"
              :skill="activeSkill"
              :disabled="disabled"
              :readonly="Boolean(readonly)"
              @remove="(event) => removeSkill(event, remove)"
            >
              <template #skill-title="{ skill }">
                <slot name="skill-title" :skill="skill">
                  <RenderContent :content="skill.title ?? skill.value" />
                </slot>
              </template>
              <template #skill-close-icon="{ skill }">
                <slot name="skill-close-icon" :skill="skill">
                  <RenderContent
                    v-if="typeof skill.closable === 'object' && skill.closable.closeIcon"
                    :content="skill.closable.closeIcon"
                  />
                  <IconClose v-else />
                </slot>
              </template>
            </SkillTag>
          </template>

          <template #node-senderCustom="slotProps">
            <slot
              v-if="$slots[getCustomSlotName(slotProps.node.key)]"
              :name="getCustomSlotName(slotProps.node.key)"
              :value="slotProps.node.value"
              :item="getCustomConfig(slotProps.node.key)"
              :disabled="slotProps.disabled"
              :readonly="slotProps.readonly"
              :on-change="(value: unknown) => updateCustomSlot(slotProps.update, value)"
            />
            <CustomSlotRenderer
              v-else-if="getCustomConfig(slotProps.node.key)?.customRender"
              :renderer="getCustomConfig(slotProps.node.key)!.customRender!"
              :value="slotProps.node.value"
              :item="getCustomConfig(slotProps.node.key)!"
              :disabled="slotProps.disabled"
              :readonly="slotProps.readonly"
              @change="updateCustomSlot(slotProps.update, $event)"
            />
          </template>
        </RichTextEditor>

        <component
          :is="inputComponent"
          v-else
          ref="textareaRef"
          :model-value="mergedValue"
          :default-value="defaultValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :auto-size="autoSize"
          :class="[`${prefixCls}-input`, classNames?.input]"
          :style="styles?.input"
          @update:model-value="handleValueUpdate"
          @input="handleInput"
          @keydown="handleKeydown"
          @keyup="onKeyup"
          @paste="handlePaste"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        />

        <ReuseSuffix v-if="showActions && suffixPlacement === 'content'" />
      </div>

      <div
        v-if="$slots.footer || (showActions && suffixPlacement === 'footer')"
        :class="[`${prefixCls}-footer`, classNames?.footer]"
        :style="styles?.footer"
      >
        <div v-if="$slots.footer" :class="`${prefixCls}-footer-content`">
          <slot name="footer" :actions="actionContext" />
        </div>
        <div
          v-if="showActions && suffixPlacement === 'footer'"
          :class="`${prefixCls}-footer-suffix`"
        >
          <ReuseSuffix />
        </div>
      </div>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import type { JsonValue } from 'type-fest';

  import type { ComponentPublicInstance, PropType, VNodeChild } from 'vue';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    nextTick,
    provide,
    shallowRef,
    toRef,
    useAttrs,
    watch,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import { INSERT_LINE_BREAK_COMMAND } from 'lexical';

  import type {
    RichTextEditorComponentNodeData,
    RichTextEditorContentItem,
    RichTextEditorContentSnapshot,
    RichTextEditorRef,
  } from '../rich-text-editor';
  import type {
    SenderActionContext,
    SenderCustomSlotConfig,
    SenderCustomSlotRender,
    SenderEmits,
    SenderProps,
    SenderRef,
    SenderResolvedSlotConfig,
    SenderSkill,
    SenderSlotConfig,
    SenderValue,
  } from './types';

  import {
    isReadonlyModificationKey,
    useReadonlyTip,
    useReadonlyTipText,
  } from '../_hooks/use-readonly-tip';
  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconArrowUp from '../icon/icon-arrow-up';
  import IconClose from '../icon/icon-close';
  import IconMute from '../icon/icon-mute';
  import IconVoice from '../icon/icon-voice';
  import { useI18n } from '../locale';
  import RichTextEditor from '../rich-text-editor';
  import Textarea from '../textarea';
  import Tooltip from '../tooltip';
  import { senderInjectionKey } from './context';
  import RecordingIcon from './sender-recording-icon.vue';
  import SkillTag from './sender-skill-tag.vue';
  import StopLoadingIcon from './sender-stop-loading-icon.vue';
  import { useRecorder } from './use-recorder';

  defineOptions({ name: 'Sender', inheritAttrs: false });

  const props = withDefaults(defineProps<SenderProps>(), {
    defaultValue: '',
    submitType: 'enter',
    autoSize: () => ({ maxRows: 8 }),
    showActions: true,
    suffixPlacement: 'content',
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<SenderEmits>();
  const { t } = useI18n();
  const [DefineSuffix, ReuseSuffix] = createReusableTemplate();

  const RenderContent = defineComponent({
    name: 'SenderRenderContent',
    props: {
      content: {
        type: null as unknown as PropType<VNodeChild>,
      },
    },
    setup(renderProps) {
      return () => renderProps.content ?? null;
    },
  });

  const CustomSlotRenderer = defineComponent({
    name: 'SenderCustomSlotRenderer',
    props: {
      renderer: {
        type: Function as PropType<SenderCustomSlotRender>,
        required: true,
      },
      value: {
        type: null,
      },
      item: {
        type: Object as PropType<SenderCustomSlotConfig>,
        required: true,
      },
      disabled: Boolean,
      readonly: Boolean,
    },
    emits: {
      change: (_value: unknown) => true,
    },
    setup(renderProps, { emit: emitCustomChange }) {
      return () =>
        renderProps.renderer(
          renderProps.value,
          (value) => emitCustomChange('change', value),
          { disabled: renderProps.disabled, readonly: renderProps.readonly },
          renderProps.item,
        );
    },
  });

  // 技能标签：Tooltip 与非 Tooltip 两种外层共用同一份内层结构，避免重复 markup。
  // 外层不设 role="button"（标签本身无激活动作），仅在带 tooltip 时给 tabindex 作为触发器，
  // 以免与关闭按钮形成嵌套 button；关闭按钮单独为 role="button"。
  const attrs = useAttrs();
  const instance = getCurrentInstance();
  const prefixCls = getPrefixCls('sender');
  const readonlyTipHoverVisible = shallowRef(false);
  const {
    tipVisible: readonlyTipInteractionVisible,
    show: showReadonlyTip,
    hide: hideReadonlyTip,
  } = useReadonlyTip(
    toRef(props, 'readonly'),
    computed(() => Boolean(props.disabled)),
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const readonlyTipDisabled = computed(() => !props.readonly || props.disabled);
  const readonlyTipVisible = computed(
    () =>
      !readonlyTipDisabled.value &&
      (readonlyTipHoverVisible.value || readonlyTipInteractionVisible.value),
  );
  const containerRef = shallowRef<HTMLDivElement>();
  const textareaRef = shallowRef<
    ComponentPublicInstance & { focus?: () => void; blur?: () => void }
  >();
  const slotInputRef = shallowRef<RichTextEditorRef>();
  const slotEditorReady = shallowRef(false);
  const runtimeSlotConfig = shallowRef<SenderSlotConfig[]>([]);
  const activeSkill = shallowRef<SenderSkill>();
  if (props.skill) activeSkill.value = props.skill;
  // 词槽模式下 editor 的文本内容（Lexical EditorState）不是响应式的，
  // 用一个快照在每次 change 时同步，让 submitDisabled/clearDisabled 能随输入更新。
  const slotValue = shallowRef<SenderValue>({ value: '', slotConfig: [], skill: props.skill });
  const innerValue = shallowRef(props.defaultValue);
  const pendingValue = shallowRef<string>();

  provide(senderInjectionKey, {
    prefixCls,
    classNames: toRef(props, 'classNames'),
    styles: toRef(props, 'styles'),
  });

  const isControlled = computed(() => Object.hasOwn(instance?.vnode.props ?? {}, 'modelValue'));
  const mergedValue = computed(() =>
    isControlled.value ? (props.modelValue ?? '') : innerValue.value,
  );
  const isSlotMode = computed(() => props.slotConfig !== undefined || Boolean(props.skill));
  const inputComponent = computed(() => props.components?.input ?? Textarea);
  const allSlotConfig = computed(() => {
    const propKeys = new Set(
      (props.slotConfig ?? []).flatMap((item) => (item.key ? [item.key] : [])),
    );
    return [
      ...(props.slotConfig ?? []),
      ...runtimeSlotConfig.value.filter((item) => !item.key || !propKeys.has(item.key)),
    ];
  });
  const keyedSlotConfig = computed(
    () =>
      new Map(allSlotConfig.value.flatMap((item) => (item.key ? [[item.key, item] as const] : []))),
  );
  const slotEditorClassNames = computed(() => ({
    root: [`${prefixCls}-input`, `${prefixCls}-input-slot`, props.classNames.input]
      .filter(Boolean)
      .join(' '),
    content: `${prefixCls}-input-slot-content`,
    placeholder: `${prefixCls}-input-slot-placeholder`,
    component: `${prefixCls}-slot`,
  }));
  const slotEditorStyles = computed(() => ({
    root: props.styles.input,
  }));

  const handleReadonlyTipVisibleChange = (visible: boolean) => {
    readonlyTipHoverVisible.value = visible && !readonlyTipDisabled.value;
  };

  const handleReadonlyKeydown = (event: KeyboardEvent) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      readonlyTipHoverVisible.value = false;
      hideReadonlyTip();
      return;
    }
    if (isReadonlyModificationKey(event)) {
      showReadonlyTip();
    }
  };

  const rootClass = computed(() => [
    prefixCls,
    `${prefixCls}-main`,
    attrs.class,
    props.classNames.root,
    {
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);

  const toJsonValue = (value: unknown): JsonValue => {
    if (value === undefined) return null;
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    try {
      return JSON.parse(JSON.stringify(value)) as JsonValue;
    } catch {
      return String(value);
    }
  };

  const updateCustomSlot = (update: (value: JsonValue) => void, value: unknown) => {
    update(toJsonValue(value));
  };

  const getSlotDefaultValue = (config: SenderSlotConfig) => {
    if (config.type === 'text') return config.value ?? '';
    if (config.type === 'tag') return config.props?.value ?? config.props?.label ?? '';
    return config.props?.defaultValue ?? '';
  };

  const createSlotNode = (
    config: Exclude<SenderSlotConfig, { type: 'text' }>,
    previousValue?: unknown,
  ): RichTextEditorComponentNodeData => {
    const value = toJsonValue(previousValue ?? getSlotDefaultValue(config));
    if (config.type === 'input' || config.type === 'content') {
      return {
        key: config.key,
        name: 'input',
        value,
        props: {
          placeholder: config.props?.placeholder ?? '',
          ...(config.type === 'content' ? { class: `${prefixCls}-slot-content` } : {}),
        },
        textValue: String(value ?? ''),
      };
    }
    if (config.type === 'select') {
      return {
        key: config.key,
        name: 'select',
        value,
        props: {
          placeholder: config.props?.placeholder ?? '',
          options:
            config.props?.options.map((option) => ({
              label: option,
              value: option,
            })) ?? [],
        },
        textValue: String(value ?? ''),
      };
    }
    if (config.type === 'tag') {
      const label = config.props?.label;
      return {
        key: config.key,
        name: 'tag',
        value,
        props: {
          label:
            typeof label === 'string' || typeof label === 'number'
              ? String(label)
              : String(config.props?.value ?? ''),
        },
        textValue: String(value ?? ''),
      };
    }
    return {
      key: config.key,
      name: 'senderCustom',
      value,
      textValue: String(value ?? ''),
    };
  };

  const createSkillNode = (): RichTextEditorComponentNodeData | undefined =>
    activeSkill.value
      ? {
          key: '__sender_skill__',
          name: 'senderSkill',
          value: activeSkill.value.value,
          textValue: '',
        }
      : undefined;

  const createSlotEditorContent = (
    previousContent: readonly RichTextEditorContentSnapshot[] = [],
  ): RichTextEditorContentItem[] => {
    const previousValues = new Map(
      previousContent.flatMap((item) =>
        typeof item === 'string' ? [] : [[item.key, item.value] as const],
      ),
    );
    const skillNode = createSkillNode();
    return [
      ...(skillNode ? [skillNode] : []),
      ...allSlotConfig.value.map((config) =>
        config.type === 'text'
          ? (config.value ?? '')
          : createSlotNode(config, previousValues.get(config.key)),
      ),
    ];
  };

  function resolveSlotValue(content: readonly RichTextEditorContentSnapshot[]): SenderValue {
    const result: string[] = [];
    const resolvedConfig: SenderResolvedSlotConfig[] = [];

    for (const item of content) {
      if (typeof item === 'string') {
        result.push(item);
        if (item) resolvedConfig.push({ type: 'text', value: item });
        continue;
      }
      if (item.name === 'senderSkill') continue;
      const config = keyedSlotConfig.value.get(item.key);
      if (!config) continue;
      const rawValue = item.value ?? '';
      result.push(config.formatResult?.(rawValue) ?? String(rawValue));
      resolvedConfig.push({ ...config, value: rawValue } as SenderResolvedSlotConfig);
    }

    return {
      value: result.join(''),
      slotConfig: resolvedConfig,
      skill: activeSkill.value,
    };
  }

  const syncSlotEditor = () => {
    if (!slotEditorReady.value || !slotInputRef.value) return;
    const content = createSlotEditorContent(slotInputRef.value.getContent());
    slotInputRef.value.setContent(content, { tag: 'sd-sender-slot-sync' });
  };

  const handleSlotEditorReady = () => {
    slotEditorReady.value = true;
    syncSlotEditor();
  };

  const handleSlotEditorChange = () => {
    if (!slotEditorReady.value) return;
    const content = slotInputRef.value?.getContent() ?? [];
    if (
      activeSkill.value &&
      !content.some((item) => typeof item !== 'string' && item.name === 'senderSkill')
    ) {
      activeSkill.value = undefined;
    }
    slotValue.value = resolveSlotValue(content);
    handleSlotChange(slotValue.value);
  };

  const getCustomSlotName = (key: string) => `slot-${key}`;
  const getCustomConfig = (key: string) => {
    const config = keyedSlotConfig.value.get(key);
    return config?.type === 'custom' ? config : undefined;
  };

  const removeSkill = (event: Event, remove: () => void) => {
    if (!activeSkill.value?.closable || props.disabled || props.readonly) return;
    const config =
      typeof activeSkill.value.closable === 'object' ? activeSkill.value.closable : undefined;
    if (config?.disabled) return;
    activeSkill.value = undefined;
    remove();
    config?.onClose?.(event as MouseEvent);
  };

  function clearSlotEditor() {
    runtimeSlotConfig.value = [];
    activeSkill.value = props.skill;
    const skillNode = createSkillNode();
    slotInputRef.value?.setContent(skillNode ? [skillNode] : [], {
      tag: 'sd-sender-slot-clear',
    });
  }

  const getNormalValue = (): SenderValue => ({
    value: mergedValue.value,
    slotConfig: [],
    skill: undefined,
  });
  const getCurrentValue = () => (isSlotMode.value ? slotValue.value : getNormalValue());

  const setNormalValue = (value: string, event?: Event) => {
    if (!isControlled.value) innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event, [], undefined);
  };

  // Textarea 在一次输入中会先后触发 `update:modelValue` 与 `input` 两个事件。
  // 用 microtask 合并，保证每次输入只 emit 一次 change（见 index.cy.ts "emits one change in controlled mode"）。
  const handleValueUpdate = (value: string) => {
    pendingValue.value = value;
    queueMicrotask(() => {
      if (pendingValue.value !== value) return;
      pendingValue.value = undefined;
      setNormalValue(value);
    });
  };

  // `input` 事件携带原生 Event，立即落值并取消待处理的 microtask，避免双发。
  const handleInput = (value: string, event: Event) => {
    pendingValue.value = undefined;
    setNormalValue(value, event);
  };

  function handleSlotChange(value: SenderValue, event?: Event) {
    emit('change', value.value, event, value.slotConfig, value.skill);
  }

  const submitDisabled = computed(() => !getCurrentValue().value);
  const clearDisabled = computed(() => !getCurrentValue().value);
  const cancelDisabled = computed(() => !props.loading);

  const triggerSend = () => {
    if (props.loading || props.disabled || submitDisabled.value) return;
    const value = getCurrentValue();
    emit('submit', value.value, value.slotConfig, value.skill);
  };

  const triggerClear = () => {
    if (props.disabled || clearDisabled.value) return;
    if (isSlotMode.value) clearSlotEditor();
    else setNormalValue('');
  };

  const triggerCancel = () => {
    if (cancelDisabled.value || props.disabled) return;
    emit('cancel');
  };

  const {
    Recorder,
    available: speechAvailable,
    recorder,
    recording,
    requesting: speechRequesting,
    stopping: speechStopping,
    statusText: speechStatusText,
    trigger: triggerSpeech,
  } = useRecorder(toRef(props, 'allowSpeech'), {
    onStop: (blob, duration, mime) => emit('speechEnd', blob, duration, mime),
    onError: (message, isUserNotAllow) => emit('speechError', message, isUserNotAllow),
  });

  const actionContext = computed<SenderActionContext>(() => ({
    send: triggerSend,
    clear: triggerClear,
    cancel: triggerCancel,
    speech: triggerSpeech,
    submitDisabled: Boolean(props.disabled || submitDisabled.value),
    clearDisabled: Boolean(props.disabled || clearDisabled.value),
    cancelDisabled: Boolean(props.disabled || cancelDisabled.value),
    speechDisabled: Boolean(
      props.disabled || !speechAvailable.value || speechRequesting.value || speechStopping.value,
    ),
    recording: recording.value,
    loading: Boolean(props.loading),
  }));

  const shouldSubmit = (event: KeyboardEvent) => {
    if (event.isComposing || event.key !== 'Enter') return false;
    const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
    return (
      (props.submitType === 'enter' && !event.shiftKey && !modifierPressed) ||
      (props.submitType === 'shiftEnter' && event.shiftKey && !modifierPressed)
    );
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const result = props.onKeydown?.(event);
    if (result === false) return;
    if (shouldSubmit(event)) {
      event.preventDefault();
      triggerSend();
    }
  };

  const handleSlotKeydown = (event: KeyboardEvent) => {
    const result = props.onKeydown?.(event);
    if (result === false || event.isComposing || event.key !== 'Enter') return;
    const target = event.target;
    if (target instanceof Element && target.closest(`.${prefixCls}-skill-tag`)) return;
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
      slotInputRef.value?.dispatchCommand(INSERT_LINE_BREAK_COMMAND, undefined);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    if (!text && files?.length) {
      event.preventDefault();
      emit('pasteFile', files);
    }
    emit('paste', event);
  };

  const handleSlotPaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    handlePaste(event);
    if (!text && files?.length) event.stopPropagation();
  };

  const getNativeTextarea = () => {
    const exposed = textareaRef.value;
    if (exposed instanceof HTMLTextAreaElement) return exposed;

    const element = exposed?.$el;
    if (element instanceof HTMLTextAreaElement) return element;
    if (element instanceof Element) {
      const textarea = element.querySelector('textarea');
      if (textarea) return textarea;
    }
    return containerRef.value?.querySelector('textarea') ?? null;
  };

  const focus = (options?: Parameters<SenderRef['focus']>[0]) => {
    if (isSlotMode.value) {
      const { cursor = 'end', preventScroll = false, key } = options ?? {};
      if (cursor === 'slot') {
        const root = slotInputRef.value?.rootElement;
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
      slotInputRef.value?.focus(undefined, {
        preventScroll,
        selection: cursor === 'all' ? 'all' : cursor,
      });
      return;
    }
    const textarea = getNativeTextarea();
    if (textarea) textarea.focus({ preventScroll: options?.preventScroll });
    else textareaRef.value?.focus?.();
    if (!textarea) return;
    const cursor = options?.cursor ?? 'end';
    const position = cursor === 'start' ? 0 : textarea.value.length;
    if (cursor === 'all') textarea.select();
    else textarea.setSelectionRange(position, position);
  };

  const blur = () => {
    if (isSlotMode.value) slotInputRef.value?.blur();
    else {
      const textarea = getNativeTextarea();
      if (textarea) textarea.blur();
      else textareaRef.value?.blur?.();
    }
  };

  const insert: SenderRef['insert'] = (
    value,
    position = 'cursor',
    replaceCharacters,
    preventScroll,
  ) => {
    if (isSlotMode.value) {
      if (typeof value === 'string') {
        slotInputRef.value?.insertText(value, { position, replaceCharacters });
      } else {
        runtimeSlotConfig.value = [...runtimeSlotConfig.value, ...value];
        slotInputRef.value?.insertContent(
          value.map((config) =>
            config.type === 'text' ? (config.value ?? '') : createSlotNode(config),
          ),
          { position, replaceCharacters },
        );
      }
      if (preventScroll) nextTick(() => focus({ cursor: 'end', preventScroll: true }));
      return;
    }
    const insertValue = typeof value === 'string' ? value : value.map(formatSlot).join('');
    const textarea = getNativeTextarea();
    const current = mergedValue.value;
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
    if (isSlotMode.value) clearSlotEditor();
    else setNormalValue('');
  };

  const getValue = () => getCurrentValue();

  watch(
    () => props.slotConfig,
    () => syncSlotEditor(),
    { deep: true },
  );
  watch(
    () => props.skill,
    (skill) => {
      activeSkill.value = skill;
      syncSlotEditor();
    },
  );
  watch(isSlotMode, (enabled) => {
    if (!enabled) slotEditorReady.value = false;
  });

  function formatSlot(slot: SenderSlotConfig) {
    if (slot.type === 'text') return slot.value ?? '';
    if (slot.type === 'tag') return String(slot.props?.value ?? slot.props?.label ?? '');
    const value = slot.props?.defaultValue ?? '';
    return slot.formatResult?.(value) ?? String(value);
  }

  const handleContentMousedown = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      focus();
    }
  };

  defineExpose({
    Recorder,
    get recorder() {
      return recorder.value ?? null;
    },
    get recording() {
      return recording.value;
    },
    get inputElement() {
      return isSlotMode.value ? (slotInputRef.value?.rootElement ?? null) : getNativeTextarea();
    },
    get nativeElement() {
      return containerRef.value ?? null;
    },
    focus,
    blur,
    insert,
    clear,
    getValue,
  });
</script>
