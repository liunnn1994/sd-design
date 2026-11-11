import { Button, Menu, MenuItem, SubMenu } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconMenuFold, IconMenuUnfold, IconApps, IconBug, IconBulb } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [collapsed, setCollapsed] = useState(false);
  function toggleCollapse() {
    setCollapsed(!collapsed);
  }

  return (
    <>
      <div data-v-b69b9e94="" className={'menu-demo'}>
        <Button
          data-v-b69b9e94=""
          className={'sd:mb-1! sd:h-7.5 sd:px-3 sd:leading-7.5'}
          type={'primary'}
          onClick={toggleCollapse}
        >
          {collapsed ? <IconMenuUnfold data-v-b69b9e94="" /> : <IconMenuFold data-v-b69b9e94="" />}
        </Button>
        <Menu
          data-v-b69b9e94=""
          style={{ width: '200px', borderRadius: '4px' }}
          theme={'dark'}
          collapsed={collapsed}
          defaultOpenKeys={['0']}
          defaultSelectedKeys={['0_2']}
        >
          <SubMenu
            data-v-b69b9e94=""
            key={'0'}
            icon={
              <>
                <IconApps data-v-b69b9e94="" />
              </>
            }
            title={<>{'导航 1'}</>}
          >
            <MenuItem data-v-b69b9e94="" key={'0_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'0_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'0_2'}>
              {'菜单 3'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'0_3'}>
              {'菜单 4'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-b69b9e94=""
            key={'1'}
            icon={
              <>
                <IconBug data-v-b69b9e94="" />
              </>
            }
            title={<>{'导航 2'}</>}
          >
            <MenuItem data-v-b69b9e94="" key={'1_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'1_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'1_2'}>
              {'菜单 3'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-b69b9e94=""
            key={'2'}
            icon={
              <>
                <IconBulb data-v-b69b9e94="" />
              </>
            }
            title={<>{'导航 3'}</>}
          >
            <MenuItem data-v-b69b9e94="" key={'2_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-b69b9e94="" key={'2_1'}>
              {'菜单 2'}
            </MenuItem>
            <SubMenu data-v-b69b9e94="" key={'2_2'} title={'导航 4'}>
              <MenuItem data-v-b69b9e94="" key={'2_2_0'}>
                {'菜单 1'}
              </MenuItem>
              <MenuItem data-v-b69b9e94="" key={'2_2_1'}>
                {'菜单 2'}
              </MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-b69b9e94] {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 40px;\n    background-color: var(--color-neutral-2);\n}\n'
        }
      </style>
    </>
  );
}
