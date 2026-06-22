<template>
  <component :is="tagName" :class="classNames">
    <slot />
  </component>
</template>

<script setup lang="ts">
  import { computed, inject, provide, ref, useSlots } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import { LayoutContextInjectionKey } from './context';
  import { useHasSider } from './hooks/use-has-sider';

  defineOptions({ name: 'Layout' });

  const props = defineProps({
    /**
     * @zh 是否包含 Sider，设为布尔值时会覆盖自动检测
     * @en Whether contains Sider, overrides auto detection when set to a boolean
     */
    hasSider: {
      type: Boolean,
      default: undefined,
    },
  });

  const tagName = 'div';
  const prefixCls = getPrefixCls('layout');
  const slots = useSlots();

  const siders = ref<string[]>([]);

  const slotVNodes = computed(() => slots.default?.());
  const mergedHasSider = useHasSider(
    siders,
    slotVNodes,
    computed(() => props.hasSider),
  );

  const configProvider = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configProvider?.rtl ?? false);

  const classNames = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-has-sider`]: mergedHasSider.value,
      [`${prefixCls}-rtl`]: rtl.value,
    },
  ]);

  provide(LayoutContextInjectionKey, {
    siderHook: {
      addSider(id: string) {
        siders.value = [...siders.value, id];
      },
      removeSider(id: string) {
        siders.value = siders.value.filter((currentId) => currentId !== id);
      },
    },
  });
</script>
