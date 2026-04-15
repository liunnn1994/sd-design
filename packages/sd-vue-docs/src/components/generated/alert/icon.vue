<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert :show-icon="false">This is an info alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="success" :show-icon="false">This is an success alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="warning" :show-icon="false">
        <template #title> Warning </template>
        This is an warning alert.
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="error" :show-icon="false">
        <template #title> Error </template>
        This is an error alert.
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
