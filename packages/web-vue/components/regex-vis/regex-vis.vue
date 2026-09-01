<template>
  <section :class="rootClasses" :aria-label="ariaLabelText">
    <div v-if="showInput" :class="`${prefixCls}-controls`">
      <Input
        v-model="modelValue"
        :class="`${prefixCls}-input`"
        :placeholder="placeholderText"
        :readonly="readonly"
        :error="Boolean(parseError)"
        allow-clear
        :aria-label="t('regexVis.inputLabel')"
      />
      <CheckboxGroup
        v-if="showFlags"
        :model-value="effectiveFlags"
        :options="flagOptions"
        :disabled="readonly"
        :class="`${prefixCls}-flags`"
        :aria-label="t('regexVis.flagsLabel')"
        @update:model-value="updateFlags"
      />
    </div>

    <div :class="`${prefixCls}-viewport`">
      <div v-if="!modelValue" :class="`${prefixCls}-empty`">
        <slot name="empty" :text="emptyStateText">{{ emptyStateText }}</slot>
      </div>

      <div v-else-if="parseError" :class="`${prefixCls}-error`" role="alert">
        <slot name="error" :error="parseError">
          <span :class="`${prefixCls}-error-title`">{{ t('regexVis.invalid') }}</span>
          <span :class="`${prefixCls}-error-message`">{{ parseError.message }}</span>
        </slot>
      </div>

      <svg
        v-else-if="diagram"
        :class="`${prefixCls}-graph`"
        :viewBox="`0 0 ${diagram.width} ${diagram.height}`"
        :width="diagram.width"
        :height="diagram.height"
        role="img"
        :aria-label="`${ariaLabelText}：${modelValue}`"
        data-testid="regex-vis-graph"
      >
        <g :class="`${prefixCls}-rail`" aria-hidden="true">
          <path v-for="path in diagram.paths" :key="path.id" :d="path.d" />
          <circle cx="8" :cy="diagram.startY" r="5" />
          <circle :cx="diagram.width - 8" :cy="diagram.startY" r="5" />
        </g>

        <text
          v-for="label in diagram.labels"
          :key="label.id"
          :class="`${prefixCls}-${label.variant}-label`"
          :x="label.x"
          :y="label.y"
          dominant-baseline="middle"
          text-anchor="middle"
        >
          {{ label.text }}
        </text>

        <g
          v-for="quantifier in diagram.quantifiers"
          :key="quantifier.id"
          :class="`${prefixCls}-quantifier`"
          :data-y="quantifier.y"
          aria-hidden="true"
        >
          <svg
            :x="quantifier.x"
            :y="quantifier.y"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
          >
            <path d="M17 1l4 4-4 4" />
            <path
              d="M3 11V9a4 4 0 0 1 4-4h14M21 13v2a4 4 0 0 1-4 4H3"
              :stroke-dasharray="quantifier.greedy ? undefined : '4 4'"
            />
            <path d="M7 23l-4-4 4-4" />
          </svg>
          <text :x="quantifier.x + 20" :y="quantifier.y + 8" dominant-baseline="middle">
            {{ quantifier.text }}
          </text>
        </g>

        <g
          v-for="node in diagram.nodes"
          :key="node.id"
          :class="getNodeClasses(node)"
          :role="selectable ? 'button' : undefined"
          :tabindex="selectable ? 0 : undefined"
          :aria-label="node.description"
          :aria-pressed="selectable ? selectedId === node.id : undefined"
          @click.stop="selectNode(node)"
          @keydown.enter.stop.prevent="selectNode(node)"
          @keydown.space.stop.prevent="selectNode(node)"
        >
          <rect
            :x="node.x"
            :y="node.y"
            :width="node.width"
            :height="node.height"
            :rx="node.variant === 'group' || node.variant === 'choice' ? 8 : 4"
          />
          <text
            v-if="node.variant === 'group' || node.variant === 'choice'"
            :x="node.x + 12"
            :y="node.y + 18"
            dominant-baseline="middle"
          >
            {{ node.label }}
          </text>
          <text
            v-else
            :x="node.x + node.width / 2"
            :y="node.y + node.height / 2"
            dominant-baseline="middle"
            text-anchor="middle"
          >
            <tspan
              v-for="(line, index) in node.lines"
              :key="`${node.id}-line-${index}`"
              :x="node.x + node.width / 2"
              :dy="index === 0 ? -((node.lines.length - 1) * 20) / 2 : 20"
            >
              {{ line }}
            </tspan>
          </text>
        </g>
      </svg>
    </div>

    <div v-if="$slots.footer" :class="`${prefixCls}-footer`">
      <slot name="footer" :value="modelValue" :flags="effectiveFlags" />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, shallowRef, watch } from 'vue';

  import type { RegexVisDiagram, RegexVisGraphNode } from './layout';
  import type {
    RegexVisError,
    RegexVisFlag,
    RegexVisProps,
    RegexVisSelectInfo,
    RegexVisSlots,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import CheckboxGroup from '../checkbox/checkbox-group.vue';
  import Input from '../input/input.vue';
  import { useI18n } from '../locale';
  import { createRegexVisDiagram } from './layout';
  import { parseRegex } from './parser';

  type CheckboxValue = string | number | boolean;

  defineOptions({ name: 'RegexVis' });

  const modelValue = defineModel<string>({ default: '' });
  const flagsModel = defineModel<RegexVisFlag[]>('flags', { default: () => [] });

  const {
    readonly = false,
    showInput = true,
    showFlags = true,
    selectable = true,
    placeholder,
    emptyText,
    ariaLabel,
  } = defineProps<Omit<RegexVisProps, 'modelValue' | 'flags'>>();

  const emit = defineEmits<{
    /**
     * @zh 选择可视图节点时触发
     * @en Triggered when a visualization node is selected
     */
    select: [info: RegexVisSelectInfo];
    /**
     * @zh 正则校验状态变化时触发，无错误时为 undefined
     * @en Triggered when regex validation changes; undefined means valid
     */
    error: [error: RegexVisError | undefined];
  }>();

  defineSlots<RegexVisSlots>();

  const prefixCls = getPrefixCls('regex-vis');
  const { t } = useI18n();
  const selectedId = shallowRef<string>();
  const flagOptions = [
    { label: 'g', value: 'g' },
    { label: 'i', value: 'i' },
    { label: 'm', value: 'm' },
    { label: 's', value: 's' },
    { label: 'u', value: 'u' },
    { label: 'y', value: 'y' },
  ];
  const supportedFlags = new Set<RegexVisFlag>(['d', 'g', 'i', 'm', 's', 'u', 'y']);

  // 校验随当前标志一起进行（u 模式等 flag 相关语法才能通过）；字面量形式（/.../flags）的标志来自表达式本身。
  // 切换标志会重新解析，但节点 id 按解析顺序确定生成，可视图结构不变、选中态得以保留
  const parseResult = computed(() => parseRegex(modelValue.value, { flags: flagsModel.value }));
  const parseError = computed<RegexVisError | undefined>(() =>
    parseResult.value.type === 'error' ? parseResult.value : undefined,
  );
  const effectiveFlags = computed(() =>
    parseResult.value.type === 'regex' && parseResult.value.literal
      ? parseResult.value.flags
      : flagsModel.value,
  );
  const diagram = computed<RegexVisDiagram | undefined>(() => {
    if (parseResult.value.type === 'error' || !modelValue.value) return undefined;
    return createRegexVisDiagram(parseResult.value.body, t);
  });
  const placeholderText = computed(() => placeholder ?? t('regexVis.placeholder'));
  const emptyStateText = computed(() => emptyText ?? t('regexVis.empty'));
  const ariaLabelText = computed(() => ariaLabel ?? t('regexVis.graphLabel'));
  const rootClasses = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-readonly`]: readonly,
      [`${prefixCls}-selectable`]: selectable,
      [`${prefixCls}-invalid`]: Boolean(parseError.value),
    },
  ]);

  const getNodeClasses = (node: RegexVisGraphNode) => [
    `${prefixCls}-node`,
    `${prefixCls}-node-${node.variant}`,
    {
      [`${prefixCls}-node-selected`]: selectedId.value === node.id,
    },
  ];

  const isRegexVisFlag = (value: CheckboxValue): value is RegexVisFlag =>
    typeof value === 'string' && supportedFlags.has(value as RegexVisFlag);

  const updateFlags = (value: CheckboxValue[]) => {
    const flags = value.filter(isRegexVisFlag);
    flagsModel.value = flags;
    if (parseResult.value.type === 'regex' && parseResult.value.literal) {
      const literalEnd = modelValue.value.lastIndexOf('/');
      modelValue.value = `${modelValue.value.slice(0, literalEnd + 1)}${flags.join('')}`;
    }
  };

  const selectNode = (node: RegexVisGraphNode) => {
    if (!selectable) return;
    selectedId.value = node.id;
    emit('select', { node: node.node, label: node.label });
  };

  watch(parseError, (error) => emit('error', error), { immediate: true });
  watch(
    () =>
      parseResult.value.type === 'regex' && parseResult.value.literal
        ? parseResult.value.flags
        : undefined,
    (flags) => {
      if (
        flags &&
        (flags.length !== flagsModel.value.length ||
          flags.some((flag, index) => flag !== flagsModel.value[index]))
      ) {
        flagsModel.value = [...flags];
      }
    },
    { immediate: true },
  );
  watch(diagram, (nextDiagram) => {
    if (selectedId.value && !nextDiagram?.nodes.some((node) => node.id === selectedId.value)) {
      selectedId.value = undefined;
    }
  });
</script>
