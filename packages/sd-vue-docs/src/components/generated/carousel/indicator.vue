<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group
      type="button"
      @change="updateType"
      style="{ marginBottom: '10px' }"
      :modelValue="indicatorType"
    >
      <sd-radio value="dot">dot</sd-radio>
      <sd-radio value="line">line</sd-radio>
      <sd-radio value="slider">slider</sd-radio>
    </sd-radio-group>
    <sd-radio-group
      type="button"
      @change="updatePosition"
      :style="{ marginBottom: '20px' }"
      :modelValue="indicatorPosition"
    >
      <sd-radio value="left">left</sd-radio>
      <sd-radio value="right">right</sd-radio>
      <sd-radio value="top">top</sd-radio>
      <sd-radio value="bottom">bottom</sd-radio>
      <sd-radio value="outer">outer</sd-radio>
    </sd-radio-group>
    <sd-carousel
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
      show-arrow="never"
      :style="{
        width: '600px',
        height: '240px',
      }"
    >
      <sd-carousel-item v-for="image in images">
        <img
          :src="image"
          :style="{
            width: '100%',
          }"
        />
      </sd-carousel-item>
    </sd-carousel>
  </sd-space>
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
