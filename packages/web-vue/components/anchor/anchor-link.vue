<template>
  <li ref="linkRef" :class="cls">
    <a
      :class="linkCls"
      :href="href"
      :aria-current="context?.currentLink === props.href ? 'location' : undefined"
      @click="handleClick"
    >
      <slot>{{ title }}</slot>
    </a>
    <ul v-if="$slots.sublist" :class="`${prefixCls}-sublist`">
      <slot name="sublist" />
    </ul>
  </li>
</template>

<script setup lang="ts">
  import { computed, inject, watchEffect, ref } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { anchorInjectionKey } from './context';

  defineOptions({ name: 'AnchorLink' });

  const props = defineProps({
    /**
     * @zh 锚点链接的文本内容
     * @en The text content of the anchor link
     */
    title: String,
    /**
     * @zh 锚点链接的地址
     * @en The address of the anchor link
     */
    href: String,
  });

  const prefixCls = getPrefixCls('anchor');
  const linkCls = `${prefixCls}-link`;
  const linkRef = ref<HTMLElement>();

  const context = inject(anchorInjectionKey, undefined);

  watchEffect((onCleanup) => {
    if (props.href && linkRef.value) {
      const hash = props.href;
      context?.addLink(hash, linkRef.value);
      onCleanup(() => context?.removeLink(hash));
    }
  });

  const cls = computed(() => [
    `${linkCls}-item`,
    {
      [`${linkCls}-active`]: context?.currentLink === props.href,
    },
  ]);

  const handleClick = (e: MouseEvent) => context?.handleClick(e, props.href);
</script>
