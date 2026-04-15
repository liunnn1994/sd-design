<template>
  <sd-space :size="40">
    <sd-badge text="NEW">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge text="HOT">
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
