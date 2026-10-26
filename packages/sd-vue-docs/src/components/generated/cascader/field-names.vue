<template>
  <sd-cascader :options="options" :field-names="fieldNames" class="sd:w-80" placeholder="请选择…" />
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  const fieldNames = { value: 'city', label: 'text' };
  const options = reactive([
    {
      city: 'beijing',
      text: '北京',
      children: [
        {
          city: 'chaoyang',
          text: '朝阳区',
          children: [
            {
              city: 'datunli',
              text: '大屯里',
            },
          ],
        },
        {
          city: 'haidian',
          text: '海淀区',
        },
        {
          city: 'dongcheng',
          text: '东城区',
        },
        {
          city: 'xicheng',
          text: '西城区',
          children: [
            {
              city: 'jinrongjie',
              text: '金融街',
            },
            {
              city: 'tianqiao',
              text: '天桥',
            },
          ],
        },
      ],
    },
    {
      city: 'shanghai',
      text: '上海',
      children: [
        {
          city: 'huangpu',
          text: '黄浦区',
        },
      ],
    },
  ]);
</script>
