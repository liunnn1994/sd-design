<template>
  <DefineTag>
    <span :class="`${prefixCls}-skill-tag`" :tabindex="skill.tooltip ? 0 : undefined">
      <span :class="`${prefixCls}-skill-tag-text`">
        <slot name="skill-title" :skill="skill" />
      </span>
      <span
        v-if="skill.closable"
        :class="closeClass"
        role="button"
        tabindex="0"
        :aria-label="t('sender.removeSkill')"
        @click="handleRemove"
        @keydown="handleRemoveKeydown"
      >
        <slot name="skill-close-icon" :skill="skill" />
      </span>
    </span>
  </DefineTag>

  <Tooltip v-if="skill.tooltip" v-bind="tooltipProps">
    <ReuseTag />
  </Tooltip>
  <ReuseTag v-else />
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed } from 'vue';

  import {
    isSenderSkillCloseDisabled,
    resolveSenderSkillTooltip,
    createSenderSkillTag,
  } from '@sdata/web-core/sender/controls';
  import { createReusableTemplate } from '@vueuse/core';

  import type { SenderSkill } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'SenderSkillTag' });

  const props = defineProps<{
    skill: SenderSkill;
    disabled?: boolean;
    readonly?: boolean;
  }>();
  const emit = defineEmits<{
    remove: [event: Event];
  }>();
  defineSlots<{
    'skill-title'?: (props: { skill: SenderSkill }) => VNode[];
    'skill-close-icon'?: (props: { skill: SenderSkill }) => VNode[];
  }>();

  const [DefineTag, ReuseTag] = createReusableTemplate();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('sender');
  const closeClass = computed(() => [
    `${prefixCls}-skill-tag-close`,
    { [`${prefixCls}-skill-tag-close-disabled`]: isSenderSkillCloseDisabled(props) },
  ]);
  const tooltipProps = computed(() => resolveSenderSkillTooltip(props.skill));
  const { remove: handleRemove, keydown: handleRemoveKeydown } = createSenderSkillTag((event) =>
    emit('remove', event),
  );
</script>
