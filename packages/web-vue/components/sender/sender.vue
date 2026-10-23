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
              :value="slotProps.node.value as ReadonlyDeep<JsonValue> | undefined"
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
              :remove="slotProps.remove"
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
      <VoiceGlow
        v-if="allowSpeech && voiceGlow"
        v-bind="voiceGlowOptions"
        :class="`${prefixCls}-voice-glow`"
        :level="voiceGlowOptions.level ?? speechLevel"
        :theme="voiceGlowOptions.theme ?? themeMode"
        :idle="voiceGlowOptions.idle ?? 0"
        :active="voiceGlowActive"
        aria-hidden="true"
      />
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import type { JsonValue, ReadonlyDeep } from 'type-fest';

  import type { ComponentPublicInstance, PropType, VNodeChild } from 'vue';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    nextTick,
    onBeforeUnmount,
    onBeforeUpdate,
    provide,
    shallowRef,
    toRef,
    useAttrs,
    watch,
  } from 'vue';

  import { createSenderFoundation } from '@sdata/web-core/sender/foundation';
  import { createSenderSpeechActivity } from '@sdata/web-core/sender/speech-activity';
  import {
    toSenderJsonValue,
    mergeSenderSlotConfig,
    indexSenderSlotConfig,
  } from '@sdata/web-core/sender/values';
  import { createReusableTemplate } from '@vueuse/core';

  import type { RichTextEditorRef } from '../rich-text-editor';
  import type { VoiceGlowProps } from '../voice-glow';
  import type {
    SenderActionContext,
    SenderCustomSlotConfig,
    SenderCustomSlotRender,
    SenderEmits,
    SenderProps,
    SenderRef,
    SenderSkill,
    SenderSlotConfig,
    SenderValue,
  } from './types';

  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { useThemeMode } from '../_hooks/use-theme-mode';
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
  import VoiceGlow from '../voice-glow';
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
    voiceGlow: true,
    suffixPlacement: 'content',
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<SenderEmits>();
  const voiceGlowOptions = computed<VoiceGlowProps>(() =>
    typeof props.voiceGlow === 'object' ? props.voiceGlow : {},
  );
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
      remove: { type: Function as PropType<() => void>, required: true },
    },
    emits: {
      change: (_value: unknown) => true,
    },
    setup(renderProps, { emit: emitCustomChange }) {
      return () =>
        renderProps.renderer(
          renderProps.value,
          (value) => emitCustomChange('change', value),
          {
            disabled: renderProps.disabled,
            readonly: renderProps.readonly,
            remove: () => {
              if (!renderProps.disabled && !renderProps.readonly) renderProps.remove();
            },
          },
          renderProps.item,
        );
    },
  });

  // 技能标签：Tooltip 与非 Tooltip 两种外层共用同一份内层结构，避免重复 markup。
  // 外层不设 role="button"（标签本身无激活动作），仅在带 tooltip 时给 tabindex 作为触发器，
  // 以免与关闭按钮形成嵌套 button；关闭按钮单独为 role="button"。
  const attrs = useAttrs();
  const instance = getCurrentInstance();
  const vnodeProps = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    vnodeProps.value = instance?.vnode.props;
  });
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
  const containerRef = shallowRef<HTMLDivElement | null>(null);
  const themeMode = useThemeMode(containerRef);
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

  provide(senderInjectionKey, {
    prefixCls,
    classNames: toRef(props, 'classNames'),
    styles: toRef(props, 'styles'),
  });

  const foundation = createSenderFoundation<SenderSlotConfig, SenderSkill>(
    {
      get props() {
        return props;
      },
      get prefixCls() {
        return prefixCls;
      },
      get editorReady() {
        return slotEditorReady.value;
      },
      set editorReady(value) {
        slotEditorReady.value = value;
      },
      get editor() {
        return slotInputRef.value;
      },
      get runtimeConfig() {
        return runtimeSlotConfig.value;
      },
      set runtimeConfig(value) {
        runtimeSlotConfig.value = value;
      },
      get activeSkill() {
        return activeSkill.value;
      },
      set activeSkill(value) {
        activeSkill.value = value;
      },
      get slotValue() {
        return slotValue.value;
      },
      set slotValue(value) {
        slotValue.value = value;
      },
      get innerValue() {
        return innerValue.value;
      },
      set innerValue(value) {
        innerValue.value = value;
      },
      get controlled(): boolean {
        return isControlled.value;
      },
      get mergedValue(): string {
        return mergedValue.value;
      },
      get slotMode(): boolean {
        return isSlotMode.value;
      },
      get configs(): readonly SenderSlotConfig[] {
        return allSlotConfig.value;
      },
      get configByKey(): ReadonlyMap<string, SenderSlotConfig> {
        return keyedSlotConfig.value;
      },
      get submitDisabled(): boolean {
        return submitDisabled.value;
      },
      get clearDisabled(): boolean {
        return clearDisabled.value;
      },
      get cancelDisabled(): boolean {
        return cancelDisabled.value;
      },
      get exposedTextarea() {
        return textareaRef.value;
      },
      get container() {
        return containerRef.value;
      },
      get readonlyHover() {
        return readonlyTipHoverVisible.value;
      },
      set readonlyHover(value) {
        readonlyTipHoverVisible.value = value;
      },
      get speechAvailable(): boolean {
        return speechAvailable.value;
      },
      get speechRequesting(): boolean {
        return speechRequesting.value;
      },
      get speechStopping(): boolean {
        return speechStopping.value;
      },
      get recording(): boolean {
        return recording.value;
      },
    },
    {
      update: (value) => emit('update:modelValue', value),
      change: (value, event) => emit('change', value.value, event, value.slotConfig, value.skill),
      submit: (value) => emit('submit', value.value, value.slotConfig, value.skill),
      cancel: () => emit('cancel'),
      speech: () => _triggerSpeech(),
      pasteFile: (files) => emit('pasteFile', files),
      paste: (event) => emit('paste', event),
      afterRender: nextTick,
      showReadonlyTip,
      hideReadonlyTip,
    },
  );
  const {
    syncSlotEditor,
    handleSlotEditorReady,
    handleSlotEditorChange,
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
    blur,
    clear,
    handleContentMousedown,
    handleReadonlyKeydown,
  } = foundation;
  const getValue = (): SenderValue => foundation.getValue();
  const focus: SenderRef['focus'] = foundation.focus;
  const insert: SenderRef['insert'] = foundation.insert;
  const getCustomConfig = (key: string): SenderCustomSlotConfig | undefined =>
    foundation.getCustomConfig(key);

  const isControlled = computed(
    () =>
      Object.hasOwn(vnodeProps.value ?? {}, 'modelValue') ||
      Object.hasOwn(vnodeProps.value ?? {}, 'model-value'),
  );
  const mergedValue = computed(foundation.mergedValue);
  const isSlotMode = computed(foundation.slotMode);
  const inputComponent = computed(() => props.components?.input ?? Textarea);
  const allSlotConfig = computed(() =>
    mergeSenderSlotConfig(props.slotConfig, runtimeSlotConfig.value),
  );
  const keyedSlotConfig = computed(() => indexSenderSlotConfig(allSlotConfig.value));
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

  const rootClass = computed(() => [
    prefixCls,
    `${prefixCls}-main`,
    attrs.class,
    props.classNames.root,
    {
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);

  const updateCustomSlot = (update: (value: JsonValue) => void, value: unknown) => {
    update(toSenderJsonValue(value));
  };

  const getCustomSlotName = (key: string): `slot-${string}` => `slot-${key}`;

  const submitDisabled = computed(foundation.valueEmpty);
  const clearDisabled = computed(foundation.valueEmpty);
  const cancelDisabled = computed(foundation.cancelDisabled);

  const {
    Recorder,
    available: speechAvailable,
    recorder,
    recording,
    level: speechLevel,
    requesting: speechRequesting,
    stopping: speechStopping,
    statusText: speechStatusText,
    trigger: _triggerSpeech,
  } = useRecorder(toRef(props, 'allowSpeech'), {
    onStop: (blob, duration, mime) => emit('speechEnd', blob, duration, mime),
    onError: (message, isUserNotAllow) => emit('speechError', message, isUserNotAllow),
  });

  const voiceActivity = shallowRef(false);
  const speechActivity = createSenderSpeechActivity({
    get recording() {
      return recording.value;
    },
    get level() {
      return speechLevel.value;
    },
    get options() {
      return voiceGlowOptions.value;
    },
    get active() {
      return voiceActivity.value;
    },
    set active(value) {
      voiceActivity.value = value;
    },
  });
  const speaking = computed(speechActivity.speaking);
  watch([speaking, recording], ([detected, isRecording]) =>
    speechActivity.update(detected, isRecording),
  );
  onBeforeUnmount(speechActivity.dispose);
  const voiceGlowActive = computed(speechActivity.glowActive);
  const actionContext = computed<SenderActionContext>(foundation.actionContext);

  watch(
    () => props.slotConfig,
    () => syncSlotEditor(),
    { deep: true },
  );
  watch(() => props.skill, foundation.syncSkill);
  watch(isSlotMode, foundation.syncSlotMode);

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
