<template>
  <sd-button @click="handleClick">打开表单对话框</sd-button>
  <sd-modal
    v-model:visible="visible"
    title="弹窗表单"
    @cancel="handleCancel"
    @before-ok="handleBeforeOk"
  >
    <sd-form :model="form">
      <sd-form-item field="name" label="姓名">
        <sd-input v-model="form.name" />
      </sd-form-item>
      <sd-form-item field="post" label="岗位">
        <sd-select v-model="form.post" :options="postOptions" />
      </sd-form-item>
    </sd-form>
  </sd-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';

  const visible = ref(false);
  const form = reactive({
    name: '',
    post: '',
  });

  const postOptions = [
    { value: 'post1', label: '岗位 1' },
    { value: 'post2', label: '岗位 2' },
    { value: 'post3', label: '岗位 3' },
    { value: 'post4', label: '岗位 4' },
  ];

  const handleClick = () => {
    visible.value = true;
  };
  const handleBeforeOk = (done: (closed: boolean) => void) => {
    console.log(form);
    window.setTimeout(() => {
      done(true);
      // prevent close
      // done(false)
    }, 3000);
  };
  const handleCancel = () => {
    visible.value = false;
  };
</script>
