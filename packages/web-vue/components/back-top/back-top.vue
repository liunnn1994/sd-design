<template>
  <transition name="fade-in">
    <div v-if="visible" :class="prefixCls" @click="scrollToTop">
      <slot>
        <button type="button" :class="`${prefixCls}-btn`" :aria-label="t('a11y.backToTop')">
          <icon-to-top />
        </button>
      </slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { onMounted, onUnmounted, ref, watch } from 'vue';

  import { createBackTop } from '@sdata/web-core/back-top/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import IconToTop from '../icon/icon-to-top';
  import { useI18n } from '../locale';

  defineOptions({ name: 'BackTop' });

  const props = defineProps({
    /**
     * @zh 显示回到顶部按钮的触发滚动高度
     * @en Display the trigger scroll height of the back to top button
     */
    visibleHeight: {
      type: Number as PropType<number>,
      default: 200,
    },
    /**
     * @zh 滚动事件的监听容器
     * @en Scroll event listener container
     */
    targetContainer: {
      type: [String, Object] as PropType<string | HTMLElement>,
    },
    /**
     * @zh 滚动动画的缓动方式，可选值参考 [BTween](https://github.com/PengJiyuan/b-tween)
     * @en Easing mode of scrolling animation, refer to [BTween](https://github.com/PengJiyuan/b-tween) for optional values
     */
    easing: {
      type: String,
      default: 'quartOut',
    },
    /**
     * @zh 滚动动画的持续时间
     * @en Duration of scroll animation
     */
    duration: {
      type: Number,
      default: 200,
    },
  });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('back-top');
  const visible = ref(false);
  const target = ref<HTMLElement>();
  const foundation = createBackTop({
    props,
    get target() {
      return target.value;
    },
    set target(value) {
      target.value = value;
    },
    setVisible(value) {
      visible.value = value;
    },
  });
  onMounted(() => {
    watch(
      () => props.targetContainer,
      (_container, _previous, onCleanup) => {
        const cleanup = foundation.connect();
        if (cleanup) onCleanup(cleanup);
      },
      { immediate: true },
    );
  });
  watch(() => props.visibleHeight, foundation.scroll);
  onUnmounted(foundation.dispose);
  const scrollToTop = foundation.toTop;
</script>
