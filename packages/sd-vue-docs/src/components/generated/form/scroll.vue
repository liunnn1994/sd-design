<template>
  <sd-space>
    <sd-button @click="formRef && formRef.validate()">提交</sd-button>
    <sd-button @click="formRef && formRef.resetFields()">重置</sd-button>
    <sd-button @click="formRef && formRef.scrollToField('name19')">滚动到最后一个字段</sd-button>
  </sd-space>
  <sd-form
    ref="formRef"
    class="sd:mt-5 sd:h-75 sd:w-125 sd:overflow-auto sd:pr-4"
    :model="form"
    :scrollToFirstError="true"
  >
    <template v-for="(fieldName, index) in fieldNames" :key="index">
      <sd-form-item
        :field="fieldName"
        :label="'user' + index"
        :rules="[{ required: true, message: '请输入姓名' }]"
      >
        <sd-input v-model="form[fieldName]" />
      </sd-form-item>
    </template>
  </sd-form>
</template>

<script setup lang="ts">
  import type { FormInstance } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';

  const formRef = ref<FormInstance | null>(null);
  const fieldCount = 20;
  const fieldNames = Array.from({ length: fieldCount }, (_, index) => `name${index}`);
  const form = reactive(
    Object.fromEntries(
      fieldNames.map((fieldName, index) => [fieldName, index === 7 ? '' : index.toString()]),
    ),
  );
</script>
