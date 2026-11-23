import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { intentOptions } from '../../../web-core/tests/browser/hover-intent';
import { Cascader, CascaderPanel } from '../../src/cascader/index.js';
import { Doption, Dropdown, Dsubmenu } from '../../src/dropdown/index.js';
import { Menu, MenuItem, SubMenu } from '../../src/menu/index.js';
import { Popover } from '../../src/popover/index.js';
import { Trigger } from '../../src/trigger/index.js';
import '../../styles/index.scss';

const mode = new URLSearchParams(location.search).get('mode');
const children = (branch: (typeof intentOptions)[number]) =>
  branch.children.map((item) => (
    <div key={item.value} style={{ height: 32 }}>
      {item.label}
    </div>
  ));
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div data-intent-fixture style={{ margin: 60, width: 200 }}>
      {mode === 'cascader' ? (
        <Cascader options={intentOptions} expandTrigger="hover" ellipsis={false} />
      ) : mode === 'panel' ? (
        <CascaderPanel options={intentOptions} expandTrigger="hover" ellipsis={false} />
      ) : mode === 'menu' ? (
        <Menu mode="pop" ellipsis={false}>
          {intentOptions.map((branch) => (
            <SubMenu key={branch.value} title={branch.label}>
              {branch.children.map((item) => (
                <MenuItem key={item.value}>{item.label}</MenuItem>
              ))}
            </SubMenu>
          ))}
        </Menu>
      ) : mode === 'dropdown' ? (
        <Dropdown
          popupVisible
          content={intentOptions.map((branch) => (
            <Dsubmenu
              key={branch.value}
              trigger="hover"
              content={branch.children.map((item) => (
                <Doption key={item.value}>{item.label}</Doption>
              ))}
            >
              {branch.label}
            </Dsubmenu>
          ))}
        >
          <button>Dropdown</button>
        </Dropdown>
      ) : (
        intentOptions.map((branch) =>
          mode === 'popover' ? (
            <Popover
              key={branch.value}
              trigger="hover"
              position="rt"
              contentStyle={{ width: 180 }}
              content={children(branch)}
            >
              <button style={{ display: 'block', width: 200, height: 32 }}>{branch.label}</button>
            </Popover>
          ) : (
            <Trigger
              key={branch.value}
              position="rt"
              contentStyle={{ width: 180 }}
              content={children(branch)}
            >
              <button style={{ display: 'block', width: 200, height: 32 }}>{branch.label}</button>
            </Trigger>
          ),
        )
      )}
    </div>
  </StrictMode>,
);
