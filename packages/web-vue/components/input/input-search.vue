<template>
  <Input
    ref="inputRef"
    :class="prefixCls"
    :size="mergedSize"
    :disabled="disabled"
    :fit-width="fitWidth"
    :max-w-full="maxWFull"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="searchButton ? $slots.suffix : true" #suffix>
      <slot v-if="searchButton" name="suffix" />
      <template v-else>
        <IconLoading v-if="loading" />
        <IconHover v-else @click="handleClick">
          <IconSearch />
        </IconHover>
        <slot name="suffix" />
      </template>
    </template>
    <template v-if="searchButton || $slots.append" #append>
      <Button
        v-if="searchButton"
        type="primary"
        :class="`${prefixCls}-btn`"
        :disabled="disabled"
        :size="mergedSize"
        :loading="loading"
        v-bind="buttonProps"
        @click="handleClick"
      >
        <template v-if="$slots['button-default'] || buttonText" #default>
          <slot name="button-default">{{ buttonText }}</slot>
        </template>
        <template v-if="$slots['button-icon']" #icon>
          <slot name="button-icon" />
        </template>
        <template v-else-if="!buttonText && !$slots['button-default']" #icon>
          <IconSearch />
        </template>
      </Button>
      <slot v-else name="append" />
    </template>
  </Input>
</template>

<script setup lang="ts">
  import { ref, toRef, type PropType } from 'vue';

  import type { Size } from '../_utils/constant';
  import type { ButtonProps } from '../button';

  import IconHover from '../_components/icon-hover.vue';
  import { useSize } from '../_hooks/use-size';
  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconLoading from '../icon/icon-loading';
  import IconSearch from '../icon/icon-search';
  import Input from './input.vue';

  defineOptions({ name: 'InputSearch' });

  const props = defineProps({
    /**
     * @zh 是否为后置按钮模式
     * @en Whether it is the rear button mode
     */
    searchButton: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否为加载中状态
     * @en Whether it is loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 输入框大小
     * @en Input size
     * @values 'mini','small','medium','large'
     * @defaultValue 'medium'
     */
    size: String as PropType<Size>,
    /**
     * @zh 搜索按钮的文字，使用后会替换原本的图标
     * @en The text of the search button will replace the original icon after use
     * @version 2.16.0
     */
    buttonText: String,
    /**
     * @zh 搜索按钮的属性
     * @en Button props
     */
    buttonProps: Object as PropType<ButtonProps>,
    /**
     * @zh 宽度是否适应文字内容
     * @en Whether the width adapts to the text content
     */
    fitWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 最大宽度是否限制为父容器宽度
     * @en Whether the maximum width is limited to the parent container width
     */
    maxWFull: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    search: [value: string, event: MouseEvent];
  }>();

  const prefixCls = getPrefixCls('input-search');
  const { mergedSize } = useSize(toRef(props, 'size'));
  const inputRef = ref<InstanceType<typeof Input>>();

  const handleClick = (event: MouseEvent) => {
    if (inputRef.value?.inputRef) {
      emit('search', inputRef.value.inputRef.value, event);
    }
  };

  const focus = () => {
    inputRef.value?.focus();
  };

  const blur = () => {
    inputRef.value?.blur();
  };

  defineExpose({ inputRef, focus, blur });
</script>
