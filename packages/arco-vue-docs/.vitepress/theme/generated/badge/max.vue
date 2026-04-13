<template>
  <a-space :size="40">
    <a-badge :max-count="10" :count="0">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
    <a-badge :max-count="10" :count="100">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
    <a-badge :count="100">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
    <a-badge :max-count="999" :count="1000">
      <a-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </a-avatar>
    </a-badge>
  </a-space>
</template>

<script>
import { IconUser } from '@arco-design/web-vue/es/icon';

export default {
  components: { IconUser },
};
</script>
