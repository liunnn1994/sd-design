<template>
  <sd-row>
    <sd-col :flex="1">
      <sd-countdown title="倒计时" :value="now + 1000 * 60 * 60 * 2" :now="now" />
    </sd-col>
    <sd-col :flex="1">
      <sd-countdown
        title="毫秒"
        :value="now + 1000 * 60 * 60 * 2"
        :now="now"
        format="HH:mm:ss.SSS"
        :animation="false"
      />
    </sd-col>
    <sd-col :flex="1">
      <sd-countdown
        title="天"
        :value="now + 1000 * 60 * 60 * 24 * 4"
        :now="now"
        format="D 天 H 时 m 分 s 秒"
      />
    </sd-col>
  </sd-row>
  <sd-space direction="vertical" class="sd:mt-2.5">
    <sd-countdown
      title="结束时触发"
      :value="Date.now() + 5 * 1000"
      format="mm:ss.SSS"
      :now="Date.now()"
      :start="start"
      @finish="handleFinish"
    />
    <sd-button @click="start = true" type="primary">开始</sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { Message } from '@sdata/web-vue';

  const now = Date.now();
  const start = ref(false);

  const handleFinish = () => {
    Message.info('已结束');
  };
</script>
