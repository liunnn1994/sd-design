<template>
  <div :style="{ background: 'var(--color-fill-2)', padding: '28px' }">
    <a-page-header
      :style="{ background: 'var(--color-bg-2)' }"
      title="SD Design"
      subtitle="SD Design Vue"
    >
      <template #extra>
        <a-radio-group type="button" default-value="large">
          <a-radio value="mini">Mini</a-radio>
          <a-radio value="small">Small</a-radio>
          <a-radio value="large">Large</a-radio>
        </a-radio-group>
      </template>
    </a-page-header>
  </div>
</template>
