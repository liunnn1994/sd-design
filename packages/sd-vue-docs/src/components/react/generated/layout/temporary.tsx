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
  const onCollapse = (collapsed: boolean, type: 'clickTrigger' | 'responsive' | 'mask') => {
    // eslint-disable-next-line no-console
    console.log('collapsed:', collapsed, type);
  };

  return (
    <>
      <Layout data-v-3598be20="" className={'layout-temporary-demo'}>
        <LayoutSider
          data-v-3598be20=""
          temporary={true}
          defaultCollapsed={true}
          width={220}
          drawerProps={{ placement: 'left', maskClosable: true, escToClose: true }}
          onCollapse={onCollapse}
        >
          <div data-v-3598be20="" className={'logo'} />
          <Menu data-v-3598be20="" defaultSelectedKeys={['1']}>
            <MenuItem
              data-v-3598be20=""
              key={'1'}
              icon={
                <>
                  <IconUser data-v-3598be20="" />
                </>
              }
            >
              <span data-v-3598be20="">{'导航 1'}</span>
            </MenuItem>
            <MenuItem
              data-v-3598be20=""
              key={'2'}
              icon={
                <>
                  <IconVideoCamera data-v-3598be20="" />
                </>
              }
            >
              <span data-v-3598be20="">{'导航 2'}</span>
            </MenuItem>
            <MenuItem
              data-v-3598be20=""
              key={'3'}
              icon={
                <>
                  <IconUpload data-v-3598be20="" />
                </>
              }
            >
              <span data-v-3598be20="">{'导航 3'}</span>
            </MenuItem>
          </Menu>
        </LayoutSider>
        <Layout data-v-3598be20="">
          <LayoutHeader data-v-3598be20="">{'页头'}</LayoutHeader>
          <LayoutContent data-v-3598be20="">{'内容'}</LayoutContent>
          <LayoutFooter data-v-3598be20="">{'页脚'}</LayoutFooter>
        </Layout>
      </Layout>
      <style>
        {
          '\n.layout-temporary-demo[data-v-3598be20] {\n    min-height: 280px;\n    border-radius: 8px;\n    overflow: hidden;\n}\n.layout-temporary-demo[data-v-3598be20] .sd-layout-header {\n    height: 64px;\n    padding-inline: 48px;\n    line-height: 64px;\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.layout-temporary-demo[data-v-3598be20] .sd-layout-content {\n    min-height: 120px;\n    line-height: 120px;\n    color: #fff;\n    text-align: center;\n    background: #0958d9;\n}\n.layout-temporary-demo[data-v-3598be20] .sd-layout-footer {\n    color: #fff;\n    text-align: center;\n    background: #4096ff;\n}\n.logo[data-v-3598be20] {\n    height: 32px;\n    margin: 16px;\n    background: rgba(0, 0, 0, 0.08);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
