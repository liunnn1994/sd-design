<template>
  <div ref="rootRef" :class="classNames">
    <Input
      auto-size
      :input-attrs="{ 'aria-label': t('a11y.editText') }"
      :model-value="text"
      @blur="onBlur"
      @input="onChange"
      @keydown.enter="onEnd"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import Input from '../input';
  import { useI18n } from '../locale';

  defineOptions({ name: 'TypographyEditContent' });

  const props = defineProps({
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

  function onChange(value: string) {
    emit('update:text', value);
    emit('change', value);
  }

  function onEnd() {
    emit('end');
  }

  onMounted(() => {
    // SdInput 的 $el 非普通元素（条件根节点），不能直接 querySelector；改从包裹 div 取 input
    const inputEl = rootRef.value?.querySelector('input');
    if (!inputEl) return;

    inputEl.focus();

    const { length } = inputEl.value;
    inputEl.setSelectionRange(length, length);
  });

  const onBlur = onEnd;
</script>
