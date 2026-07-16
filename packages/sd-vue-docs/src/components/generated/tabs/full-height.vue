<template>
  <div class="sd:flex sd:gap-[16px]">
    <div class="sd:h-[300px] sd:flex-1">
      <sd-tabs full-height>
        <sd-tab-pane key="1" title="Tab 1">
          <p v-for="n in 30" :key="n" class="sd:leading-[24px]">Tab 1 第 {{ n }} 行内容</p>
        </sd-tab-pane>
        <sd-tab-pane key="2" title="Tab 2">
          <p v-for="n in 30" :key="n" class="sd:leading-[24px]">Tab 2 第 {{ n }} 行内容</p>
        </sd-tab-pane>
      </sd-tabs>
    </div>
    <div class="sd:h-[300px] sd:flex-1">
      <sd-tabs full-height :scrollbar="false">
        <sd-tab-pane key="1" title="Tab 1">
          <p v-for="n in 30" :key="n" class="sd:leading-[24px]">Tab 1 第 {{ n }} 行内容</p>
        </sd-tab-pane>
        <sd-tab-pane key="2" title="Tab 2">
          <p v-for="n in 30" :key="n" class="sd:leading-[24px]">Tab 2 第 {{ n }} 行内容</p>
        </sd-tab-pane>
      </sd-tabs>
    </div>
  </div>
</template>
