<template>
  <div role="list" :aria-label="t('a11y.breadcrumb')" :class="prefixCls">
    <RenderChildren v-if="$slots.default" />
    <template v-else>
      <BreadcrumbItem
        v-for="entry in routeEntries"
        :key="entry.route.path || entry.route.label"
        :index="entry.index"
        :droplist="entry.route.children"
      >
        <slot name="item-render" :route="entry.route" :routes="routes ?? []" :paths="entry.paths">
          <span v-if="entry.last">{{ entry.route.label }}</span>
          <a v-else :href="entry.href">{{ entry.route.label }}</a>
        </slot>
      </BreadcrumbItem>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed, mergeProps, provide, reactive, ref, toRef, watchEffect } from 'vue';

  import type { BreadcrumbRoute } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';
  import { useI18n } from '../locale';
  import BreadcrumbItem from './breadcrumb-item.vue';
  import { breadcrumbInjectKey } from './context';

  defineOptions({ name: 'Breadcrumb' });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 最多展示的面包屑数量（0表示不限制）
       * @en Maximum number of breadcrumbs displayed (0 means no limit)
       */
      maxCount?: number;
      /**
       * @zh 设置路径
       * @en Set routes
       * @version 2.36.0
       */
      routes?: BreadcrumbRoute[];
      /**
       * @zh 分隔符文字
       * @en Delimiter text
       * @version 2.36.0
       */
      separator?: string | number;
      /**
       * @zh 自定义链接地址
       * @en Custom link address
       * @version 2.36.0
       */
      customUrl?: (paths: string[]) => string;
    }>(),
    {
      maxCount: 0,
    },
  );

  const slots = defineSlots<{
    'default'?: () => VNode[];
    /**
     * @zh 自定义分隔符
     * @en Custom separator
     */
    'separator'?: () => VNode[];
    /**
     * @zh routes 设置时生效，自定义渲染面包屑
     * @en Effective when setting routes, custom render breadcrumbs
     * @version 2.36.0
     */
    'item-render'?: (props: {
      route: BreadcrumbRoute;
      routes: BreadcrumbRoute[];
      paths: string[];
    }) => VNode[];
    /**
     * @zh 自定义更多图标
     * @en Custom more icon
     * @version 2.36.0
     */
    'more-icon'?: () => VNode[];
  }>();

  const { t } = useI18n();
  const prefixCls = getPrefixCls('breadcrumb');
  const total = ref(0);
  const maxCount = toRef(props, 'maxCount');
  const separator = toRef(props, 'separator');
  const needHide = computed(() => maxCount.value > 0 && total.value > maxCount.value + 1);

  provide(
    breadcrumbInjectKey,
    reactive({
      total,
      maxCount,
      separator,
      needHide,
      slots,
    }),
  );

  watchEffect(() => {
    if (!slots.default) {
      total.value = props.routes?.length ?? 0;
    }
  });

  const routeEntries = computed(() => {
    if (!props.routes?.length) {
      return [];
    }

    const paths: string[] = [];
    return props.routes.map((route, index, origin) => {
      paths.push((route.path || '').replace(/^\//, ''));
      const currentPaths = [...paths];
      return {
        route,
        index,
        paths: currentPaths,
        last: index === origin.length - 1,
        href: props.customUrl?.(currentPaths) ?? `#/${currentPaths.join('/').replace(/^\//, '')}`,
      };
    });
  });

  const RenderChildren = () => {
    const children = getAllElements(slots.default?.() ?? []);
    if (total.value !== children.length) {
      total.value = children.length;
    }
    return children.map((child, index) => {
      child.props = mergeProps(child.props ?? {}, { index });
      return child;
    });
  };
</script>
