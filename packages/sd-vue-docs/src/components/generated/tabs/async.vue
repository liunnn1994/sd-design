<template>
  <DefineLoading>
    <div class="sd:flex sd:justify-center sd:py-10">
      <sd-spin />
    </div>
  </DefineLoading>

  <DefineReport>
    <div class="sd:mb-3 sd:text-sm sd:text-gray-500">
      共 {{ rows.length }} 行 × {{ columns.length }} 列 —— 切换进入时先显示 loading，不阻塞 tabs
      切换。
    </div>
    <div class="sd:h-80 sd:overflow-y-auto">
      <table class="sd:w-full sd:text-sm">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col"
              class="sd:sticky sd:top-0 sd:bg-white sd:z-10 sd:dark:bg-gray-800 sd:border-b sd:px-3 sd:py-2 sd:text-left sd:font-medium"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="sd:border-b sd:border-gray-100">
            <td class="sd:px-3 sd:py-1.5">{{ row.name }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.region }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.type }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.owner }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.status }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.value }}</td>
            <td class="sd:px-3 sd:py-1.5">{{ row.updated }}</td>
            <td class="sd:px-3 sd:py-1.5">
              <sd-space size="mini">
                <sd-link>查看</sd-link>
                <sd-link>编辑</sd-link>
              </sd-space>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DefineReport>

  <sd-space direction="vertical" size="large">
    <sd-alert>
      重型面板（大表格、图表等）拆成异步组件：切换到重型面板时先显示 loading
      占位，内容就绪后替换，切换交互不被阻塞。
    </sd-alert>
    <sd-tabs default-active-key="1" lazy-load>
      <sd-tab-pane key="1" title="概览"> 轻面板：切换零开销。 </sd-tab-pane>
      <sd-tab-pane key="2" title="重型报表（异步 + loading）">
        <AsyncReport />
      </sd-tab-pane>
    </sd-tabs>
  </sd-space>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  const [DefineLoading, ReuseLoading] = createReusableTemplate();
  const [DefineReport, ReuseReport] = createReusableTemplate();

  // 模拟一个真实的重型报表：500 行 × 8 列；实际项目中对应动态 import() 的真实组件
  const columns = ['名称', '地域', '类型', '负责人', '状态', '数值', '更新时间', '操作'];
  const regions = ['华北', '华东', '华南', '西南'];
  const types = ['标准型', '增强型', '专属型'];
  const owners = ['张伟', '王芳', '李娜', '刘洋'];
  const statuses = ['运行中', '已停止', '部署中'];
  const rows = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    name: `实例-${String(i + 1).padStart(4, '0')}`,
    region: regions[i % 4],
    type: types[i % 3],
    owner: owners[i % 4],
    status: statuses[i % 3],
    value: (i * 37) % 1000,
    updated: `2026-09-${String((i % 28) + 1).padStart(2, '0')} 12:00`,
  }));

  const AsyncReport = defineAsyncComponent({
    loader: () => new Promise((resolve) => setTimeout(() => resolve(ReuseReport), 1000)),
    loadingComponent: ReuseLoading,
    delay: 0,
  });
</script>
