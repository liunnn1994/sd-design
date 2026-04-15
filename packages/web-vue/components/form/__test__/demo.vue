<template>
  <sd-form :model="form">
    <sd-form-item
      field="name"
      label="Username"
      :rules="[
        { required: true, message: 'name is required' },
        {
          minLength: 6,
          message: 'name should up 6 chars',
        },
      ]"
    >
      <sd-input id="name" v-model="form.name" />
    </sd-form-item>
    <sd-form-item
      field="post"
      label="Post"
      :rules="[{ required: true, message: 'post is required' }]"
    >
      <sd-input id="post" v-model="form.post" />
    </sd-form-item>
  </sd-form>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Input from '../../input';
  import Form from '../index';

  const FormItem = Form.Item;

  export default defineComponent({
    name: 'BasicDemo',
    components: {
      AForm: Form,
      AFormItem: FormItem,
      AInput: Input,
    },
    data() {
      return {
        form: {
          name: '',
          post: '',
        },
      };
    },
    methods: {},
  });
</script>
