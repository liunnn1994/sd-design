<template>
  <sd-collapse :default-active-key="['1', 2]" destroy-on-hide>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <sd-collapse :default-active-key="['1.1']" destroy-on-hide>
        <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1.1">
          <div>Beijing Toutiao Technology Co., Ltd.</div>
        </sd-collapse-item>
        <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1.2">
          <div>Beijing Toutiao Technology Co., Ltd.</div>
        </sd-collapse-item>
      </sd-collapse>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." :key="2">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
