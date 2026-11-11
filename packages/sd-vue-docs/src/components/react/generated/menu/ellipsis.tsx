import { Menu, MenuItem, SubMenu } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconApps } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div data-v-b9a936b1="" className={'menu-demo menu-demo-grid'}>
        <section data-v-b9a936b1="" className={'menu-demo-panel'}>
          <div data-v-b9a936b1="" className={'menu-demo-label'}>
            {'默认纯 CSS 省略'}
          </div>
          <div data-v-b9a936b1="" className={'sd:w-44'}>
            <Menu data-v-b9a936b1="" defaultOpenKeys={['guide']} defaultSelectedKeys={['guide-2']}>
              <SubMenu
                data-v-b9a936b1=""
                key={'guide'}
                icon={
                  <>
                    <IconApps data-v-b9a936b1="" />
                  </>
                }
                title={<>{'这是一个非常长的导航分组标题，用来展示默认菜单省略效果'}</>}
              >
                <MenuItem data-v-b9a936b1="" key={'guide-1'}>
                  {'这是一个非常长的菜单项标题，默认只使用 CSS 做单行省略'}
                </MenuItem>
                <MenuItem data-v-b9a936b1="" key={'guide-2'}>
                  {'切换页面时仍然保持轻量的纯 CSS 省略表现'}
                </MenuItem>
              </SubMenu>
            </Menu>
          </div>
        </section>
        <section data-v-b9a936b1="" className={'menu-demo-panel'}>
          <div data-v-b9a936b1="" className={'menu-demo-label'}>
            {'开启 Ellipsis 组件'}
          </div>
          <div data-v-b9a936b1="" className={'sd:w-44'}>
            <Menu
              data-v-b9a936b1=""
              defaultOpenKeys={['guide']}
              defaultSelectedKeys={['guide-2']}
              ellipsis={true}
              ellipsisProps={{
                tooltip: {
                  position: 'right',
                  mini: true,
                },
              }}
            >
              <SubMenu
                data-v-b9a936b1=""
                key={'guide'}
                icon={
                  <>
                    <IconApps data-v-b9a936b1="" />
                  </>
                }
                title={<>{'这是一个非常长的导航分组标题，用来展示 Ellipsis 组件版本'}</>}
              >
                <MenuItem data-v-b9a936b1="" key={'guide-1'}>
                  {'这是一个非常长的菜单项标题，溢出后可以显示 Tooltip 内容'}
                </MenuItem>
                <MenuItem data-v-b9a936b1="" key={'guide-2'}>
                  {'通过 ellipsis-props 可以继续透传 tooltip 等配置'}
                </MenuItem>
              </SubMenu>
            </Menu>
          </div>
        </section>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-b9a936b1] {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 24px;\n    background-color: var(--color-neutral-2);\n}\n.menu-demo-grid[data-v-b9a936b1] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 20px;\n}\n.menu-demo-panel[data-v-b9a936b1] {\n    display: flex;\n    flex-direction: column;\n    gap: 12px;\n    min-width: 0;\n}\n.menu-demo-label[data-v-b9a936b1] {\n    color: var(--color-text-2);\n    font-weight: 500;\n    line-height: 1.5;\n}\n'
        }
      </style>
    </>
  );
}
