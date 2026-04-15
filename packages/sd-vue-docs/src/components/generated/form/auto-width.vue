<template>
  <sd-form :model="form" :style="{ width: '600px' }" auto-label-width @submit="handleSubmit">
    <sd-form-item field="name" label="Username">
      <sd-input v-model="form.name" placeholder="please enter your username..." />
    </sd-form-item>
    <sd-form-item field="post" label="Post">
      <sd-input v-model="form.post" placeholder="please enter your post..." />
    </sd-form-item>
    <sd-form-item field="isRead">
      <sd-checkbox v-model="form.isRead"> I have read the manual </sd-checkbox>
    </sd-form-item>
    <sd-form-item>
      <sd-button html-type="submit">Submit</sd-button>
    </sd-form-item>
  </sd-form>
  {{ form }}
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const form = reactive({
        name: '',
        post: '',
        isRead: false,
      });
      const handleSubmit = (data) => {
        console.log(data);
      };

      return {
        form,
        handleSubmit,
      };
    },
  };
</script>
