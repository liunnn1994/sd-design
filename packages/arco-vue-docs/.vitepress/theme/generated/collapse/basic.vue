<template>
  <a-collapse :default-active-key="['1', 2]">
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." :key="2" disabled>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
  </a-collapse>
</template>
