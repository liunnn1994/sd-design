<template>
  <a-space direction="vertical" size="large">
    <a-descriptions :data="data" title="User Info" align="right" />
    <a-descriptions :data="data" title="User Info" :align="{ label: 'right' }" />
    <a-descriptions :data="data" title="User Info" layout="inline-vertical" />
  </a-space>
</template>

<script>
  export default {
    setup() {
      const data = [
        {
          label: 'Name',
          value: 'Socrates',
        },
        {
          label: 'Mobile',
          value: '123-1234-1234',
        },
        {
          label: 'Residence',
          value: 'Beijing',
        },
        {
          label: 'Hometown',
          value: 'Beijing',
        },
        {
          label: 'Address',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
      ];

      return {
        data,
      };
    },
  };
</script>
