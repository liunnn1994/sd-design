/** @jsxImportSource react */
import type { MenuCollapseHandler } from '@sdata/web-react';

import { Message } from '@sdata/web-react';
import { Menu, MenuItem, SubMenu } from '@sdata/web-react';
import { IconApps, IconBug, IconBulb } from '@sdata/web-react/icon';

export default function Example() {
  const onCollapse: MenuCollapseHandler = (_val, type) => {
    const content = type === 'responsive' ? '触发响应式收缩' : '点击触发收缩';
    Message.info({
      content,
      duration: 2000,
    });
  };

  return (
    <>
      <div data-v-1e6c33d2="" className={'menu-demo'}>
        <div data-v-1e6c33d2="" className={'sd:w-50 sd:h-full'}>
          <Menu
            data-v-1e6c33d2=""
            className={'sd:h-full'}
            defaultOpenKeys={['0']}
            defaultSelectedKeys={['0_2']}
            showCollapseButton={true}
            breakpoint={'xl'}
            onCollapse={onCollapse}
          >
            <SubMenu
              data-v-1e6c33d2=""
              key={'0'}
              icon={
                <>
                  <IconApps data-v-1e6c33d2="" />
                </>
              }
              title={<>{'导航 1'}</>}
            >
              <MenuItem data-v-1e6c33d2="" key={'0_0'}>
                {'菜单 1'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'0_1'}>
                {'菜单 2'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'0_2'}>
                {'菜单 3'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'0_3'}>
                {'菜单 4'}
              </MenuItem>
            </SubMenu>
            <SubMenu
              data-v-1e6c33d2=""
              key={'1'}
              icon={
                <>
                  <IconBug data-v-1e6c33d2="" />
                </>
              }
              title={<>{'导航 2'}</>}
            >
              <MenuItem data-v-1e6c33d2="" key={'1_0'}>
                {'菜单 1'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'1_1'}>
                {'菜单 2'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'1_2'}>
                {'菜单 3'}
              </MenuItem>
            </SubMenu>
            <SubMenu
              data-v-1e6c33d2=""
              key={'2'}
              icon={
                <>
                  <IconBulb data-v-1e6c33d2="" />
                </>
              }
              title={<>{'导航 3'}</>}
            >
              <MenuItem data-v-1e6c33d2="" key={'2_0'}>
                {'菜单 1'}
              </MenuItem>
              <MenuItem data-v-1e6c33d2="" key={'2_1'}>
                {'菜单 2'}
              </MenuItem>
              <SubMenu data-v-1e6c33d2="" key={'2_2'} title={'导航 4'}>
                <MenuItem data-v-1e6c33d2="" key={'2_2_0'}>
                  {'菜单 1'}
                </MenuItem>
                <MenuItem data-v-1e6c33d2="" key={'2_2_1'}>
                  {'菜单 2'}
                </MenuItem>
              </SubMenu>
            </SubMenu>
          </Menu>
        </div>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-1e6c33d2] {\n    box-sizing: border-box;\n    width: 100%;\n    height: 600px;\n    padding: 40px;\n    background-color: var(--color-neutral-2);\n}\n'
        }
      </style>
    </>
  );
}
