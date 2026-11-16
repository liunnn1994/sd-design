import { defineComponent, h } from 'vue';

import {
  hoverIntentTests,
  intentOptions,
  type IntentMode,
} from '../../../../web-core/tests/browser/hover-intent';
import Cascader, { CascaderPanel } from '../../cascader';
import Dropdown from '../../dropdown';
import Menu from '../../menu';
import Popover from '../../popover';
import Trigger from '../index';

function fixture(mode: IntentMode) {
  const children = (branch: (typeof intentOptions)[number]) =>
    branch.children.map((item) => h('div', { style: { height: '32px' } }, item.label));
  return defineComponent(
    () => () =>
      h('div', { 'data-intent-fixture': '', 'style': { margin: '60px', width: '200px' } }, [
        mode === 'cascader'
          ? h(Cascader, { options: intentOptions, expandTrigger: 'hover', ellipsis: false })
          : mode === 'panel'
            ? h(CascaderPanel, { options: intentOptions, expandTrigger: 'hover', ellipsis: false })
            : mode === 'menu'
              ? h(Menu, { mode: 'pop', ellipsis: false }, () =>
                  intentOptions.map((branch) =>
                    h(Menu.SubMenu, { key: branch.value, title: branch.label }, () =>
                      branch.children.map((item) =>
                        h(Menu.Item, { key: item.value }, () => item.label),
                      ),
                    ),
                  ),
                )
              : mode === 'dropdown'
                ? h(
                    Dropdown,
                    { popupVisible: true },
                    {
                      default: () => h('button', 'Dropdown'),
                      content: () =>
                        intentOptions.map((branch) =>
                          h(
                            Dropdown.Submenu,
                            { trigger: 'hover' },
                            {
                              default: () => branch.label,
                              content: () =>
                                branch.children.map((item) =>
                                  h(Dropdown.Option, { key: item.value }, () => item.label),
                                ),
                            },
                          ),
                        ),
                    },
                  )
                : intentOptions.map((branch) =>
                    mode === 'popover'
                      ? h(
                          Popover,
                          { trigger: 'hover', position: 'rt', contentStyle: { width: '180px' } },
                          {
                            default: () =>
                              h(
                                'button',
                                { style: { display: 'block', width: '200px', height: '32px' } },
                                branch.label,
                              ),
                            content: () => children(branch),
                          },
                        )
                      : h(
                          Trigger,
                          { position: 'rt', contentStyle: { width: '180px' } },
                          {
                            default: () =>
                              h(
                                'button',
                                { style: { display: 'block', width: '200px', height: '32px' } },
                                branch.label,
                              ),
                            content: () => children(branch),
                          },
                        ),
                  ),
      ]),
  );
}

hoverIntentTests((mode) => {
  cy.mount(fixture(mode));
});
