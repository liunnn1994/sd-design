/** @jsxImportSource react */
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
} from '@sdata/web-react';
import {
  IconCalendar,
  IconDashboard,
  IconHome,
  IconSettings,
  IconUser,
} from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Layout data-v-94a813d7="" className={'layout-rail-demo'}>
        <LayoutSider
          data-v-94a813d7=""
          rail={true}
          expandOnHover={true}
          railWidth={72}
          width={220}
          theme={'dark'}
          header={
            <>
              <div data-v-94a813d7="" className={'logo'} />
            </>
          }
        >
          <Menu data-v-94a813d7="" theme={'dark'} defaultSelectedKeys={['1']}>
            <MenuItem
              data-v-94a813d7=""
              key={'1'}
              icon={
                <>
                  <IconHome data-v-94a813d7="" />
                </>
              }
            >
              <span data-v-94a813d7="">{'导航 1'}</span>
            </MenuItem>
            <MenuItem
              data-v-94a813d7=""
              key={'2'}
              icon={
                <>
                  <IconUser data-v-94a813d7="" />
                </>
              }
            >
              <span data-v-94a813d7="">{'导航 2'}</span>
            </MenuItem>
            <MenuItem
              data-v-94a813d7=""
              key={'3'}
              icon={
                <>
                  <IconDashboard data-v-94a813d7="" />
                </>
              }
            >
              <span data-v-94a813d7="">{'导航 3'}</span>
            </MenuItem>
            <MenuItem
              data-v-94a813d7=""
              key={'4'}
              icon={
                <>
                  <IconCalendar data-v-94a813d7="" />
                </>
              }
            >
              <span data-v-94a813d7="">{'导航 4'}</span>
            </MenuItem>
            <MenuItem
              data-v-94a813d7=""
              key={'5'}
              icon={
                <>
                  <IconSettings data-v-94a813d7="" />
                </>
              }
            >
              <span data-v-94a813d7="">{'导航 5'}</span>
            </MenuItem>
          </Menu>
        </LayoutSider>
        <Layout data-v-94a813d7="">
          <LayoutHeader data-v-94a813d7="">{'页头'}</LayoutHeader>
          <LayoutContent data-v-94a813d7="">{'内容'}</LayoutContent>
          <LayoutFooter data-v-94a813d7="">{'页脚'}</LayoutFooter>
        </Layout>
      </Layout>
      <style>
        {
          '\n.layout-rail-demo[data-v-94a813d7] {\n    height: 360px;\n    min-height: 280px;\n    overflow: hidden;\n    border-radius: 8px;\n}\n.layout-rail-demo[data-v-94a813d7] .sd-layout-header {\n    height: 64px;\n    color: #fff;\n    line-height: 64px;\n    text-align: center;\n    background: #4096ff;\n    padding-inline: 48px;\n}\n.layout-rail-demo[data-v-94a813d7] .sd-layout-content {\n    min-height: 120px;\n    color: #fff;\n    line-height: 120px;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-rail-demo[data-v-94a813d7] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.logo[data-v-94a813d7] {\n    height: 32px;\n    margin: 16px;\n    background: rgb(255 255 255 / 30%);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
