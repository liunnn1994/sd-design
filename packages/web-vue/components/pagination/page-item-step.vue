<template>
  <component
    :is="simple ? 'span' : 'li'"
    :class="cls"
    :aria-label="isNext ? t('a11y.nextPage') : t('a11y.prevPage')"
    :aria-disabled="mergedDisabled || undefined"
    :tabindex="mergedDisabled ? -1 : 0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot :type="isNext ? 'next' : 'previous'">
      <icon-right v-if="isNext" />
      <icon-left v-else />
    </slot>
  </component>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { createStepPagerFoundation } from '@sdata/web-core/pagination/items';

  import { getPrefixCls } from '../_utils/global-config';
  import IconLeft from '../icon/icon-left';
  import IconRight from '../icon/icon-right';
  import { useI18n } from '../locale';

  defineOptions({ name: 'StepPager' });

  const props = defineProps({
    pages: {
      type: Number,
      required: true,
    },
    current: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    simple: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{ click: [_nextPage: number] }>();

  const { t } = useI18n();

  const prefixCls = getPrefixCls('pagination-item');
  const isNext = props.type === 'next';
  const foundation = createStepPagerFoundation(
    {
      get disabled() {
        return props.disabled;
      },
      get pages() {
        return props.pages;
      },
      get current() {
        return props.current;
      },
      get isNext() {
        return isNext;
      },
      get mergedDisabled(): boolean {
        return mergedDisabled.value;
      },
      get nextPage(): number {
        return nextPage.value;
      },
    },
    (page) => emit('click', page),
  );
  const mergedDisabled = computed(foundation.getMergedDisabled);
  const nextPage = computed(foundation.getNextPage);
  const { handleClick, handleKeydown } = foundation;

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${props.type}`,
    {
      [`${prefixCls}-disabled`]: mergedDisabled.value,
    },
  ]);
</script>
