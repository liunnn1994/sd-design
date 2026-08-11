<template>
  <DefineItem>
    <div
      role="listitem"
      :class="[
        prefixCls,
        {
          [`${prefixCls}-with-dropdown`]: hasDroplist,
        },
      ]"
      :aria-label="displayMore ? t('a11y.breadcrumbEllipsis') : undefined"
      v-bind="$attrs"
    >
      <template v-if="displayMore">
        <component
          :is="breadcrumbCtx.slots['more-icon']"
          v-if="breadcrumbCtx?.slots['more-icon']"
        />
        <IconMore v-else />
      </template>
      <slot v-else />
      <span
        v-if="hasDroplist"
        aria-hidden="true"
        :class="[
          `${prefixCls}-dropdown-icon`,
          {
            [`${prefixCls}-dropdown-icon-active`]: dropdownVisible,
          },
        ]"
      >
        <IconDown />
      </span>
    </div>
  </DefineItem>

  <template v-if="show">
    <Dropdown
      v-if="hasDroplist"
      :popup-visible="dropdownVisible"
      @popup-visible-change="handleVisibleChange"
      v-bind="dropdownProps"
    >
      <ReuseItem />
      <template #content>
        <slot v-if="$slots.droplist" name="droplist" />
        <template v-else>
          <Doption v-for="item in droplist" :key="item.path" :value="item.path">
            {{ item.label }}
          </Doption>
        </template>
      </template>
    </Dropdown>
    <ReuseItem v-else />

    <div v-if="showSeparator" aria-hidden="true" :class="`${prefixCls}-separator`">
      <slot v-if="$slots.separator" name="separator" />
      <template v-else-if="separator != null">{{ separator }}</template>
      <component :is="breadcrumbCtx.slots.separator" v-else-if="breadcrumbCtx?.slots.separator" />
      <template v-else-if="breadcrumbCtx?.separator != null">
        {{ breadcrumbCtx.separator }}
      </template>
      <IconObliqueLine v-else />
    </div>
  </template>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed, inject, ref } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { DropDownProps } from '../dropdown';
  import type { BreadcrumbRoute } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Dropdown, { Doption } from '../dropdown';
  import IconDown from '../icon/icon-down';
  import IconMore from '../icon/icon-more';
  import IconObliqueLine from '../icon/icon-oblique-line';
  import { useI18n } from '../locale';
  import { breadcrumbInjectKey } from './context';

  defineOptions({ name: 'BreadcrumbItem', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 分隔符文字
       * @en Delimiter text
       * @version 2.36.0
       */
      separator?: string | number;
      /**
       * @zh 下拉菜单内容
       * @en Dropdown content
       * @version 2.36.0
       */
      droplist?: BreadcrumbRoute['children'];
      /**
       * @zh 下拉菜单属性
       * @en Dropdown props
       * @version 2.36.0
       */
      dropdownProps?: DropDownProps;
      /** @private */
      index?: number;
    }>(),
    {
      index: 0,
    },
  );

  const slots = defineSlots<{
    default?: () => VNode[];
    /**
     * @zh 自定义分隔符
     * @en Custom separator
     * @version 2.36.0
     */
    separator?: () => VNode[];
    /**
     * @zh 自定义下拉菜单
     * @en Custom droplist
     * @version 2.36.0
     */
    droplist?: () => VNode[];
  }>();

  const { t } = useI18n();
  const [DefineItem, ReuseItem] = createReusableTemplate();
  const prefixCls = getPrefixCls('breadcrumb-item');
  const breadcrumbCtx = inject(breadcrumbInjectKey, undefined);
  const dropdownVisible = ref(false);
  const hasDroplist = computed(() => Boolean(props.droplist || slots.droplist));
  const show = computed(() => {
    if (breadcrumbCtx && breadcrumbCtx.needHide) {
      if (props.index > 1 && props.index <= breadcrumbCtx.total - breadcrumbCtx.maxCount) {
        return false;
      }
    }
    return true;
  });
  const displayMore = computed(() => {
    if (breadcrumbCtx && breadcrumbCtx.needHide) {
      return props.index === 1;
    }
    return false;
  });
  const showSeparator = computed(() =>
    breadcrumbCtx ? props.index < breadcrumbCtx.total - 1 : true,
  );

  const handleVisibleChange = (visible: boolean) => {
    dropdownVisible.value = visible;
  };
</script>
