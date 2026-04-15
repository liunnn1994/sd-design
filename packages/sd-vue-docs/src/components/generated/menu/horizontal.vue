<template>
  <div class="menu-demo">
    <sd-menu mode="horizontal" :default-selected-keys="['1']">
      <sd-menu-item key="0" :style="{ padding: 0, marginRight: '38px' }" disabled>
        <div
          :style="{
            width: '80px',
            height: '30px',
            borderRadius: '2px',
            background: 'var(--color-fill-3)',
            cursor: 'text',
          }"
        />
      </sd-menu-item>
      <sd-menu-item key="1">Home</sd-menu-item>
      <sd-menu-item key="2">Solution</sd-menu-item>
      <sd-menu-item key="3">Cloud Service</sd-menu-item>
      <sd-menu-item key="4">Cooperation</sd-menu-item>
    </sd-menu>
  </div>
</template>
<style scoped>
  .menu-demo {
    box-sizing: border-box;
    width: 100%;
    padding: 40px;
    background-color: var(--color-neutral-2);
  }
</style>
