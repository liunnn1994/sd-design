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
  return (
    <>
      <Layout data-v-1b4b4a23="" className={'layout-fixed-demo'}>
        <LayoutHeader data-v-1b4b4a23="" className={'header'}>
          {'页头'}
        </LayoutHeader>
        <Layout data-v-1b4b4a23="" className={'body'}>
          <LayoutSider data-v-1b4b4a23="" className={'sider'} collapsible={true}>
            <div data-v-1b4b4a23="" className={'logo'} />
            <Menu data-v-1b4b4a23="" defaultSelectedKeys={['1']}>
              <MenuItem
                data-v-1b4b4a23=""
                key={'1'}
                icon={
                  <>
                    <IconUser data-v-1b4b4a23="" />
                  </>
                }
              >
                <span data-v-1b4b4a23="">{'导航 1'}</span>
              </MenuItem>
              <MenuItem
                data-v-1b4b4a23=""
                key={'2'}
                icon={
                  <>
                    <IconVideoCamera data-v-1b4b4a23="" />
                  </>
                }
              >
                <span data-v-1b4b4a23="">{'导航 2'}</span>
              </MenuItem>
              <MenuItem
                data-v-1b4b4a23=""
                key={'3'}
                icon={
                  <>
                    <IconUpload data-v-1b4b4a23="" />
                  </>
                }
              >
                <span data-v-1b4b4a23="">{'导航 3'}</span>
              </MenuItem>
            </Menu>
          </LayoutSider>
          <LayoutContent data-v-1b4b4a23="" className={'content'}>
            {'内容'}
          </LayoutContent>
        </Layout>
        <LayoutFooter data-v-1b4b4a23="" className={'footer'}>
          {'页脚'}
        </LayoutFooter>
      </Layout>
      <style>
        {
          '\n.layout-fixed-demo[data-v-1b4b4a23] {\n    height: 360px;\n    overflow: auto;\n    border-radius: 8px;\n}\n.layout-fixed-demo .header[data-v-1b4b4a23] {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n    height: 64px;\n    line-height: 64px;\n    color: var(--sd-color-text-1);\n    text-align: center;\n    background: var(--sd-color-fill-3);\n    padding-inline: 48px;\n}\n.layout-fixed-demo .body[data-v-1b4b4a23] {\n    flex: none;\n    min-height: 480px;\n}\n.layout-fixed-demo .sider[data-v-1b4b4a23] {\n    text-align: center;\n    background: var(--sd-color-fill-1);\n}\n.layout-fixed-demo .content[data-v-1b4b4a23] {\n    min-height: 120px;\n    line-height: 120px;\n    text-align: center;\n    background: var(--sd-color-fill-4);\n}\n.layout-fixed-demo .footer[data-v-1b4b4a23] {\n    text-align: center;\n    background: var(--sd-color-fill-3);\n}\n.layout-fixed-demo .logo[data-v-1b4b4a23] {\n    height: 32px;\n    margin: 16px;\n    background: rgb(0 0 0 / 30%);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
