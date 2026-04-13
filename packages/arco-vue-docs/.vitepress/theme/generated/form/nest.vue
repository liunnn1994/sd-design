<template>
  <a-form :model="form" :style="{width:'600px'}">
    <a-form-item label="Username" :content-flex="false" :merge-props="false" extra="Show error message together">
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item field="together.firstname" validate-trigger="input"
                       :rules="[{required:true,message:'firstname is required'}]" no-style>
            <a-input v-model="form.together.firstname" placeholder="please enter your firstname..." />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="together.lastname" validate-trigger="input"
                       :rules="[{required:true,message:'lastname is required'}]" no-style>
            <a-input v-model="form.together.lastname" placeholder="please enter your lastname..." />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="Username" :content-flex="false" :merge-props="false">
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item field="separate.firstname" validate-trigger="input"
                       extra="Show error message separate"
                       :rules="[{required:true,message:'firstname is required'}]" hide-label>
            <a-input v-model="form.separate.firstname" placeholder="please enter your firstname..." />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="separate.lastname" validate-trigger="input"
                       :rules="[{required:true,message:'lastname is required'}]" hide-label>
            <a-input v-model="form.separate.lastname" placeholder="please enter your lastname..." />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="Posts" :content-flex="false" :merge-props="false">
      <a-space direction="vertical" fill>
        <a-form-item field="posts.post1" label="Post1">
          <a-input v-model="form.posts.post1" placeholder="please enter your post..." />
        </a-form-item>
        <a-form-item field="posts.post2" label="Post2">
          <a-input v-model="form.posts.post2" placeholder="please enter your post..." />
        </a-form-item>
      </a-space>
    </a-form-item>
    <a-form-item field="isRead">
      <a-checkbox v-model="form.isRead">
        I have read the manual
      </a-checkbox>
    </a-form-item>
  </a-form>
  {{ form }}
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    const form = reactive({
      together: {
        firstname: '',
        lastname: '',
      },
      separate: {
        firstname: '',
        lastname: '',
      },
      posts: {
        post1: '',
        post2: ''
      },
      isRead: false,
    })

    return {
      form,
    }
  },
}
</script>
