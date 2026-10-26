<template>
  <div class="sd:relative">
    <ul id="custom-demo" class="sd:h-50 sd:overflow-y-auto">
      <li v-for="(_, index) of Array(40)" :key="index" class="sd:leading-7.5"> 这里是正文内容 </li>
    </ul>
    <sd-back-top target-container="#custom-demo" class="sd:absolute!">
      <sd-button>返回顶部</sd-button>
    </sd-back-top>
  </div>
</template>
