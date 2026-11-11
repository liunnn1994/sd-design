import { Menu, MenuItem, SubMenu } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconApps, IconBug, IconBulb } from '@sdata/web-react/icon';
import { IconFire, IconSafe } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div data-v-2b1cd92a="" className={'menu-demo'}>
        <Menu
          data-v-2b1cd92a=""
          className={'menu-demo__pop-menu'}
          mode={'pop'}
          showCollapseButton={true}
        >
          <MenuItem
            data-v-2b1cd92a=""
            key={'1'}
            icon={
              <>
                <IconApps data-v-2b1cd92a="" />
              </>
            }
          >
            {' 导航 1 '}
          </MenuItem>
          <SubMenu
            data-v-2b1cd92a=""
            key={'2'}
            icon={
              <>
                <IconBug data-v-2b1cd92a="" />
              </>
            }
            title={<>{'导航 2'}</>}
          >
            <MenuItem data-v-2b1cd92a="" key={'2_0'}>
              {'北京'}
            </MenuItem>
            <MenuItem data-v-2b1cd92a="" key={'2_1'}>
              {'上海'}
            </MenuItem>
            <MenuItem data-v-2b1cd92a="" key={'2_2'}>
              {'广州'}
            </MenuItem>
          </SubMenu>
          <SubMenu
            data-v-2b1cd92a=""
            key={'3'}
            icon={
              <>
                <IconBulb data-v-2b1cd92a="" />
              </>
            }
            title={<>{'导航 3'}</>}
          >
            <MenuItem data-v-2b1cd92a="" key={'3_0'}>
              {'武汉'}
            </MenuItem>
            <MenuItem data-v-2b1cd92a="" key={'3_1'}>
              {'成都'}
            </MenuItem>
          </SubMenu>
          <MenuItem
            data-v-2b1cd92a=""
            key={'4'}
            icon={
              <>
                <IconSafe data-v-2b1cd92a="" />
              </>
            }
          >
            {' 导航 4 '}
          </MenuItem>
          <MenuItem
            data-v-2b1cd92a=""
            key={'5'}
            icon={
              <>
                <IconFire data-v-2b1cd92a="" />
              </>
            }
          >
            {' 导航 5 '}
          </MenuItem>
        </Menu>
      </div>
      <style>
        {
          "\n.menu-demo[data-v-2b1cd92a] {\n    box-sizing: border-box;\n    width: 100%;\n    height: 600px;\n    padding: 40px;\n    background-color: var(--color-neutral-2);\n}\n.menu-demo__pop-menu[data-v-2b1cd92a] {\n    width: 200px;\n    height: 100%;\n    box-shadow: 0 0 1px rgb(0 0 0 / 30%);\n}\n.menu-demo__pop-menu[data-v-2b1cd92a] .sd-menu-collapse-button {\n    width: 32px;\n    height: 32px;\n    border-radius: 50%;\n}\n.menu-demo__pop-menu[data-v-2b1cd92a]:not(.sd-menu-collapsed) .sd-menu-collapse-button {\n    right: 0;\n    bottom: 8px;\n    transform: translateX(50%);\n}\n.menu-demo__pop-menu[data-v-2b1cd92a]:not(.sd-menu-collapsed)::before {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    width: 48px;\n    height: 48px;\n    background-color: inherit;\n    border-radius: 50%;\n    box-shadow:\n      -4px 0 2px var(--color-bg-2),\n      0 0 1px rgb(0 0 0 / 30%);\n    transform: translateX(50%);\n    content: '';\n}\n.menu-demo__pop-menu.sd-menu-collapsed[data-v-2b1cd92a] {\n    width: 48px;\n    height: auto;\n    padding-top: 24px;\n    padding-bottom: 138px;\n    border-radius: 22px;\n}\n.menu-demo__pop-menu.sd-menu-collapsed[data-v-2b1cd92a] .sd-menu-collapse-button {\n    right: 8px;\n    bottom: 8px;\n}\n"
        }
      </style>
    </>
  );
}
