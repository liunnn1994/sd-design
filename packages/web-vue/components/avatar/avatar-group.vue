<template>
  <div :class="[prefixCls, { [`${prefixCls}-rtl`]: rtl }]">
    <DefineAvatarContent v-slot="{ children }">
      <RenderVNodes :content="getVisibleAvatars(children)" />
      <Popover v-if="getOverflowAvatars(children).length > 0" v-bind="maxPopoverTriggerProps">
        <Avatar :class="`${prefixCls}-max-count-avatar`" :style="maxStyle">
          +{{ getOverflowAvatars(children).length }}
        </Avatar>
        <template #content>
          <div>
            <RenderVNodes :content="getOverflowAvatars(children)" />
          </div>
        </template>
      </Popover>
    </DefineAvatarContent>
    <ReuseAvatarContent :children="getChildren()" />
  </div>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType, VNode } from 'vue';
  import { computed, defineComponent, inject, provide, reactive, ref, toRef } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TriggerProps } from '../trigger';
  import type { AvatarShape } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Popover from '../popover';
  import Avatar from './avatar.vue';
  import { avatarGroupInjectionKey } from './context';

  defineOptions({ name: 'AvatarGroup' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 头像的形状，有圆形(circle)和正方形(square)两种
       * @en The shape of the avatar in the group, there are two kinds of circle (circle) and square (square)
       * @values 'circle', 'square'
       */
      shape?: AvatarShape;
      /**
       * @zh 头像的尺寸大小，单位是 `px`
       * @en The size of the avatar in the group, the unit is `px`
       */
      size?: number;
      /**
       * @zh 是否自动根据头像尺寸调整字体大小
       * @en Whether to automatically adjust the font size according to the size of the avatar.
       */
      autoFixFontSize?: boolean;
      /**
       * @zh 头像组最多显示的头像数量，多余头像将以 `+x` 的形式展示。
       * @en The maximum number of avatars displayed in the avatar group. The excess avatars will be displayed in the form of `+x`.
       */
      maxCount?: number;
      /**
       * @zh 头像组内的头像 `z-index` 递增，默认是递减。
       * @en The avatar `z-index` in the avatar group increases, and the default is decreasing.
       */
      zIndexAscend?: boolean;
      /**
       * @zh 多余头像样式。
       * @en Style for +x.
       * @version 2.7.0
       */
      maxStyle?: CSSProperties;
      /**
       * @zh 多余头像气泡的 `TriggerProps`
       * @en TriggerProps for popover around +x.
       * @version 2.7.0
       */
      maxPopoverTriggerProps?: TriggerProps;
    }>(),
    {
      shape: 'circle',
      autoFixFontSize: true,
      maxCount: 0,
      zIndexAscend: false,
    },
  );

  const slots = defineSlots<{
    default?: () => VNode[];
  }>();
  const [DefineAvatarContent, ReuseAvatarContent] = createReusableTemplate<{
    children: VNode[];
  }>();
  const RenderVNodes = defineComponent({
    name: 'AvatarGroupRenderVNodes',
    props: {
      content: {
        type: Array as PropType<VNode[]>,
        required: true,
      },
    },
    setup(renderProps) {
      return () => renderProps.content;
    },
  });
  const prefixCls = getPrefixCls('avatar-group');
  const configCtx = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configCtx?.rtl ?? false);
  const total = ref(0);
  const getChildren = () => {
    const children = getAllElements(slots.default?.() ?? []);
    total.value = children.length;
    return children;
  };
  const getVisibleAvatars = (children: VNode[]) =>
    props.maxCount > 0 ? children.slice(0, props.maxCount) : children;
  const getOverflowAvatars = (children: VNode[]) =>
    props.maxCount > 0 ? children.slice(props.maxCount) : [];

  provide(
    avatarGroupInjectionKey,
    reactive({
      shape: toRef(props, 'shape'),
      size: toRef(props, 'size'),
      autoFixFontSize: toRef(props, 'autoFixFontSize'),
      zIndexAscend: toRef(props, 'zIndexAscend'),
      total,
      rtl,
    }),
  );
</script>
