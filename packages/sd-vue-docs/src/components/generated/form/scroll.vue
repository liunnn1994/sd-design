<template>
  <sd-space>
    <sd-button @click="formRef && formRef.validate()">Submit</sd-button>
    <sd-button @click="formRef && formRef.resetFields()">Reset</sd-button>
    <sd-button @click="formRef && formRef.scrollToField('name19')"
      >Scroll to the last field</sd-button
    >
  </sd-space>
  <sd-form
    ref="formRef"
    style="width: 500px; height: 300px; margin-top: 20px; padding-right: 16px; overflow: auto"
    :model="form"
    :scrollToFirstError="true"
  >
    <template v-for="(fieldName, index) in fieldNames" :key="index">
      <sd-form-item
        :field="fieldName"
        :label="'user' + index"
        :rules="[{ required: true, message: 'Name is required' }]"
      >
        <sd-input v-model="form[fieldName]" />
      </sd-form-item>
    </template>
  </sd-form>
</template>

<script>
  import { reactive, ref } from 'vue';

  export default {
    setup() {
      const formRef = ref(null);
      const fieldCount = 20;
      const fieldNames = Array.from({ length: fieldCount }, (_, index) => `name${index}`);
      const form = reactive(
        Object.fromEntries(
          fieldNames.map((fieldName, index) => [fieldName, index === 7 ? '' : index.toString()]),
        ),
      );

      return {
        form,
        formRef,
        fieldCount,
        fieldNames,
      };
    },
  };
</script>
