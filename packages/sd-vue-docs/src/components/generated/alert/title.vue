<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert title="Info">This is an info alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert title="Success" type="success">This is an success alert.</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="warning">
        <template #title> Warning </template>
        This is an warning alert.
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="error">
        <template #title> Error </template>
        This is an error alert.
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
