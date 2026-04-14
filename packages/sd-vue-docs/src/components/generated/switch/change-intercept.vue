<template>
  <a-space size="large">
    <a-switch :beforeChange="handleChangeIntercept" />
    <a-switch type="round" :beforeChange="handleChangeIntercept2" />
    <a-switch type="line" :beforeChange="handleChangeIntercept3" />
  </a-space>
</template>

<script>
  import { Message } from '@sdata/web-vue';

  export default {
    setup() {
      const handleChangeIntercept = async (newValue) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      };

      const handleChangeIntercept2 = async (newValue) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!newValue) {
          Message.error("OH, You can't change");
          return false;
        }
        return true;
      };

      const handleChangeIntercept3 = async (newValue) => {
        await new Promise((_, reject) =>
          setTimeout(() => {
            Message.error('OH, Something went wrong');
            reject();
          }, 1000),
        );
        return true;
      };

      return {
        handleChangeIntercept,
        handleChangeIntercept2,
        handleChangeIntercept3,
      };
    },
  };
</script>
