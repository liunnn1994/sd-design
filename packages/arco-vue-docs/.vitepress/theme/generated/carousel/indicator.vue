<template>
  <a-space direction="vertical" size="large">
    <a-radio-group
      type="button"
      @change="updateType"
      style="{ marginBottom: '10px' }"
      :modelValue="indicatorType"
    >
      <a-radio value="dot">dot</a-radio>
      <a-radio value="line">line</a-radio>
      <a-radio value="slider">slider</a-radio>
    </a-radio-group>
    <a-radio-group
      type="button"
      @change="updatePosition"
      :style="{ marginBottom: '20px' }"
      :modelValue="indicatorPosition"
    >
      <a-radio value="left">left</a-radio>
      <a-radio value="right">right</a-radio>
      <a-radio value="top">top</a-radio>
      <a-radio value="bottom">bottom</a-radio>
      <a-radio value="outer">outer</a-radio>
    </a-radio-group>
    <a-carousel
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
      show-arrow="never"
      :style="{
      width: '600px',
      height: '240px',
    }"
    >
      <a-carousel-item v-for="image in images">
        <img
          :src="image"
          :style="{
          width: '100%',
        }"
        />
      </a-carousel-item>
    </a-carousel>
  </a-space>
</template>

<script>
export default {
  data() {
    return {
      images: [
        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',
        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',
        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',
      ],
      indicatorType: 'dot',
      indicatorPosition: 'bottom',
    };
  },
  methods: {
    updateType(type) {
      this.indicatorType = type;
    },
    updatePosition(position) {
      this.indicatorPosition = position;
    },
  },
};
</script>
