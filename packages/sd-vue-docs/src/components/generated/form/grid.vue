<template>
  <sd-form :model="form">
    <sd-row :gutter="16">
      <sd-col :span="8">
        <sd-form-item field="value1" label="值 1" label-col-flex="100px">
          <sd-input v-model="form.value1" placeholder="请输入…" />
        </sd-form-item>
      </sd-col>
      <sd-col :span="8">
        <sd-form-item field="value2" label="值 2" label-col-flex="80px">
          <sd-input v-model="form.value2" placeholder="请输入…" />
        </sd-form-item>
      </sd-col>
      <sd-col :span="8">
        <sd-form-item field="value3" label="值 3" label-col-flex="80px">
          <sd-input v-model="form.value3" placeholder="请输入…" />
        </sd-form-item>
      </sd-col>
    </sd-row>
    <sd-row :gutter="16">
      <sd-col :span="16">
        <sd-form-item field="value4" label="值 4" label-col-flex="100px">
          <sd-input v-model="form.value4" placeholder="请输入…" />
        </sd-form-item>
      </sd-col>
      <sd-col :span="8">
        <sd-form-item field="value5" label="值 5" label-col-flex="80px">
          <sd-input v-model="form.value5" placeholder="请输入…" />
        </sd-form-item>
      </sd-col>
    </sd-row>
  </sd-form>
  {{ form }}
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  const form = reactive({
    value1: '',
    value2: '',
    value3: '',
    value4: '',
    value5: '',
  });
</script>
