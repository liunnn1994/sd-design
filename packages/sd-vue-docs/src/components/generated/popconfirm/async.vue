<template>
  <sd-popconfirm @before-ok="handleBeforeOk">
    <sd-button>Click To Show</sd-button>
    <template #content>
      <sd-form>
        <sd-form-item label="Name">
          <sd-input />
        </sd-form-item>
        <sd-form-item label="Post">
          <sd-input />
        </sd-form-item>
      </sd-form>
    </template>
  </sd-popconfirm>
</template>

<script setup>
  import { ref } from 'vue';

  const visible = ref(false);

  const handleClick = () => {
    visible.value = true;
  };

  const handleBeforeOk = (done) => {
    window.setTimeout(() => {
      done();
    }, 3000);
  };

  const handleCancel = () => {
    visible.value = false;
  };
</script>
