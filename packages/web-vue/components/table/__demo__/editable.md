```yaml
title:
  zh-CN: 可编辑表格
  en-US: Editable
```

## zh-CN

可以在使用插槽获得的数据，修改 `data` 中的数据，达到可编辑表格的功能。 `2.25.0` 版本后可以直接修改插槽传出的 `record` 变量。这个 `record` 变量是传入的 `data` 中对应数据的引用，请保证 `data` 为 Reactive 类型。

---

## en-US

You can use the data obtained from the slot to modify the data in `data` to achieve the function of editing the table. After the `2.25.0` version, you can directly modify the `record` variable from the slot. This `record` variable is a reference to the corresponding data in the incoming `data`, please make sure that `data` is of Reactive type.

---

```vue
<template>
  <sd-table :columns="columns" :data="data">
    <template #name="{ rowIndex }">
      <sd-input v-model="data[rowIndex].name" />
    </template>
    <template #province="{ rowIndex }">
      <sd-select v-model="data[rowIndex].province" @change="() => handleChange(rowIndex)">
        <sd-option v-for="value of Object.keys(options)">{{ value }}</sd-option>
      </sd-select>
    </template>
    <template #city="{ rowIndex }">
      <sd-select :options="options[data[rowIndex].province] || []" v-model="data[rowIndex].city" />
    </template>
  </sd-table>
  <!-- support from v2.25.0  -->
  <sd-table :columns="columns" :data="data" style="margin-top: 20px">
    <template #name="{ record, rowIndex }">
      <sd-input v-model="record.name" />
    </template>
    <template #province="{ record, rowIndex }">
      <sd-select
        v-model="record.province"
        @change="
          () => {
            record.city = '';
          }
        "
      >
        <sd-option v-for="value of Object.keys(options)">{{ value }}</sd-option>
      </sd-select>
    </template>
    <template #city="{ record, rowIndex }">
      <sd-select :options="options[record.province] || []" v-model="record.city" />
    </template>
  </sd-table>
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const options = {
        Beijing: ['Haidian', 'Chaoyang', 'Changping'],
        Sichuan: ['Chengdu', 'Mianyang', 'Aba'],
        Guangdong: ['Guangzhou', 'Shenzhen', 'Shantou'],
      };
      const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          slotName: 'name',
        },
        {
          title: 'Salary',
          dataIndex: 'salary',
        },
        {
          title: 'Address',
          dataIndex: 'address',
        },
        {
          title: 'Province',
          dataIndex: 'province',
          slotName: 'province',
        },
        {
          title: 'City',
          dataIndex: 'city',
          slotName: 'city',
        },
        {
          title: 'Email',
          dataIndex: 'email',
        },
      ];

      const data = reactive([
        {
          key: '1',
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          province: 'Beijing',
          city: 'Haidian',
          email: 'jane.doe@example.com',
        },
        {
          key: '2',
          name: 'Alisa Ross',
          salary: 25000,
          address: '35 Park Road, London',
          email: 'alisa.ross@example.com',
        },
        {
          key: '3',
          name: 'Kevin Sandra',
          salary: 22000,
          address: '31 Park Road, London',
          province: 'Sichuan',
          city: 'Mianyang',
          email: 'kevin.sandra@example.com',
        },
        {
          key: '4',
          name: 'Ed Hellen',
          salary: 17000,
          address: '42 Park Road, London',
          email: 'ed.hellen@example.com',
        },
        {
          key: '5',
          name: 'William Smith',
          salary: 27000,
          address: '62 Park Road, London',
          email: 'william.smith@example.com',
        },
      ]);

      const handleChange = (rowIndex) => {
        data[rowIndex].city = '';
      };
      return {
        options,
        columns,
        data,
        handleChange,
      };
    },
  };
</script>
```
