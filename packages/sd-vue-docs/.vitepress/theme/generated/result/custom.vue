<template>
  <a-result :status="null" title="This is title content" subtitle="This is subtitle content">
    <template #icon>
      <IconFaceSmileFill />
    </template>
    <template #extra>
      <a-space>
        <a-button type="secondary">Again</a-button>
        <a-button type="primary">Back</a-button>
      </a-space>
    </template>
  </a-result>
</template>
<script>
import { IconFaceSmileFill } from '@sd-design/web-vue/es/icon';

export default {
  components: {
    IconFaceSmileFill
  },
}
</script>
