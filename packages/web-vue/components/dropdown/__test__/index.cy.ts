import { h } from 'vue';

import DropdownPanel from '../dropdown-panel.vue';
import Dropdown from '../index';

const Doption = Dropdown.Option;
const DropdownButton = Dropdown.Button;

describe('DropdownPanel', () => {
  it('disables the horizontal scrollbar', () => {
    cy.mount(DropdownPanel, {
      slots: { default: '<li class="sd-dropdown-option">Option</li>' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Scrollbar' }).props('disableHorizontal')).to.equal(
        true,
      );
    });
  });

  it('exposes role=menu and supports arrow-key navigation between menuitems', () => {
    cy.mount(DropdownPanel, {
      slots: {
        default:
          '<li role="menuitem" tabindex="-1">A</li>' +
          '<li role="menuitem" tabindex="-1">B</li>' +
          '<li role="menuitem" tabindex="-1">C</li>',
      },
    });
    cy.get('.sd-dropdown-list').should('have.attr', 'role', 'menu');
    // 打开（挂载）时焦点进入首项
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
    // ArrowDown → 第二项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'ArrowDown' });
    cy.get('[role="menuitem"]').eq(1).should('have.focus');
    // End → 末项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'End' });
    cy.get('[role="menuitem"]').eq(2).should('have.focus');
  });

  it('wraps focus with ArrowUp from the first item and jumps to first with Home', () => {
    cy.mount(DropdownPanel, {
      slots: {
        default:
          '<li role="menuitem" tabindex="-1">A</li>' +
          '<li role="menuitem" tabindex="-1">B</li>' +
          '<li role="menuitem" tabindex="-1">C</li>',
      },
    });
    // 首项 ArrowUp 回绕到末项
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'ArrowUp' });
    cy.get('[role="menuitem"]').eq(2).should('have.focus');
    // Home → 首项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'Home' });
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
  });

  it('does not steal keyboard focus on open when the trigger is hover', () => {
    cy.mount(DropdownPanel, {
      props: { trigger: 'hover' },
      slots: {
        default:
          '<li role="menuitem" tabindex="-1">A</li>' + '<li role="menuitem" tabindex="-1">B</li>',
      },
    });
    cy.get('[role="menuitem"]').eq(0).should('not.have.focus');
  });

  it('shows the empty state and hides the footer when isEmpty', () => {
    cy.mount(DropdownPanel, {
      props: { isEmpty: true },
      slots: { footer: '<div id="panel-footer">Footer</div>' },
    });
    cy.get('.sd-dropdown-empty').should('exist');
    cy.get('#panel-footer').should('not.exist');
  });

  it('renders the footer slot and the has-footer class when not empty', () => {
    cy.mount(DropdownPanel, {
      slots: {
        default: '<li>Option</li>',
        footer: '<div id="panel-footer">Footer</div>',
      },
    });
    cy.get('.sd-dropdown').should('have.class', 'sd-dropdown-has-footer');
    cy.get('.sd-dropdown-footer').should('contain.text', 'Footer');
  });
});

