<template>
  <sd-form :model="form" :style="{ width: '600px' }">
    <sd-form-item field="name" label="Username">
      <sd-input v-model="form.name" placeholder="please enter your username..." />
    </sd-form-item>
    <sd-form-item
      v-for="(post, index) of form.posts"
      :field="`posts[${index}].value`"
      :label="`Post-${index}`"
      :key="index"
    >
      <sd-input v-model="post.value" placeholder="please enter your post..." />
      <sd-button @click="handleDelete(index)" :style="{ marginLeft: '10px' }">Delete</sd-button>
    </sd-form-item>
  </sd-form>
  <div>
    <sd-button @click="handleAdd">Add Post</sd-button>
  </div>
  {{ form }}
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const form = reactive({
        name: '',
        posts: [{ value: '' }],
      });
      const handleAdd = () => {
        form.posts.push({
          value: '',
        });
      };
      const handleDelete = (index) => {
        form.posts.splice(index, 1);
      };

      return {
        form,
        handleAdd,
        handleDelete,
      };
    },
  };
</script>
