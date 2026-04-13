<template>
  <span v-if="level > 1" :class="`${prefixCls}-indent-list`">
    <span
      v-for="index in level - 1"
      :key="index"
      :class="`${prefixCls}-indent`"
      :style="`width: ${levelIndent}px`"
    />
  </span>
</template>
<script>
  import { defineComponent, toRef } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import useMenuContext from './hooks/use-menu-context';

  export default defineComponent({
    name: 'MenuIndent',
    props: {
      level: {
        type: Number,
        default: 1,
      },
    },
    setup() {
      const prefixCls = getPrefixCls('menu');
      const menuContext = useMenuContext();

      return {
        prefixCls,
        levelIndent: toRef(menuContext, 'levelIndent'),
      };
    },
  });
</script>
