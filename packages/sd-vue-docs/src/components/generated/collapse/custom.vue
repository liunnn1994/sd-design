<template>
  <sd-collapse :default-active-key="['1', 2]" :bordered="false">
    <sd-collapse-item
      header="示例数据有限公司"
      class="sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none"
      key="1"
    >
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item
      header="示例数据有限公司"
      class="sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none"
      :key="2"
    >
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item
      header="示例数据有限公司"
      class="sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none"
      key="3"
    >
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
