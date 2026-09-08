<template>
  <a-input
    ref="inputRef"
    :type="mergedVisible ? 'password' : 'text'"
    :fit-width="fitWidth"
    :max-w-full="maxWFull"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="invisibleButton || $slots.suffix" #suffix>
      <a-icon-hover
        v-if="invisibleButton"
        @click="handleInvisible"
        @mousedown.prevent
        @mouseup.prevent
      >
        <icon-eye v-if="!mergedVisible" />
        <icon-eye-invisible v-else />
      </a-icon-hover>
      <slot name="suffix" />
    </template>

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </a-input>
</template>

<script setup lang="ts">
  import { reactive, ref, toRefs } from 'vue';

  import AIconHover from '../_components/icon-hover.vue';
  import useMergeState from '../_hooks/use-merge-state';
  import IconEye from '../icon/icon-eye';
  import IconEyeInvisible from '../icon/icon-eye-invisible';
  import AInput from './input.vue';

  defineOptions({ name: 'InputPassword' });

  const props = defineProps({
    /**
     * @zh 是否为掩码（隐藏）状态，受控属性。true 表示输入框显示为密码掩码态（type=password，显示 eye-invisible 图标）
     * @en Whether the input is in the masked (hidden) state. `true` renders the input masked (type=password, shows the eye-invisible icon)
     * @vModel
     */
    visibility: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 默认是否为掩码状态，非受控
     * @en Whether the input is masked by default
     */
    defaultVisibility: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示可见按钮
     * @en Whether to show visible buttons
     */
    invisibleButton: {
      type: Boolean,
      default: true,
    },
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
    /**
     * @zh visibility 改变时触发，载荷与 visibility 语义一致（true 表示掩码态）
     * @en Callback when visibility changes; the payload follows the visibility semantics (true means masked)
     * @param {boolean} visible
     */
    'visibility-change': [_visible: boolean];
    'update:visibility': [_visible: boolean];
  }>();

  const { visibility, defaultVisibility } = toRefs(props);
  const inputRef = ref();

  // NOTE: `visibility`/`mergedVisible` follow arco's inherited inverted naming:
  // true = masked (type="password"), false = plaintext. This is documented in
  // the prop JSDoc; the tests in input/__test__/index.cy.ts pin this behavior.
  const handleInvisible = () => {
    setVisible(!mergedVisible.value);
  };

  const [mergedVisible, setLocalVisible] = useMergeState(
    defaultVisibility.value,
    reactive({
      value: visibility,
    }),
  );

  const setVisible = (newVisible: boolean) => {
    if (newVisible !== mergedVisible.value) {
      emit('visibility-change', newVisible);
      emit('update:visibility', newVisible);
      setLocalVisible(newVisible);
    }
  };

  const focus = () => {
    (inputRef.value as HTMLInputElement)?.focus();
  };

  const blur = () => {
    (inputRef.value as HTMLInputElement)?.blur();
  };

  defineExpose({ focus, blur });
</script>
