/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Menu, MenuItem } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div data-v-8328ddc8="" className={'menu-demo'}>
        <Menu data-v-8328ddc8="" mode={'horizontal'} theme={'dark'} defaultSelectedKeys={['1']}>
          <MenuItem
            data-v-8328ddc8=""
            key={'0'}
            style={{ padding: 0, marginRight: '38px' }}
            disabled={true}
          >
            <div
              data-v-8328ddc8=""
              style={
                {
                  width: '80px',
                  height: '30px',
                  background: `var(${getCssVarToken('--color-fill-3')})`,
                  cursor: 'text',
                } as CSSProperties
              }
            />
          </MenuItem>
          <MenuItem data-v-8328ddc8="" key={'1'}>
            {'首页'}
          </MenuItem>
          <MenuItem data-v-8328ddc8="" key={'2'}>
            {'解决方案'}
          </MenuItem>
          <MenuItem data-v-8328ddc8="" key={'3'}>
            {'云服务'}
          </MenuItem>
          <MenuItem data-v-8328ddc8="" key={'4'}>
            {'协作'}
          </MenuItem>
        </Menu>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-8328ddc8] {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 40px;\n    background-color: var(--sd-color-neutral-2);\n}\n'
        }
      </style>
    </>
  );
}
