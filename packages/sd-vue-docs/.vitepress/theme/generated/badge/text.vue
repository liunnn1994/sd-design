<template>
  <a-space :size="40">
    <a-badge text="NEW">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
    <a-badge text="HOT">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
  </a-space>
</template>

<script>
import { IconUser } from '@sd-design/web-vue/es/icon';

export default {
  components: { IconUser },
};
</script>
