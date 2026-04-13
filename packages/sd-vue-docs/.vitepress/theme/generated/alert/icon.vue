<template>
  <a-row :gutter="[40, 20]">
    <a-col :span="12">
      <a-alert :show-icon="false">This is an info alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="success" :show-icon="false">This is an success alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="warning" :show-icon="false">
        <template #title>
          Warning
        </template>
        This is an warning alert.
      </a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="error" :show-icon="false">
        <template #title>
          Error
        </template>
        This is an error alert.
      </a-alert>
    </a-col>
  </a-row>
</template>
