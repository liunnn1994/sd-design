<template>
  <div
    ref="itemRef"
    :style="outerStyle"
    :class="[
      cls,
      {
        [`${prefixCls}-with-trigger-icon`]: Boolean($slots['trigger-icon']),
        // 添加根据 rtl 变量生成的类名
        [`${prefixCls}-rtl`]: rtl,
      },
    ]"
    @click="onClick"
  >
    <resize-observer @resize="handleResize">
      <span ref="wrapperRef" :class="wrapperCls">
        <template v-if="imageUrl">
          <slot v-if="hasError" name="error">
            <div :class="`${prefixCls}-image-icon`" aria-hidden="true"><IconImageClose /></div>
          </slot>
          <slot v-if="!hasError && !isLoaded">
            <div :class="`${prefixCls}-image-icon`" aria-hidden="true"><IconLoading /></div>
          </slot>
          <img
            v-if="!hasError"
            :src="imageUrl"
            :style="{
              objectFit: objectFit,
            }"
            alt="avatar"
            @load="handleImgLoad"
            @error="handleImgError"
          />
        </template>
        <slot v-else />
      </span>
    </resize-observer>
    <div
      v-if="$slots['trigger-icon']"
      :class="`${prefixCls}-trigger-icon-${triggerType}`"
      :style="computedTriggerIconStyle"
    >
      <slot name="trigger-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    toRefs,
    watch,
    ref,
    onMounted,
    onUpdated,
    nextTick,
    CSSProperties,
    PropType,
    inject,
    useSlots,
    useAttrs,
    shallowRef,
    onBeforeUpdate,
  } from 'vue';

  import {
    createAvatarFoundation,
    getAvatarTriggerIconStyle,
  } from '@sdata/web-core/avatar/foundation';

  import ResizeObserver from '../_components/resize-observer-v2';
  import { useIndex } from '../_hooks/use-index';
  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconImageClose from '../icon/icon-image-close';
  import IconLoading from '../icon/icon-loading';
  import { avatarGroupInjectionKey } from './context';
  import { AvatarShape, AvatarTriggerType, ObjectFit } from './interface';

  defineOptions({ name: 'Avatar' });

  const emit = defineEmits<{
    /**
     * @zh 点击回调
     * @en Callback when clicked
     * @param {MouseEvent} ev
     */
    click: [_ev: MouseEvent];
    /**
     * @zh 图片加载错误
     * @en image load error
     */
    error: [];
    /**
     * @zh 图片加载成功
     * @en image load success
     */
    load: [];
  }>();

  /**
   * @zh 可点击的头像交互图标
   * @en Clickable avatar interaction icon
   * @slot trigger-icon
   */

  const slots = useSlots();
  const defaultSlot = shallowRef(slots.default);
  onBeforeUpdate(() => {
    defaultSlot.value = slots.default;
  });
  const attrs = useAttrs();

  const props = defineProps({
    /**
     * @zh 头像的形状，有圆形(circle)和正方形(square)两种
     * @en The shape of the avatar, there are two kinds of circle (circle) and square (square)
     * @values 'circle', 'square'
     */
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle',
    },
    /**
     * @zh 自定义头像图片地址，如果传入该属性，会默认渲染img标签
     * @en Custom avatar image address. If this attribute is passed in, the img tag will be rendered by default
     * @version 2.40.0
     */
    imageUrl: String,
    /**
     * @zh 头像的尺寸大小，单位是 `px`。未填写时使用样式中的大小 `40px`
     * @en The size of the avatar, the unit is `px`. Use size `40px` in styles when not filled
     */
    size: Number,
    /**
     * @zh 是否自动根据头像尺寸调整字体大小
     * @en Whether to automatically adjust the font size according to the size of the avatar.
     */
    autoFixFontSize: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 可点击的头像交互类型
     * @en Clickable avatar interaction type
     * @values 'mask', 'button'
     */
    triggerType: {
      type: String as PropType<AvatarTriggerType>,
      default: 'button',
    },
    /**
     * @zh 交互图标的样式
     * @en Interactive icon style
     */
    triggerIconStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 图片在容器内的的适应类型
     * @en Object-fit type of the image in the container
     * @version 2.52.0
     */
    objectFit: {
      type: String as PropType<ObjectFit>,
    },
  });

  const { triggerType, triggerIconStyle } = toRefs(props);
  const prefixCls = getPrefixCls('avatar');
  const groupCtx = inject(avatarGroupInjectionKey, undefined);
  const configCtx = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configCtx?.rtl ?? false);

  const itemRef = ref<HTMLDivElement>();
  const wrapperRef = ref<HTMLElement>();
  const foundation: ReturnType<typeof createAvatarFoundation> = createAvatarFoundation(
    {
      props,
      get group() {
        return groupCtx;
      },
      get itemElement() {
        return itemRef.value;
      },
      get wrapperElement() {
        return wrapperRef.value;
      },
      get mergedSize() {
        return mergedSize.value;
      },
      get mergedAutoFixFontSize() {
        return mergedAutoFixFontSize.value;
      },
      get isImage() {
        return isImage.value;
      },
      get index() {
        return index.value;
      },
      get rtl() {
        return rtl.value;
      },
      get hasError() {
        return hasError.value;
      },
      set hasError(value) {
        hasError.value = value;
      },
      get isLoaded() {
        return isLoaded.value;
      },
      set isLoaded(value) {
        isLoaded.value = value;
      },
    },
    {
      afterRender: (task) => {
        void nextTick(task);
      },
      click: (event) => emit('click', event),
      load: () => emit('load'),
      error: () => emit('error'),
    },
  );
  const { autoFixFontSizeHandler, onClick, handleResize, handleImgLoad, handleImgError } =
    foundation;

  const mergedShape = computed(foundation.getMergedShape);
  const mergedSize = computed(foundation.getMergedSize);
  const mergedAutoFixFontSize = computed(foundation.getMergedAutoFixFontSize);
  const isImage = computed(() => {
    const firstChild = getAllElements(defaultSlot.value?.() ?? [])[0];
    if (typeof firstChild?.type === 'object' || typeof firstChild?.type === 'function') {
      const tag = wrapperRef.value?.firstElementChild?.tagName;
      return tag === 'IMG' || tag === 'PICTURE';
    }
    return firstChild?.type === 'img' || firstChild?.type === 'picture';
  });

  const hasError = ref(false);
  const isLoaded = ref(false);

  watch(() => props.imageUrl, foundation.resetImageState);

  const index = groupCtx
    ? useIndex({
        itemRef,
        selector: `.${prefixCls}`,
      }).computedIndex
    : ref(-1);

  const outerStyle = computed(foundation.getOuterStyle);

  const computedTriggerIconStyle = computed(() =>
    getAvatarTriggerIconStyle({
      triggerIconStyle: triggerIconStyle?.value,
      inlineStyle: attrs.style as CSSProperties,
      triggerType: triggerType.value,
    }),
  );

  onMounted(autoFixFontSizeHandler);
  onUpdated(autoFixFontSizeHandler);

  watch([mergedSize, mergedAutoFixFontSize], autoFixFontSizeHandler);

  const cls = computed(() => [prefixCls, `${prefixCls}-${mergedShape.value}`]);
  const wrapperCls = computed(() =>
    isImage.value || props.imageUrl ? `${prefixCls}-image` : `${prefixCls}-text`,
  );
</script>
