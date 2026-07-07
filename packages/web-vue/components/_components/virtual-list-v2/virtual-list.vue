<template>
  <Component
    :is="containerComponent"
    ref="containerRef"
    :class="prefixCls"
    :style="style"
    v-bind="containerProps"
    @scroll="onScroll"
  >
    <Component
      :is="mergedComponent.list"
      v-bind="listAttrs"
      :style="
        paddingPosition === 'list'
          ? {
              paddingTop: `${frontPadding}px`,
              paddingBottom: `${behindPadding}px`,
            }
          : {}
      "
    >
      <Component
        :is="mergedComponent.content"
        ref="contentRef"
        v-bind="contentAttrs"
        :style="
          paddingPosition === 'content'
            ? {
                paddingTop: `${frontPadding}px`,
                paddingBottom: `${behindPadding}px`,
              }
            : {}
        "
      >
        <VirtualListItem
          v-for="(item, index) of currentList"
          :key="item[itemKey] ?? start + index"
          :has-item-size="hasItemSize"
          :set-item-size="setItemSize"
        >
          <slot name="item" :item="item" :index="start + index" />
        </VirtualListItem>
      </Component>
    </Component>
  </Component>
</template>

<script lang="ts">
  import type { ComponentPublicInstance, PropType } from 'vue';
  import { computed, defineComponent, nextTick, ref, toRefs } from 'vue';

  import type { ScrollbarExpose, ScrollbarProps } from '../../scrollbar';

  import { getPrefixCls } from '../../_utils/global-config';
  import { isNumber, isObject } from '../../_utils/is';
  import Scrollbar from '../../scrollbar';
  import { useSize } from './hooks/use-size';
  import { ScrollOptions } from './interface';
  import VirtualListItem from './virtual-list-item';

  type ScrollbarInstance = ComponentPublicInstance & ScrollbarExpose;
  type ContainerRef = HTMLElement | ScrollbarInstance;

  export default defineComponent({
    name: 'VirtualList',
    components: { Scrollbar, VirtualListItem },
    props: {
      height: {
        type: [Number, String],
        default: 200,
      },
      data: {
        type: Array as PropType<Record<string, any>[]>,
        default: () => [],
      },
      threshold: {
        type: Number,
        default: 0,
      },
      itemKey: {
        type: String,
        default: 'key',
      },
      fixedSize: {
        type: Boolean,
        default: false,
      },
      estimatedSize: {
        type: Number,
        default: 30,
      },
      buffer: {
        type: Number,
        default: 10,
      },
      component: {
        type: [String, Object],
        default: 'div',
      },
      listAttrs: {
        type: Object,
      },
      contentAttrs: {
        type: Object,
      },
      paddingPosition: {
        type: String,
        default: 'content',
      },
      scrollbar: {
        type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
        default: false,
      },
    },
    emits: {
      scroll: (ev: Event) => true,
      reachBottom: (ev: Event) => true,
    },
    setup(props, { emit }) {
      const { data, itemKey, fixedSize, estimatedSize, buffer, height } = toRefs(props);
      const prefixCls = getPrefixCls('virtual-list');
      const mergedComponent = computed(() => {
        if (isObject(props.component)) {
          return {
            container: 'div',
            list: 'div',
            content: 'div',
            ...props.component,
          };
        }
        return {
          container: props.component,
          list: 'div',
          content: 'div',
        };
      });

      const containerRef = ref<ContainerRef>();
      const contentRef = ref<HTMLElement>();
      const scrollbarEnabled = computed(() => props.scrollbar !== false);
      const scrollbarProps = computed<ScrollbarProps>(() =>
        isObject(props.scrollbar) ? props.scrollbar : {},
      );
      const containerComponent = computed(() =>
        scrollbarEnabled.value ? Scrollbar : mergedComponent.value.container,
      );

      const style = computed(() => {
        const heightValue = isNumber(height.value) ? `${height.value}px` : height.value;
        return {
          height: heightValue,
          overflow: scrollbarEnabled.value ? 'hidden' : 'auto',
        };
      });

      const containerProps = computed(() => {
        if (!scrollbarEnabled.value) {
          return {};
        }

        const { outerStyle, ...rest } = scrollbarProps.value;
        const heightStyle = { height: style.value.height };

        return {
          ...rest,
          outerStyle: Array.isArray(outerStyle)
            ? [heightStyle, ...outerStyle]
            : outerStyle
              ? [heightStyle, outerStyle]
              : heightStyle,
        };
      });

      const getScrollElement = () => {
        const value = containerRef.value;
        if (!value) {
          return undefined;
        }
        if (typeof (value as HTMLElement).scrollTop === 'number') {
          return value as HTMLElement;
        }

        const elements = (value as ScrollbarInstance).elements?.();
        return (
          elements?.scrollOffsetElement ??
          elements?.viewport ??
          ((value as ComponentPublicInstance).$el as HTMLElement)
        );
      };

      const setContainerScrollTop = (top: number) => {
        const value = containerRef.value;
        if (value && typeof (value as ScrollbarInstance).scrollTop === 'function') {
          (value as ScrollbarInstance).scrollTop(top);
          return;
        }

        const element = getScrollElement();
        if (element) {
          element.scrollTop = top;
        }
      };

      const getContainerScrollTop = () => getScrollElement()?.scrollTop ?? 0;

      const dataKeys = computed(() =>
        data.value.map((item: any, index) => {
          return (item[itemKey.value] ?? index) as string | number;
        }),
      );

      const {
        frontPadding,
        behindPadding,
        start,
        end,
        getStartByScroll,
        setItemSize,
        hasItemSize,
        setStart,
        getScrollOffset,
      } = useSize({
        dataKeys,
        fixedSize,
        estimatedSize,
        buffer,
      });

      const currentList = computed(() => {
        if (props.threshold && data.value.length <= props.threshold) {
          return data.value;
        }

        return data.value.slice(start.value, end.value);
      });

      const onScroll = (ev: Event) => {
        const { scrollTop, scrollHeight, offsetHeight } = ev.target as HTMLElement;
        const _start = getStartByScroll(scrollTop);
        if (_start !== start.value) {
          setStart(_start);
          nextTick(() => {
            scrollTo(scrollTop);
          });
        }
        emit('scroll', ev);
        const bottom = Math.floor(scrollHeight - (scrollTop + offsetHeight));
        if (bottom <= 0) {
          emit('reachBottom', ev);
        }
      };

      const scrollTo = (options: ScrollOptions) => {
        if (!containerRef.value) {
          return;
        }

        if (isNumber(options)) {
          setContainerScrollTop(options);
          return;
        }

        const _index = options.index ?? dataKeys.value.indexOf(options.key ?? '');
        setStart(_index - buffer.value);
        setContainerScrollTop(getScrollOffset(_index));
        nextTick(() => {
          const _scrollTop = getScrollOffset(_index);
          if (_scrollTop !== getContainerScrollTop()) {
            setContainerScrollTop(_scrollTop);
          }
        });
      };

      return {
        prefixCls,
        containerRef,
        contentRef,
        frontPadding,
        currentList,
        behindPadding,
        onScroll,
        setItemSize,
        hasItemSize,
        start,
        scrollTo,
        style,
        containerProps,
        containerComponent,
        mergedComponent,
      };
    },
  });
</script>
