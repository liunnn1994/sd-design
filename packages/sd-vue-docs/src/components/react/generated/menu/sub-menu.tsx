import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconMenuFold, IconMenuUnfold, IconApps, IconBug, IconBulb } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div data-v-a520d47c="" className={'menu-demo'}>
        <Menu
          data-v-a520d47c=""
          style={{ width: '200px', height: '100%' }}
          defaultOpenKeys={['0']}
          defaultSelectedKeys={['0_1']}
          showCollapseButton={true}
        >
          <MenuItem data-v-a520d47c="" key={'0_0_0'} data-obj={'1'}>
            {'菜单 1'}
          </MenuItem>
          <SubMenu
            data-v-a520d47c=""
            key={'0'}
            icon={
              <>
                <IconApps data-v-a520d47c="" />
              </>
            }
            title={<>{'导航 1'}</>}
          >
            <MenuItem data-v-a520d47c="" key={'0_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-a520d47c="" key={'0_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-a520d47c="" key={'0_2'} disabled={true}>
              {'菜单 3'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-a520d47c=""
            key={'1'}
            icon={
              <>
                <IconBug data-v-a520d47c="" />
              </>
            }
            title={<>{'导航 2'}</>}
          >
            <MenuItem data-v-a520d47c="" key={'1_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-a520d47c="" key={'1_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-a520d47c="" key={'1_2'}>
              {'菜单 3'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-a520d47c=""
            key={'2'}
            icon={
              <>
                <IconBulb data-v-a520d47c="" />
              </>
            }
            title={<>{'导航 3'}</>}
          >
            <MenuItemGroup data-v-a520d47c="" title={'菜单组 1'}>
              <MenuItem data-v-a520d47c="" key={'2_0'}>
                {'菜单 1'}
              </MenuItem>
              <MenuItem data-v-a520d47c="" key={'2_1'}>
                {'菜单 2'}
              </MenuItem>
            </MenuItemGroup>
            <MenuItemGroup data-v-a520d47c="" title={'菜单组 2'}>
              <MenuItem data-v-a520d47c="" key={'2_2'}>
                {'菜单 3'}
              </MenuItem>
              <MenuItem data-v-a520d47c="" key={'2_3'}>
                {'菜单 4'}
              </MenuItem>
            </MenuItemGroup>
          </SubMenu>
        </Menu>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-a520d47c] {\n    box-sizing: border-box;\n    width: 100%;\n    height: 600px;\n    padding: 40px;\n    background-color: var(--color-neutral-2);\n}\n'
        }
      </style>
    </>
  );
}
