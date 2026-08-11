<template>
  <div
    class="sd:bg-[radial-gradient(var(--color-fill-3)_1px,rgba(0,0,0,0)_1px)] sd:p-7 sd:[background-size:16px_16px]"
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
        <sd-space>
          <sd-button>Cancel</sd-button>
          <sd-button type="primary">Save</sd-button>
        </sd-space>
      </template>
    </sd-page-header>
  </div>
</template>
