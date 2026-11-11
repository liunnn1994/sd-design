import { Menu, MenuItem, Slider, SubMenu } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconApps, IconBug, IconBulb } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [width, setWidth] = useState(240);

  return (
    <>
      <div data-v-cf24a111="" className={'menu-demo'}>
        <Slider
          data-v-cf24a111=""
          className={'sd:w-80 sd:mb-6'}
          value={width}
          onValueChange={(next) => setWidth(next as typeof width)}
          step={10}
          min={160}
          max={400}
        />
        <Menu
          data-v-cf24a111=""
          showCollapseButton={true}
          defaultOpenKeys={['0']}
          defaultSelectedKeys={['0_1']}
          style={{ width: `${width}px`, height: 'calc(100% - 28px)' }}
        >
          <SubMenu
            data-v-cf24a111=""
            key={'0'}
            icon={
              <>
                <IconApps data-v-cf24a111="" />
              </>
            }
            title={<>{'导航 1'}</>}
          >
            <MenuItem data-v-cf24a111="" key={'0_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'0_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'0_2'} disabled={true}>
              {' 菜单 3 '}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-cf24a111=""
            key={'1'}
            icon={
              <>
                <IconBug data-v-cf24a111="" />
              </>
            }
            title={<>{'导航 2'}</>}
          >
            <MenuItem data-v-cf24a111="" key={'1_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'1_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'1_2'}>
              {'菜单 3'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-cf24a111=""
            key={'2'}
            icon={
              <>
                <IconBulb data-v-cf24a111="" />
              </>
            }
            title={<>{'导航 3'}</>}
          >
            <MenuItem data-v-cf24a111="" key={'2_0'}>
              {'菜单 1'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'2_1'}>
              {'菜单 2'}
            </MenuItem>
            <MenuItem data-v-cf24a111="" key={'2_2'}>
              {'菜单 3'}
            </MenuItem>
          </SubMenu>
        </Menu>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-cf24a111] {\n    box-sizing: border-box;\n    width: 100%;\n    height: 600px;\n    padding: 40px;\n    background-color: var(--color-neutral-2);\n}\n'
        }
      </style>
    </>
  );
}
