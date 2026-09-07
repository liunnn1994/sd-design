import { defineComponent } from 'vue';

import Mention from '../index';

const data = ['Bytedance', 'Bytedesign', 'Bytenumner'];

// 与 demo.cy.ts 同源的问题：textarea 变体的 handleResize 会在 onMounted 之前被真实
// ResizeObserver 触发，此时 styleDeclaration 尚未赋值，getSizeStyles 读
// getComputedStyle 报错。仅在挂载初期出现，按 demo 的方式忽略该噪音。
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('getPropertyValue')) {
    return false;
  }
  return undefined;
});

describe('Mention', () => {
  it('renders the dropdown on @', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.sd-select-option').should('exist');
  });

  it('exposes combobox/listbox/option semantics', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    // 触发器（input）aria-haspopup=listbox，弹层 listbox，选项 option
    cy.get('input').should('have.attr', 'aria-haspopup', 'listbox');
    cy.get('.sd-select-dropdown-list').should('have.attr', 'role', 'listbox');
    cy.get('.sd-select-option').should('have.attr', 'role', 'option');
  });

  it('selects a value via keyboard', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('input').type('{downarrow}');
    cy.get('.sd-select-option-active').should('contain.text', 'Bytedesign');
    cy.get('input').type('{uparrow}');
    cy.get('.sd-select-option-active').should('contain.text', 'Bytedance');
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]).to.deep.equal(['@Bytedance']);
    });
  });

  it('emits update:modelValue, change and search while typing a prefix', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@by');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([['@'], ['@b'], ['@by']]);
      expect(wrapper.emitted('change')).to.deep.equal([['@'], ['@b'], ['@by']]);
      expect(wrapper.emitted('search')).to.deep.equal([
        ['', '@'],
        ['b', '@'],
        ['by', '@'],
      ]);
    });
  });

  it('filters options by the search text after the prefix', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@design');
    cy.get('.sd-select-option').should('have.length', 1);
    cy.get('.sd-select-option').should('contain.text', 'Bytedesign');
  });

  it('selects an option with a mouse click and emits select/change', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.sd-select-option').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.deep.equal([['Bytedesign']]);
      const changes = wrapper.emitted('change') ?? [];
      expect(changes[1]).to.deep.equal(['@Bytedesign']);
    });
  });

  it('skips disabled options for click and keyboard selection', () => {
    const objData = [
      { label: 'Alpha', value: 'alpha', disabled: true },
      { label: 'Beta', value: 'beta' },
    ];
    cy.mount(Mention, { props: { data: objData } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.sd-select-option-disabled').should('have.attr', 'aria-disabled', 'true');
    // 激活项是第一个未禁用的选项（Beta），禁用项不会被高亮或选中
    cy.get('.sd-select-option-active').should('contain.text', 'Beta');
    cy.get('.sd-select-option-disabled').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
    });
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.deep.equal([['beta']]);
      const changes = wrapper.emitted('change') ?? [];
      expect(changes[1]).to.deep.equal(['@beta']);
    });
  });

  it('closes the dropdown on Escape and reopens on further typing', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.sd-select-option').should('be.visible');
    cy.get('input').type('{esc}');
    cy.get('.sd-select-dropdown').should('not.be.visible');
    // 重新输入会再次触发 search；用能命中选项过滤的字母（'b'）让选项重新出现
    cy.get('input').type('b');
    cy.get('.sd-select-option').should('be.visible');
  });

  it('does not open the dropdown when the search text contains the split character', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').type('@a b');
    cy.get('.sd-select-dropdown').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')).to.deep.equal([
        ['', '@'],
        ['a', '@'],
      ]);
    });
  });

  it('clears the value via allow-clear and emits clear/change', () => {
    cy.mount(Mention, { props: { allowClear: true } });
    cy.get('input').type('@by');
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      const changes = wrapper.emitted('change') ?? [];
      const lastChange = changes.at(-1);
      expect(lastChange).to.deep.equal(['']);
    });
  });

  it('keeps modelValue as the source of truth and emits update:modelValue on input', () => {
    cy.mount(Mention, { props: { data, modelValue: '@Bytedance' } });
    cy.get('input').should('have.value', '@Bytedance');
    cy.get('input').type('x');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([['@Bytedancex']]);
    });
  });

  it('emits focus and blur', () => {
    cy.mount(Mention, { props: { data } });
    cy.get('input').focus();
    cy.get('input').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('supports custom and multiple prefixes', () => {
    cy.mount(Mention, { props: { data, prefix: ['#', '@'] } });
    cy.get('input').focus();
    cy.get('input').type('#de');
    cy.get('.sd-select-option').should('have.length', 1);
    cy.get('.sd-select-option').should('contain.text', 'Bytedesign');
    cy.get('@vue').should(({ wrapper }) => {
      const searchEvents = wrapper.emitted('search') ?? [];
      const lastSearch = searchEvents.at(-1);
      expect(lastSearch).to.deep.equal(['de', '#']);
    });
  });

  it('renders the option slot for object options', () => {
    const SlotMention = defineComponent({
      components: { Mention },
      template: `
        <Mention :data="[{ label: 'Jack', value: 'jack' }]">
          <template #option="{ data: option }">
            <span class="custom-mention-option">{{ option.label }}-custom</span>
          </template>
        </Mention>
      `,
    });
    cy.mount(SlotMention);
    cy.get('input').focus();
    cy.get('input').type('@');
    cy.get('.custom-mention-option').should('contain.text', 'Jack-custom');
  });

  it('supports type="textarea" and selects via Enter', () => {
    cy.mount(Mention, { props: { data, type: 'textarea' } });
    cy.get('textarea').focus();
    cy.get('textarea').type('@');
    cy.get('.sd-select-option').should('exist');
    cy.get('textarea').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change') ?? [];
      expect(changes[1]).to.deep.equal(['@Bytedance']);
    });
  });
});