describe('Dropdown', () => {
  it('opens on trigger click at the configured position and closes on outside click', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(Dropdown, {
      props: {
        trigger: 'click',
        position: 'bottom',
        onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
      },
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-trigger-popup').should('have.attr', 'trigger-placement', 'bottom');
    cy.get('.sd-dropdown-option').should('be.visible');
    // 点击空白处关闭
    cy.get('body').click();
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([true, false]);
    });
    cy.get('.sd-dropdown').should('not.be.visible');
  });

  it('emits select with the option value and hides the popup after select', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="copy">Copy</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown-option').click();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('select') ?? [];
      expect(calls).to.have.length(1);
      expect(calls[0][0]).to.equal('copy');
      expect(calls[0][1]).to.be.instanceOf(Event);
    });
    // hideOnSelect 默认 true：选择后隐藏（弹层留在 DOM 但不可见）
    cy.get('.sd-dropdown').should('not.be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
  });

  it('keeps the popup open after select when hideOnSelect is false', () => {
    cy.mount(Dropdown, {
      props: { hideOnSelect: false },
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown-option').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.have.length(1);
    });
    cy.get('.sd-dropdown-option').should('be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
  });

  it('falls back to the option text content as the value when no value prop is given', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption>Plain Option</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown-option').click();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('select') ?? [];
      expect(calls).to.have.length(1);
      expect(calls[0][0]).to.equal('Plain Option');
    });
  });

  it('ignores clicks on disabled options but keeps the popup open', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-doption value="1" disabled>Disabled</sd-doption>' +
          '<sd-doption value="2">Enabled</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown-option').eq(0).should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-dropdown-option').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
    });
    // 点击禁用项不关闭弹层
    cy.get('.sd-dropdown-option').eq(1).should('be.visible');
  });

  it('shows the popup initially with defaultPopupVisible and activates the focused option with Enter', () => {
    cy.mount(Dropdown, {
      props: { defaultPopupVisible: true },
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-doption value="1">Option 1</sd-doption>' +
          '<sd-doption value="2">Option 2</sd-doption>',
      },
    });
    // 注：面板挂载时的自动聚焦发生在 Trigger 定位（visibility:hidden）前会被浏览器拒绝，
    // 故这里手动聚焦首项模拟键盘用户。
    cy.get('[role="menuitem"]').eq(0).focus();
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
    // Enter 激活当前聚焦项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('select') ?? [];
      expect(calls).to.have.length(1);
      expect(calls[0][0]).to.equal('1');
    });
    cy.get('.sd-dropdown').should('not.be.visible');
  });

  it('skips disabled options during arrow-key navigation', () => {
    cy.mount(Dropdown, {
      props: { defaultPopupVisible: true },
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-doption value="1">Option 1</sd-doption>' +
          '<sd-doption value="2" disabled>Option 2</sd-doption>' +
          '<sd-doption value="3">Option 3</sd-doption>',
      },
    });
    // 手动聚焦首项（同上，自动聚焦在弹层定位前不可靠）
    cy.get('[role="menuitem"]').eq(0).focus();
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
    // ArrowDown 跳过禁用项 → 第三项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'ArrowDown' });
    cy.contains('[role="menuitem"]', 'Option 3').should('have.focus');
  });

  it('supports controlled popupVisible and emits update:popupVisible on trigger click', () => {
    cy.mount(Dropdown, {
      props: { popupVisible: true },
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    cy.get('.sd-dropdown-option').should('be.visible');
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('update:popupVisible') ?? [];
      expect(calls).to.deep.equal([[false]]);
    });
    // 受控模式：prop 未变，弹层保持可见
    cy.get('.sd-dropdown-option').should('be.visible');
  });

  it('applies popupMaxHeight as a pixel cap', () => {
    cy.mount(Dropdown, {
      props: { popupMaxHeight: 100, defaultPopupVisible: true },
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption>Option</sd-doption>',
      },
    });
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', '100px');
  });

  it('removes the height cap when popupMaxHeight is false', () => {
    cy.mount(Dropdown, {
      props: { popupMaxHeight: false, defaultPopupVisible: true },
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption>Option</sd-doption>',
      },
    });
    cy.get('.sd-dropdown-list-wrapper')
      .should('have.css', 'max-height', 'none')
      .and('have.css', 'overflow-y', 'hidden');
  });

  it('emits scroll and reachBottom when the panel receives a bottom-reached scroll event', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown').should('be.visible');
    // OverlayScrollbars 的真实滚动回调在组件测试中不可靠（依赖浏览器异步滚动事件），
    // 改为伪造"已滚动到底部"的事件直接走 Scrollbar 的 scroll emit → 面板 handleScroll。
    cy.get('@vue').then(({ wrapper }) => {
      const scrollbar = wrapper.findComponent({ name: 'Scrollbar' });
      const event = new Event('scroll');
      Object.defineProperty(event, 'target', {
        value: { scrollTop: 0, scrollHeight: 100, offsetHeight: 100 },
      });
      scrollbar.vm.$emit('scroll', event);
    });
    cy.get('@vue').should(({ wrapper }) => {
      const panel = wrapper.findComponent({ name: 'DropdownPanel' });
      const scrollCalls = panel.emitted('scroll') ?? [];
      const bottomCalls = panel.emitted('reachBottom') ?? [];
      expect(scrollCalls).to.have.length(1);
      expect(bottomCalls).to.have.length(1);
      // Dropdown 本体转发 scroll/reachBottom
      const forwardedScroll = wrapper.emitted('scroll') ?? [];
      const forwardedBottom = wrapper.emitted('reachBottom') ?? [];
      expect(forwardedScroll).to.have.length(1);
      expect(forwardedBottom).to.have.length(1);
      expect(forwardedScroll[0][0]).to.be.instanceOf(Event);
    });
  });

  it('passes isEmpty through to the panel to show the empty state', () => {
    cy.mount(Dropdown, {
      props: { defaultPopupVisible: true, isEmpty: true },
      slots: {
        default: '<button>Trigger</button>',
        footer: '<div id="dd-footer">Footer</div>',
      },
    });
    cy.get('.sd-dropdown-empty').should('exist');
    cy.get('#dd-footer').should('not.exist');
  });

  it('renders the footer slot under the options', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content: '<sd-doption value="1">Option 1</sd-doption>',
        footer: '<div id="dd-footer">Footer</div>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown').should('have.class', 'sd-dropdown-has-footer');
    cy.get('.sd-dropdown-footer').should('contain.text', 'Footer');
  });

  it('renders group titles from Dgroup', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-dgroup title="Group A"><sd-doption value="1">Option 1</sd-doption></sd-dgroup>',
      },
    });
    cy.get('button').click();
    cy.get('.sd-dropdown-group-title').should('contain.text', 'Group A');
    cy.get('.sd-dropdown-option').should('contain.text', 'Option 1');
  });

  it('renders icon and suffix slots on options', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content: () =>
          h(
            Doption,
            { value: '1' },
            {
              default: () => 'Option 1',
              icon: () => h('span', { id: 'opt-icon' }, 'I'),
              suffix: () => h('span', { id: 'opt-suffix' }, 'S'),
            },
          ),
      },
    });
    cy.get('button').click();
    cy.get('#opt-icon').should('exist');
    cy.get('#opt-icon').parent().should('have.class', 'sd-dropdown-option-icon');
    cy.get('#opt-suffix').parent().should('have.class', 'sd-dropdown-option-suffix');
    cy.get('.sd-dropdown-option').should('have.class', 'sd-dropdown-option-has-suffix');
  });
});

