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

  import BTween from 'b-tween';

  import { on, off } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { isString } from '../_utils/is';
  import { throttleByRaf } from '../_utils/throttle-by-raf';
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
  let tween: InstanceType<typeof BTween> | undefined;

  const scrollHandler = throttleByRaf(() => {
    if (target.value) {
      const { visibleHeight } = props;
      const { scrollTop } = target.value;
      visible.value = scrollTop >= visibleHeight;
    }
  });

  const getContainer = (container: string | HTMLElement) => {
    if (isString(container)) {
      return document.querySelector(container) as HTMLElement;
    }
    return container;
  };

  onMounted(() => {
    watch(
      () => props.targetContainer,
      (container, _previous, onCleanup) => {
        target.value = container ? getContainer(container) : document.documentElement;
        visible.value = false;
        if (target.value) {
          const eventTarget = container ? target.value : window;
          on(eventTarget, 'scroll', scrollHandler);
          scrollHandler();
          onCleanup(() => {
            off(eventTarget, 'scroll', scrollHandler);
            scrollHandler.cancel();
            tween?.stop();
          });
        }
      },
      { immediate: true },
    );
  });

  watch(() => props.visibleHeight, scrollHandler);

  onUnmounted(() => {
    scrollHandler.cancel();
    tween?.stop();
  });

  const scrollToTop = () => {
    tween?.stop();
    if (target.value) {
      if (props.duration <= 0 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        target.value.scrollTop = 0;
        return;
      }

      const { scrollTop } = target.value;
      tween = new BTween({
        from: { scrollTop },
        to: { scrollTop: 0 },
        easing: props.easing,
        duration: props.duration,
        onUpdate: (keys: any) => {
          if (target.value) {
            target.value.scrollTop = keys.scrollTop;
          }
        },
      });
      tween.start();
      // props.onClick && props.onClick();
    }
  };
</script>
