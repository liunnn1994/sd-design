<template>
  <sd-collapse :default-active-key="['1', 2]" destroy-on-hide>
    <sd-collapse-item header="示例数据有限公司" key="1">
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" :key="2">
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" key="3" :show-expand-icon="false">
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
