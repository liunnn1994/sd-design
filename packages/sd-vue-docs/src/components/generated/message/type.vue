<template>
  <div>
    <a-space>
      <a-button @click="() => this.$message.info('This is an info message!')"
        >Info Message</a-button
      >
      <a-button @click="() => this.$message.success('This is a success message!')" status="success"
        >Success Message
      </a-button>
      <a-button @click="() => this.$message.warning('This is a warning message!')" status="warning"
        >Warning Message
      </a-button>
      <a-button @click="() => this.$message.error('This is an error message!')" status="danger"
        >Error Message</a-button
      >
    </a-space>
  </div>
  <div style="margin-top: 20px">
    <a-space>
      <a-button @click="() => this.$message.normal('This is a normal message!')"
        >Normal Message</a-button
      >
      <a-button
        @click="
          () =>
            this.$message.normal({
              content: 'This is a normal message!',
              icon: renderIcon,
            })
        "
        >Normal Message With Icon
      </a-button>
      <a-button @click="() => this.$message.loading('This is a loading message!')" status="primary"
        >Loading Message
      </a-button>
    </a-space>
  </div>
</template>

<script>
  import { h } from 'vue';

  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';

  export default {
    setup() {
      const renderIcon = () => h(IconExclamationCircleFill);
      return {
        renderIcon,
      };
    },
  };
</script>
