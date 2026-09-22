<script setup lang="ts">
  import type { SdThemeConfig, TableColumnData } from '@sdata/web-vue';

  import { computed, reactive, shallowRef } from 'vue';

  defineProps<{ theme: SdThemeConfig; themeMode: 'light' | 'dark' }>();

  const tab = shallowRef('tasks');
  const search = shallowRef('');
  const filter = shallowRef('all');
  const drawer = shallowRef(false);
  const dialog = shallowRef(false);
  const attempted = shallowRef(false);
  const saved = shallowRef(false);
  const form = reactive({
    name: '',
    owner: '林晓',
    environment: '预发布',
    notify: true,
    checks: ['回归测试'],
    capacity: 60,
    note: '',
  });
  const states = {
    running: { label: '进行中', status: 'normal' },
    warning: { label: '有风险', status: 'warning' },
    error: { label: '已阻塞', status: 'danger' },
    success: { label: '已完成', status: 'success' },
  } as const;
  const rows = shallowRef([
    {
      key: 'REL-2048',
      name: '秋季品牌站发布',
      owner: '林晓',
      state: 'warning',
      percent: 0.72,
      date: '09-24',
    },
    {
      key: 'REL-2047',
      name: '支付网关升级',
      owner: '周宁',
      state: 'error',
      percent: 0.38,
      date: '09-23',
    },
    {
      key: 'REL-2046',
      name: '移动端体验优化',
      owner: '陈可',
      state: 'running',
      percent: 0.56,
      date: '09-25',
    },
    {
      key: 'REL-2045',
      name: '客户中心国际化',
      owner: '林晓',
      state: 'success',
      percent: 1,
      date: '09-21',
    },
    {
      key: 'REL-2044',
      name: '数据看板迁移',
      owner: '周宁',
      state: 'running',
      percent: 0.25,
      date: '09-26',
    },
    {
      key: 'REL-2043',
      name: '消息通知改版',
      owner: '陈可',
      state: 'success',
      percent: 1,
      date: '09-20',
    },
  ]);
  const filtered = computed(() =>
    rows.value.filter(
      (row) =>
        `${row.name} ${row.key}`.includes(search.value) &&
        (filter.value === 'all' || row.state === filter.value),
    ),
  );
  const columns: TableColumnData[] = [
    { title: '交付任务', dataIndex: 'name', slotName: 'task', width: 220 },
    { title: '负责人', dataIndex: 'owner', width: 90 },
    { title: '状态', slotName: 'state', width: 90 },
    { title: '进度', slotName: 'progress', width: 150 },
    { title: '截止', dataIndex: 'date', width: 75 },
    { title: '操作', slotName: 'action', width: 75 },
  ];
  const stateOf = (value: string) => states[value as keyof typeof states] ?? states.running;
  function createTask() {
    attempted.value = true;
    if (!form.name.trim()) return;
    rows.value = [
      {
        key: `REL-${2049 + rows.value.length - 6}`,
        name: form.name,
        owner: form.owner,
        state: 'running',
        percent: 0,
        date: '09-28',
      },
      ...rows.value,
    ];
    dialog.value = false;
    saved.value = true;
    search.value = '';
    filter.value = 'all';
    tab.value = 'tasks';
  }
</script>

