<template>
  <sd-space>
    <sd-select
      :default-value="'Beijing'"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
      <template #header>
        <div style="padding: 6px 12px">
          <sd-checkbox value="1">全选</sd-checkbox>
        </div>
      </template>
    </sd-select>

    <sd-select
      :default-value="'Beijing'"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      show-header-on-empty
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
      <template #header>
        <div style="padding: 6px 12px">
          <sd-checkbox value="1">全选</sd-checkbox>
        </div>
      </template>
    </sd-select>
  </sd-space>
</template>
