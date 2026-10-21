<template>
  <div ref="rootRef" :class="classNames">
    <Input
      auto-size
      :input-attrs="{ 'aria-label': t('a11y.editText') }"
      :model-value="text"
      @blur="onBlur"
      @input="onChange"
      @keydown.enter="onEnter"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  import { createTypographyEditFoundation } from '@sdata/web-core/typography/edit';

  import { getPrefixCls } from '../_utils/global-config';
  import Input from '../input';
  import { useI18n } from '../locale';

  defineOptions({ name: 'TypographyEditContent' });

  defineProps({
    text: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits<{
    'change': [_value: string];
    'end': [];
    'update:text': [_value: string];
  }>();

  const { t } = useI18n();

  const prefixCls = getPrefixCls('typography');
  const classNames = [`${prefixCls}-edit-content`];
  const rootRef = ref<HTMLElement>();

  const foundation = createTypographyEditFoundation(
    {
      get rootElement() {
        return rootRef.value;
      },
    },
    {
      update: (value) => emit('update:text', value),
      change: (value) => emit('change', value),
      end: () => emit('end'),
    },
  );
  const { onChange, onEnd, onEnter } = foundation;
  onMounted(foundation.focusInput);
  const onBlur = onEnd;
</script>
