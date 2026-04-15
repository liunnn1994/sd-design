<template>
  <div
    :style="{
      backgroundImage: 'radial-gradient(var(--color-fill-3) 1px, rgba(0, 0, 0, 0) 1px)',
      backgroundSize: '16px 16px',
      padding: '28px',
    }"
  >
    <sd-page-header title="SD Design" subtitle="SD Design Vue">
      <template #breadcrumb>
        <sd-breadcrumb>
          <sd-breadcrumb-item>Home</sd-breadcrumb-item>
          <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
          <sd-breadcrumb-item>News</sd-breadcrumb-item>
        </sd-breadcrumb>
      </template>
      <template #extra>
        <sd-radio-group type="button">
          <sd-radio value="mini">Mini</sd-radio>
          <sd-radio value="small">Small</sd-radio>
          <sd-radio value="large">Large</sd-radio>
        </sd-radio-group>
      </template>
    </sd-page-header>
  </div>
</template>
