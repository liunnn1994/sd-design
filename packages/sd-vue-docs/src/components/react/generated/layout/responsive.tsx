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
import { IconUpload, IconUser, IconVideoCamera } from '@sdata/web-react/icon';

export default function Example() {
  const onBreakpoint = (broken: boolean) => {
    // eslint-disable-next-line no-console
    console.log('broken:', broken);
  };
  const onCollapse = (collapsed: boolean, type: 'clickTrigger' | 'responsive' | 'mask') => {
    // eslint-disable-next-line no-console
    console.log('collapsed:', collapsed, type);
  };

  return (
    <>
      <Layout data-v-2279b597="" className={'layout-responsive-demo'}>
        <LayoutSider
          data-v-2279b597=""
          breakpoint={'lg'}
          collapsedWidth={'0'}
          theme={'dark'}
          onBreakpoint={onBreakpoint}
          onCollapse={onCollapse}
        >
          <div data-v-2279b597="" className={'logo'} />
          <Menu data-v-2279b597="" theme={'dark'} defaultSelectedKeys={['1']}>
            <MenuItem
              data-v-2279b597=""
              key={'1'}
              icon={
                <>
                  <IconUser data-v-2279b597="" />
                </>
              }
            >
              <span data-v-2279b597="">{'导航 1'}</span>
            </MenuItem>
            <MenuItem
              data-v-2279b597=""
              key={'2'}
              icon={
                <>
                  <IconVideoCamera data-v-2279b597="" />
                </>
              }
            >
              <span data-v-2279b597="">{'导航 2'}</span>
            </MenuItem>
            <MenuItem
              data-v-2279b597=""
              key={'3'}
              icon={
                <>
                  <IconUpload data-v-2279b597="" />
                </>
              }
            >
              <span data-v-2279b597="">{'导航 3'}</span>
            </MenuItem>
            <MenuItem
              data-v-2279b597=""
              key={'4'}
              icon={
                <>
                  <IconUpload data-v-2279b597="" />
                </>
              }
            >
              <span data-v-2279b597="">{'导航 4'}</span>
            </MenuItem>
          </Menu>
        </LayoutSider>
        <Layout data-v-2279b597="">
          <LayoutHeader data-v-2279b597="">{'页头'}</LayoutHeader>
          <LayoutContent data-v-2279b597="">{'内容'}</LayoutContent>
          <LayoutFooter data-v-2279b597="">{'页脚'}</LayoutFooter>
        </Layout>
      </Layout>
      <style>
        {
          '\n.layout-responsive-demo[data-v-2279b597] {\n    min-height: 280px;\n    border-radius: 8px;\n    overflow: hidden;\n}\n.layout-responsive-demo[data-v-2279b597] .sd-layout-header {\n    height: 64px;\n    padding-inline: 48px;\n    line-height: 64px;\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.layout-responsive-demo[data-v-2279b597] .sd-layout-content {\n    min-height: 120px;\n    line-height: 120px;\n    color: #fff;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-responsive-demo[data-v-2279b597] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.logo[data-v-2279b597] {\n    height: 32px;\n    margin: 16px;\n    background: rgba(255, 255, 255, 0.3);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
