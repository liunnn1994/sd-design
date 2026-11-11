import { useState } from 'react';

import { Button, ConfigProvider, Layout } from '../../src/index';

function WrappedSider() {
  return <Layout.Sider scrollbar={false}>包装侧栏</Layout.Sider>;
}
export function LayoutFixture() {
  const [shown, setShown] = useState(true);
  const [responsive, setResponsive] = useState(true);
  const [hover, setHover] = useState(true);
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [events, setEvents] = useState('');
  return (
    <section>
      <Button onClick={() => setShown(!shown)}>切换包装侧栏</Button>
      <Button onClick={() => setResponsive(!responsive)}>切换侧栏断点</Button>
      <Button onClick={() => setHover(!hover)}>切换窄轨悬停</Button>
      <Button onClick={() => setDark(!dark)}>切换布局主题</Button>
      <output data-testid="layout-events">{events}</output>
      <Layout data-testid="outer-layout">
        <Layout.Header>页头</Layout.Header>
        <Layout data-testid="inner-layout">
          {shown && <WrappedSider />}
          <Layout.Content>内容</Layout.Content>
        </Layout>
        <Layout.Footer>页尾</Layout.Footer>
      </Layout>
      <ConfigProvider themeMode={dark ? 'dark' : 'light'}>
        <Layout style={{ height: 160 }}>
          <Layout.Sider
            data-testid="responsive-sider"
            breakpoint={responsive ? 'md' : undefined}
            collapsedWidth={0}
            onCollapse={(value, type) => setEvents(`${value}:${type}`)}
            scrollbar={false}
          >
            响应内容
          </Layout.Sider>
          <Layout.Content>响应布局内容</Layout.Content>
        </Layout>
        <Layout style={{ height: 160 }}>
          <Layout.Sider
            data-testid="rail-sider"
            rail
            railWidth={60}
            width={240}
            expandOnHover={hover}
            scrollbar={false}
            onRailChange={(value) => setEvents(`rail:${value}`)}
          >
            窄轨内容
          </Layout.Sider>
          <Layout.Content data-testid="rail-content">保持位置</Layout.Content>
        </Layout>
        <Layout.Sider
          data-testid="controlled-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={(value, type) => {
            setCollapsed(value);
            setEvents(`${value}:${type}`);
          }}
          header="侧栏头"
          style={{ height: 180 }}
        >
          滚动内容
        </Layout.Sider>
        <Layout.Sider
          temporary
          defaultCollapsed
          drawerProps={{ unmountOnClose: true }}
          onCollapse={(value, type) => setEvents(`${value}:${type}`)}
        >
          <input aria-label="临时侧栏输入" />
        </Layout.Sider>
      </ConfigProvider>
    </section>
  );
}