<template>
  <sd-layout :has-sider="false" class="workspace-page" data-testid="workspace-page">
    <sd-layout-header class="workspace-header" data-testid="workspace-header">
      <sd-space size="large"
        ><sd-avatar shape="square" :size="32">SD</sd-avatar
        ><sd-typography-text bold>交付工作台</sd-typography-text><sd-tag>演示项目</sd-tag></sd-space
      >
      <sd-space size="large"
        ><sd-badge :count="3"><sd-button @click="drawer = true">消息</sd-button></sd-badge
        ><sd-avatar :size="32">林</sd-avatar></sd-space
      >
    </sd-layout-header>
    <sd-layout>
      <sd-layout-sider :width="168" class="workspace-sidebar">
        <sd-menu :selected-keys="[tab]" @menu-item-click="tab = $event">
          <sd-menu-item key="tasks">项目概览</sd-menu-item
          ><sd-menu-item key="activity">交付动态</sd-menu-item
          ><sd-menu-item key="settings">发布设置</sd-menu-item>
        </sd-menu>
        <sd-divider />
        <sd-space direction="vertical" class="sidebar-summary"
          ><sd-typography-text type="secondary">本月工作空间</sd-typography-text
          ><sd-progress :percent="0.68" size="small" /><sd-typography-text type="secondary"
            >已使用 68% 配额</sd-typography-text
          ></sd-space
        >
      </sd-layout-sider>
      <sd-layout-content class="workspace-content">
        <sd-breadcrumb
          ><sd-breadcrumb-item>工作空间</sd-breadcrumb-item
          ><sd-breadcrumb-item>产品交付</sd-breadcrumb-item></sd-breadcrumb
        >
        <sd-page-header title="产品交付" subtitle="秋季版本 · 2026 年 9 月" :show-back="false">
          <template #extra
            ><sd-space
              ><sd-button disabled>归档项目</sd-button
              ><sd-button type="primary" @click="dialog = true">新建任务</sd-button></sd-space
            ></template
          >
        </sd-page-header>
        <sd-alert v-if="saved" type="success" closable @close="saved = false"
          >任务已创建，团队成员会收到通知。</sd-alert
        >
        <sd-alert
          type="warning"
          title="发布窗口临近，2 项任务需要关注"
          data-testid="workspace-warning"
          >品牌站资源尚未确认，请在周四 18:00 前完成检查。</sd-alert
        >
        <div class="workspace-metrics">
          <sd-card
            ><sd-statistic title="交付任务" :value="rows.length" /><sd-typography-text
              type="secondary"
              >本轮发布范围</sd-typography-text
            ></sd-card
          >
          <sd-card
            ><sd-statistic
              title="已完成"
              :value="rows.filter((row) => row.state === 'success').length" /><sd-badge
              status="success"
              text="回归验证通过"
          /></sd-card>
          <sd-card
            ><sd-statistic
              title="存在风险"
              :value="rows.filter((row) => row.state === 'warning').length" /><sd-badge
              status="warning"
              text="需要跟进"
          /></sd-card>
          <sd-card
            ><sd-statistic
              title="阻塞任务"
              :value="rows.filter((row) => row.state === 'error').length" /><sd-badge
              status="danger"
              text="环境异常"
          /></sd-card>
        </div>
        <sd-tabs v-model:active-key="tab">
          <sd-tab-pane key="tasks" title="交付任务">
            <sd-space class="task-filters" wrap>
              <sd-input
                v-model="search"
                placeholder="搜索任务名称或编号"
                :input-attrs="{ 'aria-label': '搜索交付任务' }"
                allow-clear
              />
              <sd-select
                v-model="filter"
                class="task-status"
                aria-label="交付状态"
                :options="[
                  { value: 'all', label: '全部状态' },
                  ...Object.entries(states).map(([value, state]) => ({
                    value,
                    label: state.label,
                  })),
                ]"
              />
              <sd-button
                @click="
                  search = '';
                  filter = 'all';
                "
                >重置筛选</sd-button
              >
            </sd-space>
            <sd-table
              :columns="columns"
              :data="filtered"
              :pagination="{ pageSize: 4 }"
              :row-selection="{ type: 'checkbox', showCheckedAll: true }"
              :bordered="false"
              stripe
            >
              <template #task="{ record }"
                ><sd-space direction="vertical" :size="2"
                  ><sd-link @click="drawer = true">{{ record.name }}</sd-link
                  ><sd-typography-text type="secondary">{{
                    record.key
                  }}</sd-typography-text></sd-space
                ></template
              >
              <template #state="{ record }"
                ><sd-badge
                  :status="stateOf(record.state).status"
                  :text="stateOf(record.state).label"
              /></template>
              <template #progress="{ record }"
                ><sd-progress
                  :percent="record.percent"
                  :status="stateOf(record.state).status"
                  size="small"
              /></template>
              <template #action
                ><sd-button type="text" size="small" @click="drawer = true"
                  >详情</sd-button
                ></template
              >
            </sd-table>
          </sd-tab-pane>
          <sd-tab-pane key="activity" title="交付动态">
            <sd-timeline>
              <sd-timeline-item label="今天 10:32"
                >客户中心回归通过，已部署预发布环境。</sd-timeline-item
              >
              <sd-timeline-item label="今天 09:15" :dot-color="'rgb(var(--sd-warning-6))'"
                >品牌站资源缺失，已通知负责人。</sd-timeline-item
              >
              <sd-timeline-item label="昨天 18:40" :dot-color="'rgb(var(--sd-danger-6))'"
                >支付网关环境检查失败，等待重试。</sd-timeline-item
              >
            </sd-timeline>
          </sd-tab-pane>
          <sd-tab-pane key="settings" title="发布设置">
            <sd-form :model="form" layout="vertical">
              <sd-form-item label="目标环境"
                ><sd-radio-group v-model="form.environment" :options="['预发布', '生产']"
              /></sd-form-item>
              <sd-form-item label="资源使用上限"
                ><sd-slider v-model="form.capacity" :min="10" :max="100"
              /></sd-form-item>
              <sd-form-item label="检查项"
                ><sd-checkbox-group
                  v-model="form.checks"
                  :options="['回归测试', '安全扫描', '性能基准']"
              /></sd-form-item>
              <sd-form-item label="发布通知"><sd-switch v-model="form.notify" /></sd-form-item>
              <sd-form-item label="只读项目编号"
                ><sd-input model-value="PROJ-2026-09" readonly
              /></sd-form-item>
            </sd-form>
          </sd-tab-pane>
        </sd-tabs>
        <div class="workspace-bottom">
          <sd-card title="发布检查">
            <sd-space direction="vertical" fill size="medium">
              <sd-steps :current="2" size="small"
                ><sd-step title="构建" /><sd-step title="检查" status="error" /><sd-step
                  title="发布"
              /></sd-steps>
              <sd-alert type="error" title="支付网关检查未通过"
                >连接超时。请检查预发布环境后重试。</sd-alert
              >
              <sd-alert type="success">客户中心：24 项回归测试全部通过。</sd-alert>
              <sd-alert type="info">生产发布需在维护窗口内执行。</sd-alert>
              <sd-space
                ><sd-button status="warning" @click="drawer = true">查看风险</sd-button
                ><sd-button status="danger" @click="drawer = true">排查异常</sd-button
                ><sd-button loading>同步检查结果</sd-button></sd-space
              >
            </sd-space>
          </sd-card>
          <sd-card title="版本记录">
            <sd-descriptions :column="1" size="small"
              ><sd-descriptions-item label="发布负责人">林晓</sd-descriptions-item
              ><sd-descriptions-item label="当前环境">{{ form.environment }}</sd-descriptions-item
              ><sd-descriptions-item label="版本"
                >v2.8.0-rc.2</sd-descriptions-item
              ></sd-descriptions
            >
            <sd-divider /><sd-empty description="尚无生产发布记录" />
          </sd-card>
        </div>
      </sd-layout-content>
    </sd-layout>
    <Teleport to="body">
      <sd-config-provider :theme="theme" :theme-mode="themeMode">
        <sd-modal
          :render-to-body="false"
          v-model:visible="dialog"
          title="新建交付任务"
          :footer="false"
          :width="480"
        >
          <sd-form :model="form" layout="vertical">
            <sd-form-item
              label="任务名称"
              :validate-status="attempted && !form.name.trim() ? 'error' : undefined"
              :help="attempted && !form.name.trim() ? '请输入任务名称' : undefined"
            >
              <sd-input
                v-model="form.name"
                placeholder="例如：品牌站资源检查"
                :input-attrs="{ 'aria-label': '任务名称' }"
              />
            </sd-form-item>
            <sd-form-item label="负责人"
              ><sd-select v-model="form.owner" :options="['林晓', '周宁', '陈可']"
            /></sd-form-item>
            <sd-form-item label="备注"
              ><sd-textarea v-model="form.note" placeholder="补充交付要求"
            /></sd-form-item>
            <sd-space
              ><sd-button @click="dialog = false">取消</sd-button
              ><sd-button type="primary" @click="createTask">创建任务</sd-button></sd-space
            >
          </sd-form>
        </sd-modal>
        <sd-drawer
          :render-to-body="false"
          v-model:visible="drawer"
          title="交付检查详情"
          :width="420"
          :footer="false"
        >
          <sd-space direction="vertical" fill size="large"
            ><sd-alert type="warning">品牌站资源待确认，发布窗口剩余 2 天。</sd-alert
            ><sd-alert type="error">支付网关检查失败：预发布环境连接超时。</sd-alert
            ><sd-alert type="success">客户中心部署完成，所有回归检查通过。</sd-alert
            ><sd-typography-paragraph
              >这是用于检查组件主题、浮层和语义状态的本地演示，不会提交到真实服务。</sd-typography-paragraph
            ></sd-space
          >
        </sd-drawer>
      </sd-config-provider>
    </Teleport>
  </sd-layout>
</template>

<style scoped lang="scss">
  .workspace-page {
    color: var(--sd-color-text-1);
    background: var(--sd-color-bg-1);
  }

  .workspace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 16px 24px;
    background: var(--sd-color-bg-2);
    border-bottom: 1px solid var(--sd-color-border-2);
  }

  .workspace-sidebar {
    background: var(--sd-color-bg-2);
    border-right: 1px solid var(--sd-color-border-2);
  }

  .sidebar-summary {
    padding: 16px;
  }

  .workspace-content {
    display: grid;
    gap: 20px;
    min-width: 0;
    padding: 24px;
  }

  .workspace-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .task-filters {
    margin-bottom: 16px;
  }

  :deep(.task-status) {
    width: 140px;
  }

  .workspace-bottom {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;
  }
</style>
