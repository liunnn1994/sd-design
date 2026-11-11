/** @jsxImportSource react */

import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CheckboxGroup,
  ConfigProvider,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Empty,
  Form,
  FormItem,
  Input,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Link,
  Menu,
  MenuItem,
  Modal,
  PageHeader,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Space,
  Statistic,
  Step,
  Steps,
  Switch,
  Tag,
  Table,
  TabPane,
  Tabs,
  Textarea,
  Timeline,
  TimelineItem,
  TypographyParagraph,
  TypographyText,
  type TableColumnData,
} from '@sdata/web-react';
import { useState } from 'react';

import type { ThemeConfig } from '../../theme/theme-playground';

import '../../theme/ThemeWorkspacePage.scss';

const states = {
  running: { label: '进行中', status: 'normal' },
  warning: { label: '有风险', status: 'warning' },
  error: { label: '已阻塞', status: 'danger' },
  success: { label: '已完成', status: 'success' },
} as const;
const initialRows = [
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
];
const stateOf = (value: string) => states[value as keyof typeof states] ?? states.running;

export default function ThemeWorkspacePage({
  theme,
  themeMode,
  mobile,
}: {
  theme: ThemeConfig;
  themeMode: 'light' | 'dark';
  mobile?: boolean;
}) {
  const [tab, setTab] = useState('tasks');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drawer, setDrawer] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState({
    name: '',
    owner: '林晓',
    environment: '预发布',
    notify: true,
    checks: ['回归测试'],
    capacity: 60,
    note: '',
  });
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const filtered = rows.filter(
    (row) =>
      `${row.name} ${row.key}`.includes(search) && (filter === 'all' || row.state === filter),
  );
  const columns: TableColumnData[] = [
    {
      title: '交付任务',
      dataIndex: 'name',
      width: 220,
      render: ({ record }) => (
        <Space direction="vertical" size={2}>
          <Link onClick={() => setDrawer(true)}>{String(record.name)}</Link>
          <TypographyText type="secondary">{record.key}</TypographyText>
        </Space>
      ),
    },
    { title: '负责人', dataIndex: 'owner', width: 90 },
    {
      title: '状态',
      width: 90,
      render: ({ record }) => (
        <Badge
          status={stateOf(String(record.state)).status}
          text={stateOf(String(record.state)).label}
        />
      ),
    },
    {
      title: '进度',
      width: 150,
      render: ({ record }) => (
        <Progress
          percent={Number(record.percent)}
          status={stateOf(String(record.state)).status}
          size="small"
        />
      ),
    },
    { title: '截止', dataIndex: 'date', width: 75 },
    {
      title: '操作',
      width: 75,
      render: () => (
        <Button type="text" size="small" onClick={() => setDrawer(true)}>
          详情
        </Button>
      ),
    },
  ];
  function createTask() {
    setAttempted(true);
    if (!form.name.trim()) return;
    setRows((previous) => [
      {
        key: `REL-${2049 + previous.length - 6}`,
        name: form.name,
        owner: form.owner,
        state: 'running',
        percent: 0,
        date: '09-28',
      },
      ...previous,
    ]);
    setDialog(false);
    setSaved(true);
    setSearch('');
    setFilter('all');
    setTab('tasks');
  }
  return (
    <ConfigProvider theme={theme} themeMode={themeMode}>
      <Layout
        hasSider={false}
        className={`workspace-page${mobile ? ' mobile-layout' : ''}`}
        data-testid="workspace-page"
      >
        <LayoutHeader className="workspace-header" data-testid="workspace-header">
          <Space size="large">
            <Avatar shape="square" size={32}>
              SD
            </Avatar>
            <TypographyText bold>交付工作台</TypographyText>
            <Tag>演示项目</Tag>
          </Space>
          <Space size="large">
            <Badge count={3}>
              <Button onClick={() => setDrawer(true)}>消息</Button>
            </Badge>
            <Avatar size={32}>林</Avatar>
          </Space>
        </LayoutHeader>
        <Layout>
          <LayoutSider width={168} className="workspace-sidebar">
            <Menu selectedKeys={[tab]} onMenuItemClick={setTab}>
              <MenuItem itemKey="tasks">项目概览</MenuItem>
              <MenuItem itemKey="activity">交付动态</MenuItem>
              <MenuItem itemKey="settings">发布设置</MenuItem>
            </Menu>
            <Divider />
            <Space direction="vertical" className="sidebar-summary">
              <TypographyText type="secondary">本月工作空间</TypographyText>
              <Progress percent={0.68} size="small" />
              <TypographyText type="secondary">已使用 68% 配额</TypographyText>
            </Space>
          </LayoutSider>
          <LayoutContent className="workspace-content">
            <Breadcrumb>
              <BreadcrumbItem>工作空间</BreadcrumbItem>
              <BreadcrumbItem>产品交付</BreadcrumbItem>
            </Breadcrumb>
            <PageHeader
              className="workspace-title"
              title="产品交付"
              subtitle="秋季版本 · 2026 年 9 月"
              showBack={false}
              extra={
                <Space>
                  <Button disabled>归档项目</Button>
                  <Button type="primary" onClick={() => setDialog(true)}>
                    新建任务
                  </Button>
                </Space>
              }
            />
            {saved && (
              <Alert type="success" closable onClose={() => setSaved(false)}>
                任务已创建，团队成员会收到通知。
              </Alert>
            )}
            <Alert
              type="warning"
              title="发布窗口临近，2 项任务需要关注"
              data-testid="workspace-warning"
            >
              品牌站资源尚未确认，请在周四 18:00 前完成检查。
            </Alert>
            <div className="workspace-metrics">
              <Card>
                <Statistic title="交付任务" value={rows.length} />
                <TypographyText type="secondary">本轮发布范围</TypographyText>
              </Card>
              <Card>
                <Statistic
                  title="已完成"
                  value={rows.filter((row) => row.state === 'success').length}
                />
                <Badge status="success" text="回归验证通过" />
              </Card>
              <Card>
                <Statistic
                  title="存在风险"
                  value={rows.filter((row) => row.state === 'warning').length}
                />
                <Badge status="warning" text="需要跟进" />
              </Card>
              <Card>
                <Statistic
                  title="阻塞任务"
                  value={rows.filter((row) => row.state === 'error').length}
                />
                <Badge status="danger" text="环境异常" />
              </Card>
            </div>
            <Tabs activeKey={tab} onActiveKeyChange={(value) => setTab(String(value))}>
              <TabPane paneKey="tasks" title="交付任务">
                <Space className="task-filters" wrap>
                  <Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="搜索任务名称或编号"
                    inputAttrs={{ 'aria-label': '搜索交付任务' }}
                    allowClear
                  />
                  <Select
                    value={filter}
                    onValueChange={(value) => setFilter(String(value))}
                    className="task-status"
                    aria-label="交付状态"
                    options={[
                      { value: 'all', label: '全部状态' },
                      ...Object.entries(states).map(([value, state]) => ({
                        value,
                        label: state.label,
                      })),
                    ]}
                  />
                  <Button
                    onClick={() => {
                      setSearch('');
                      setFilter('all');
                    }}
                  >
                    重置筛选
                  </Button>
                </Space>
                <Table
                  scroll={mobile ? { x: 760 } : undefined}
                  columns={columns}
                  data={filtered}
                  pagination={{ pageSize: 4 }}
                  rowSelection={{ type: 'checkbox', showCheckedAll: true }}
                  bordered={false}
                  stripe
                />
              </TabPane>
              <TabPane paneKey="activity" title="交付动态">
                <Timeline>
                  <TimelineItem label="今天 10:32">
                    客户中心回归通过，已部署预发布环境。
                  </TimelineItem>
                  <TimelineItem label="今天 09:15" dotColor="rgb(var(--sd-warning-6))">
                    品牌站资源缺失，已通知负责人。
                  </TimelineItem>
                  <TimelineItem label="昨天 18:40" dotColor="rgb(var(--sd-danger-6))">
                    支付网关环境检查失败，等待重试。
                  </TimelineItem>
                </Timeline>
              </TabPane>
              <TabPane paneKey="settings" title="发布设置">
                <Form model={form} layout="vertical">
                  <FormItem label="目标环境">
                    <RadioGroup
                      value={form.environment}
                      onValueChange={(value) => update('environment', String(value))}
                      options={['预发布', '生产']}
                    />
                  </FormItem>
                  <FormItem label="资源使用上限">
                    <Slider
                      value={form.capacity}
                      onValueChange={(value) => update('capacity', Number(value))}
                      min={10}
                      max={100}
                    />
                  </FormItem>
                  <FormItem label="检查项">
                    <CheckboxGroup
                      value={form.checks}
                      onValueChange={(value) => update('checks', value.map(String))}
                      options={['回归测试', '安全扫描', '性能基准']}
                    />
                  </FormItem>
                  <FormItem label="发布通知">
                    <Switch
                      value={form.notify}
                      onChange={(value) => update('notify', Boolean(value))}
                    />
                  </FormItem>
                  <FormItem label="只读项目编号">
                    <Input value="PROJ-2026-09" readonly />
                  </FormItem>
                </Form>
              </TabPane>
            </Tabs>
            <div className="workspace-bottom">
              <Card title="发布检查">
                <Space direction="vertical" fill size="medium">
                  <Steps current={2} small>
                    <Step title="构建" />
                    <Step title="检查" status="error" />
                    <Step title="发布" />
                  </Steps>
                  <Alert type="error" title="支付网关检查未通过">
                    连接超时。请检查预发布环境后重试。
                  </Alert>
                  <Alert type="success">客户中心：24 项回归测试全部通过。</Alert>
                  <Alert type="info">生产发布需在维护窗口内执行。</Alert>
                  <Space>
                    <Button status="warning" onClick={() => setDrawer(true)}>
                      查看风险
                    </Button>
                    <Button status="danger" onClick={() => setDrawer(true)}>
                      排查异常
                    </Button>
                    <Button loading>同步检查结果</Button>
                  </Space>
                </Space>
              </Card>
              <Card title="版本记录">
                <Descriptions column={1} size="small">
                  <DescriptionsItem label="发布负责人">林晓</DescriptionsItem>
                  <DescriptionsItem label="当前环境">{form.environment}</DescriptionsItem>
                  <DescriptionsItem label="版本">v2.8.0-rc.2</DescriptionsItem>
                </Descriptions>
                <Divider />
                <Empty description="尚无生产发布记录" />
              </Card>
            </div>
          </LayoutContent>
        </Layout>
        <Modal
          visible={dialog}
          onVisibleChange={setDialog}
          title="新建交付任务"
          footer={false}
          width={mobile ? 'calc(100vw - 32px)' : 480}
        >
          <Form model={form} layout="vertical">
            <FormItem
              label="任务名称"
              validateStatus={attempted && !form.name.trim() ? 'error' : undefined}
              help={attempted && !form.name.trim() ? '请输入任务名称' : undefined}
            >
              <Input
                value={form.name}
                onValueChange={(value) => update('name', value)}
                placeholder="例如：品牌站资源检查"
                inputAttrs={{ 'aria-label': '任务名称' }}
              />
            </FormItem>
            <FormItem label="负责人">
              <Select
                value={form.owner}
                onValueChange={(value) => update('owner', String(value))}
                options={['林晓', '周宁', '陈可']}
              />
            </FormItem>
            <FormItem label="备注">
              <Textarea
                value={form.note}
                onValueChange={(value) => update('note', value)}
                placeholder="补充交付要求"
              />
            </FormItem>
            <Space>
              <Button onClick={() => setDialog(false)}>取消</Button>
              <Button type="primary" onClick={createTask}>
                创建任务
              </Button>
            </Space>
          </Form>
        </Modal>
        <Drawer
          visible={drawer}
          onVisibleChange={setDrawer}
          title="交付检查详情"
          width={mobile ? 'min(420px, calc(100vw - 16px))' : 420}
          footer={false}
        >
          <Space direction="vertical" fill size="large">
            <Alert type="warning">品牌站资源待确认，发布窗口剩余 2 天。</Alert>
            <Alert type="error">支付网关检查失败：预发布环境连接超时。</Alert>
            <Alert type="success">客户中心部署完成，所有回归检查通过。</Alert>
            <TypographyParagraph>
              这是用于检查组件主题、浮层和语义状态的本地演示，不会提交到真实服务。
            </TypographyParagraph>
          </Space>
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
}