describe('Dsubmenu', () => {
  it('opens its nested panel on click, marks the option active, and closes on second click', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-dsubmenu>Submenu<template #content>' +
          '<sd-doption value="sub-1">Sub 1</sd-doption>' +
          '</template></sd-dsubmenu>',
      },
    });
    cy.get('button').click();
    cy.contains('.sd-dropdown-option', 'Submenu').click();
    // 嵌套面板出现并包含子选项
    cy.get('.sd-dropdown-submenu').should('contain.text', 'Sub 1');
    cy.get('.sd-dropdown-submenu').should('be.visible');
    // 打开期间子菜单触发项高亮
    cy.contains('.sd-dropdown-option', 'Submenu').should('have.class', 'sd-dropdown-option-active');
    // 再次点击关闭
    cy.contains('.sd-dropdown-option', 'Submenu').click();
    cy.get('.sd-dropdown-submenu').should('not.be.visible');
    cy.contains('.sd-dropdown-option', 'Submenu').should(
      'not.have.class',
      'sd-dropdown-option-active',
    );
  });

  it('does not emit select when the submenu itself is clicked to open', () => {
    cy.mount(Dropdown, {
      slots: {
        default: '<button>Trigger</button>',
        content:
          '<sd-dsubmenu>Submenu<template #content>' +
          '<sd-doption value="sub-1">Sub 1</sd-doption>' +
          '</template></sd-dsubmenu>',
      },
    });
    cy.get('button').click();
    cy.contains('.sd-dropdown-option', 'Submenu').click();
    // 子菜单触发项不应触发 select（uninject-context）
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
    });
    cy.get('.sd-dropdown-submenu').should('be.visible');
  });
});

describe('DropdownButton', () => {
  it('emits click from the main button and forwards select from the menu', () => {
    cy.mount(DropdownButton, {
      slots: {
        default: 'Main',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    cy.get('button').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
    // 点击图标按钮打开菜单
    cy.get('button').eq(1).click();
    cy.get('.sd-dropdown-option').should('be.visible');
    cy.get('.sd-dropdown-option').click();
    cy.get('@vue').should(({ wrapper }) => {
      const calls = wrapper.emitted('select') ?? [];
      expect(calls).to.have.length(1);
      expect(calls[0][0]).to.equal('1');
    });
  });

  it('does not emit click or open the popup when disabled', () => {
    cy.mount(DropdownButton, {
      props: { disabled: true },
      slots: {
        default: 'Main',
        content: '<sd-doption value="1">Option 1</sd-doption>',
      },
    });
    // 原生 disabled 按钮吞掉点击
    cy.get('button').eq(0).click({ force: true });
    cy.get('button').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
    cy.get('button').eq(1).should('have.attr', 'aria-expanded', 'false');
  });
});
