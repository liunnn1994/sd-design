/** @jsxImportSource react */
import {
  Button,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
} from '@sdata/web-react';
import {
  IconMenuFold,
  IconMenuUnfold,
  IconUpload,
  IconUser,
  IconVideoCamera,
} from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <Layout data-v-357a8807="" className={'layout-custom-trigger-demo'}>
        <LayoutSider
          data-v-357a8807=""
          hideTrigger={true}
          collapsible={true}
          theme={'dark'}
          collapsed={collapsed}
        >
          <div data-v-357a8807="" className={'logo'} />
          <Menu data-v-357a8807="" defaultSelectedKeys={['1']}>
            <MenuItem
              data-v-357a8807=""
              key={'1'}
              icon={
                <>
                  <IconUser data-v-357a8807="" />
                </>
              }
            >
              <span data-v-357a8807="">{'导航 1'}</span>
            </MenuItem>
            <MenuItem
              data-v-357a8807=""
              key={'2'}
              icon={
                <>
                  <IconVideoCamera data-v-357a8807="" />
                </>
              }
            >
              <span data-v-357a8807="">{'导航 2'}</span>
            </MenuItem>
            <MenuItem
              data-v-357a8807=""
              key={'3'}
              icon={
                <>
                  <IconUpload data-v-357a8807="" />
                </>
              }
            >
              <span data-v-357a8807="">{'导航 3'}</span>
            </MenuItem>
          </Menu>
        </LayoutSider>
        <Layout data-v-357a8807="">
          <LayoutHeader data-v-357a8807="" className={'header'}>
            <Button
              data-v-357a8807=""
              type={'text'}
              className={'trigger'}
              onClick={toggleCollapsed}
              icon={
                <>
                  {collapsed ? (
                    <IconMenuUnfold data-v-357a8807="" />
                  ) : (
                    <IconMenuFold data-v-357a8807="" />
                  )}
                </>
              }
            />
          </LayoutHeader>
          <LayoutContent data-v-357a8807="" className={'content'}>
            {'内容'}
          </LayoutContent>
        </Layout>
      </Layout>
      <style>
        {
          '\n.layout-custom-trigger-demo[data-v-357a8807] {\n    min-height: 280px;\n    overflow: hidden;\n    border-radius: 8px;\n}\n.layout-custom-trigger-demo .header[data-v-357a8807] {\n    height: 64px;\n    padding: 0;\n    background: #fff;\n}\n.layout-custom-trigger-demo .trigger[data-v-357a8807] {\n    width: 64px;\n    height: 64px;\n    font-size: 16px;\n}\n.layout-custom-trigger-demo .content[data-v-357a8807] {\n    min-height: 280px;\n    margin: 24px 16px;\n    padding: 24px;\n    color: #fff;\n    background: #0958d9;\n    border-radius: 8px;\n}\n.layout-custom-trigger-demo .logo[data-v-357a8807] {\n    height: 32px;\n    margin: 16px;\n    background: rgb(255 255 255 / 30%);\n    border-radius: 6px;\n}\n'
        }
      </style>
    </>
  );
}
