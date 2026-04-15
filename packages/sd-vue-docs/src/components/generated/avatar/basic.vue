<template>
  <sd-space size="large">
    <sd-avatar>A</sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#3370ff' }">
      <IconUser />
    </sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#14a9f8' }">SD</sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#00d0b6' }">Design</sd-avatar>
    <sd-avatar>
      <img
        alt="avatar"
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
      />
    </sd-avatar>
  </sd-space>
</template>

<script>
  import { IconUser } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconUser },
  };
</script>
