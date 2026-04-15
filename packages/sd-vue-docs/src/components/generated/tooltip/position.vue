<template>
  <div :style="{ position: 'relative', width: '440px', height: '280px' }">
    <sd-tooltip content="This is a Tooltip" position="tl">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '70px' }"
        >TL</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="top">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '180px' }"
        >TOP</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="tr">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '290px' }"
        >TR</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="bl">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '70px' }"
        >BL</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="bottom">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '180px' }"
        >BOTTOM</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="br">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '290px' }"
        >BR</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="lt">
      <sd-button class="button" :style="{ position: 'absolute', top: '60px', left: '10px' }"
        >LT</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="left">
      <sd-button class="button" :style="{ position: 'absolute', top: '120px', left: '10px' }"
        >LEFT</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="lb">
      <sd-button class="button" :style="{ position: 'absolute', top: '180px', left: '10px' }"
        >LB</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="rt">
      <sd-button class="button" :style="{ position: 'absolute', top: '60px', left: '350px' }"
        >RT</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="right">
      <sd-button class="button" :style="{ position: 'absolute', top: '120px', left: '350px' }"
        >RIGHT</sd-button
      >
    </sd-tooltip>
    <sd-tooltip content="This is a Tooltip" position="rb">
      <sd-button class="button" :style="{ position: 'absolute', top: '180px', left: '350px' }"
        >RB</sd-button
      >
    </sd-tooltip>
  </div>
</template>

<style scoped>
  .button {
    width: 100px;
  }
</style>
