<template>
  <div
    :style="{
      backgroundImage:
        'radial-gradient(var(--color-fill-3) 1px, rgba(0, 0, 0, 0) 1px)',
      backgroundSize: '16px 16px',
      padding: '28px',
    }"
  >
    <a-page-header title="SD Design" subtitle="SD Design Vue">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>Home</a-breadcrumb-item>
          <a-breadcrumb-item>Channel</a-breadcrumb-item>
          <a-breadcrumb-item>News</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
      <template #extra>
        <a-radio-group type="button">
          <a-radio value="mini">Mini</a-radio>
          <a-radio value="small">Small</a-radio>
          <a-radio value="large">Large</a-radio>
        </a-radio-group>
      </template>
    </a-page-header>
  </div>
</template>
