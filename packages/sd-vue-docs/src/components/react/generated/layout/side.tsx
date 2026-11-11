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
  IconCloud,
  IconDashboard,
  IconEmail,
  IconHome,
  IconNotification,
  IconSettings,
  IconUser,
} from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Layout data-v-8d63ef6e="" className={'layout-side-demo'}>
        <LayoutSider
          data-v-8d63ef6e=""
          collapsible={true}
          theme={'dark'}
          header={
            <>
              <div data-v-8d63ef6e="" className={'logo'} />
            </>
          }
        >
          <Menu data-v-8d63ef6e="" theme={'dark'} defaultSelectedKeys={['1']}>
            <MenuItem
              data-v-8d63ef6e=""
              key={'1'}
              icon={
                <>
                  <IconHome data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 1'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'2'}
              icon={
                <>
                  <IconUser data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 2'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'3'}
              icon={
                <>
                  <IconDashboard data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 3'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'4'}
              icon={
                <>
                  <IconCalendar data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 4'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'5'}
              icon={
                <>
                  <IconEmail data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 5'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'6'}
              icon={
                <>
                  <IconNotification data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 6'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'7'}
              icon={
                <>
                  <IconCloud data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 7'}</span>
            </MenuItem>
            <MenuItem
              data-v-8d63ef6e=""
              key={'8'}
              icon={
                <>
                  <IconSettings data-v-8d63ef6e="" />
                </>
              }
            >
              <span data-v-8d63ef6e="">{'导航 8'}</span>
            </MenuItem>
          </Menu>
        </LayoutSider>
        <Layout data-v-8d63ef6e="">
          <LayoutHeader data-v-8d63ef6e="">{'页头'}</LayoutHeader>
          <LayoutContent data-v-8d63ef6e="">{'内容'}</LayoutContent>
          <LayoutFooter data-v-8d63ef6e="">{'页脚'}</LayoutFooter>
        </Layout>
      </Layout>
      <style>
        {
          '\n.layout-side-demo[data-v-8d63ef6e] {\n    height: 360px;\n    min-height: 280px;\n    overflow: hidden;\n    border-radius: 8px;\n}\n.layout-side-demo[data-v-8d63ef6e] .sd-layout-header {\n    height: 64px;\n    color: #fff;\n    line-height: 64px;\n    text-align: center;\n    background: #4096ff;\n    padding-inline: 48px;\n}\n.layout-side-demo[data-v-8d63ef6e] .sd-layout-content {\n    min-height: 120px;\n    color: #fff;\n    line-height: 120px;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-side-demo[data-v-8d63ef6e] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.logo[data-v-8d63ef6e] {\n    height: 32px;\n    margin: 16px;\n    background: rgb(255 255 255 / 30%);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
