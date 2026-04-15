<template>
  <div>
    <sd-row align="center" :style="{ marginBottom: '24px' }">
      <sd-typography-text>mode: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onChange" :modelValue="mode">
        <sd-radio value="left">left</sd-radio>
        <sd-radio value="right">right</sd-radio>
        <sd-radio value="alternate">alternate</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-timeline :mode="mode" labelPosition="relative">
      <sd-timeline-item label="2012-08">
        <sd-row :style="{ display: 'inline-flex', alignItems: 'center' }">
          <img
            width="40"
            :style="{ marginRight: '16px', marginBottom: '12px' }"
            src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/b5d834b83708a269b4562924436eac48.png~tplv-uwbnlip3yd-png.png"
          />
          <div :style="{ marginBottom: '12px' }">
            Toutiao
            <div :style="{ fontSize: '12px', color: '#4E5969' }"> Founded in 2012 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
      <sd-timeline-item label="2017-05">
        <sd-row :style="{ display: 'inline-flex', alignItems: 'center' }">
          <img
            width="40"
            :style="{ marginRight: '16px', marginBottom: '12px' }"
            src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png"
          />
          <div :style="{ marginBottom: '12px' }">
            Xigua Video
            <div :style="{ fontSize: '12px', color: '#4E5969' }"> Founded in 2017 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
      <sd-timeline-item label="2018-07">
        <sd-row :style="{ display: 'inline-flex', alignItems: 'center' }">
          <img
            width="40"
            :style="{ marginRight: '16px', marginBottom: '12px' }"
            src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/385ed540c359ec8a9b9ce2b5fe89b098.png~tplv-uwbnlip3yd-png.png"
          />
          <div :style="{ marginBottom: '12px' }">
            Pipidance
            <div :style="{ fontSize: '12px', color: '#4E5969' }"> Founded in 2018 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const mode = ref('left');

      const onChange = (_mode) => {
        mode.value = _mode;
      };

      return {
        mode,
        onChange,
      };
    },
  };
</script>
