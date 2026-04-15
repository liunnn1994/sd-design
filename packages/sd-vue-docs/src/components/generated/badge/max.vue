<template>
  <sd-space :size="40">
    <sd-badge :max-count="10" :count="0">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :max-count="10" :count="100">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :count="100">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :max-count="999" :count="1000">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
  </sd-space>
</template>

<script>
  import { IconUser } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconUser },
  };
</script>
