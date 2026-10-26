<template>
  <sd-date-picker>
    <template #panelRender="{ component, props }">
      <div class="sd:border sd:rounded sd:p-2">
        <component :is="component" v-bind="props" />
        <div class="sd:text-center sd:text-xs sd:mt-1 sd:text-gray-400"> 自定义面板容器 </div>
      </div>
    </template>
  </sd-date-picker>
</template>
