<template>
  <a-row :gutter="[40, 20]">
    <a-col :span="12">
      <a-alert closable>This is an info alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="success" closable>This is an success alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="warning" closable>
        <template #title>
          Warning
        </template>
        This is an warning alert.
      </a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="error" closable>
        <template #title>
          Error
        </template>
        This is an error alert.
      </a-alert>
    </a-col>
  </a-row>
</template>
