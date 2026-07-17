<template>
  <div :class="cls">
    <div :class="`${prefixCls}-wrapper`">
      <div v-if="$slots.breadcrumb" :class="`${prefixCls}-breadcrumb`">
        <slot name="breadcrumb" />
      </div>
      <div :class="`${prefixCls}-header`">
        <span :class="`${prefixCls}-main`">
          <a-icon-hover
            v-if="showBack"
            :class="`${prefixCls}-back-btn`"
            :prefix="prefixCls"
            role="button"
            tabindex="0"
            aria-label="Back"
            @click="handleBack"
            @keydown="handleBackKeydown"
          >
            <slot name="back-icon">
              <icon-left />
            </slot>
          </a-icon-hover>
          <span :class="`${prefixCls}-title`">
            <slot name="title">{{ title }}</slot>
          </span>
          <span v-if="$slots.subtitle || subtitle" :class="`${prefixCls}-divider`" />
          <span v-if="$slots.subtitle || subtitle" :class="`${prefixCls}-subtitle`">
            <slot name="subtitle">{{ subtitle }}</slot>
          </span>
        </span>
        <span v-if="$slots.extra" :class="`${prefixCls}-extra`">
          <slot name="extra" />
        </span>
      </div>
    </div>
    <div v-if="$slots.default" :class="`${prefixCls}-content`">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  import AIconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import IconLeft from '../icon/icon-left';

  defineOptions({ name: 'PageHeader' });

  const props = defineProps({
    /**
     * @zh 页头的主标题
     * @en Main title
     */
    title: String,
    /**
     * @zh 页头的次标题
     * @en Subtitle
     */
    subtitle: String,
    /**
     * @zh 是否显示返回按钮
     * @en Whether to show the back button
     */
    showBack: {
      type: Boolean,
      default: true,
    },
  });

  /**
   * @zh 点击返回按钮时触发
   * @en Emitted when the back button is clicked
   * @property {Event} event
   */
  const emit = defineEmits<{ back: [_e: Event] }>();

  /**
   * @zh 返回按钮
   * @en Back icon
   * @slot back-icon
   * @version 2.36.0
   */
  /**
   * @zh 主标题
   * @en Main title
   * @slot title
   */
  /**
   * @zh 次标题
   * @en Subtitle
   * @slot subtitle
   */
  /**
   * @zh 面包屑
   * @en Breadcrumb
   * @slot breadcrumb
   */
  /**
   * @zh 额外的展示内容
   * @en Extra content
   * @slot extra
   */
  const slots = useSlots();

  const prefixCls = getPrefixCls('page-header');

  const handleBack = (e: Event) => {
    emit('back', e);
  };

  // role=button 的返回键：键盘 Enter/Space 触发（图标按钮无原生按钮语义）
  const handleBackKeydown = (ev: KeyboardEvent) => {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      handleBack(ev);
    }
  };

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-with-breadcrumb`]: Boolean(slots.breadcrumb),
      [`${prefixCls}-with-content`]: Boolean(slots.default),
    },
  ]);
</script>
