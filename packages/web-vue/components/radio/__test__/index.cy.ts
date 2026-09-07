import { defineComponent, h, ref } from 'vue';

import Radio from '../index';

describe('Radio', () => {
  it('should emit change event', () => {
    cy.mount(Radio, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-radio').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should not be toggleable when disabled', () => {
    cy.mount(Radio, { props: { value: 'test', disabled: true } });
    cy.get('input').should('be.disabled');
  });

  it('should emit change event in a group', () => {
    cy.mount(Radio.Group, {
      slots: {
        default: '<sd-radio value="1">Option1</sd-radio><sd-radio value="2">Option2</sd-radio>',
      },
    });
    cy.get('.sd-radio').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('group exposes role=radiogroup and a shared name for arrow-key nav', () => {
    cy.mount(Radio.Group, {
      slots: {
        default: '<sd-radio value="1">Option1</sd-radio><sd-radio value="2">Option2</sd-radio>',
      },
    });
    cy.get('.sd-radio-group').should('have.attr', 'role', 'radiogroup');
    // 组内 radio 共享同一个 name（原生方向键分组导航的前提）
    cy.get('input[type="radio"]')
      .eq(0)
      .invoke('attr', 'name')
      .then((name1) => {
        cy.get('input[type="radio"]').eq(1).should('have.attr', 'name', name1);
      });
  });

  it('renders a native radio with label association', () => {
    cy.mount(Radio, {
      props: { value: 'test' },
      slots: { default: 'My Label' },
    });
    cy.get('input[type="radio"]').should('exist');
  });

  it('supports v-model: emits the option value and reflects the controlled checked state', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const checked = ref<string | boolean>(false);
          const onUpdate = (next: string | boolean) => {
            handleUpdate(next);
            checked.value = next;
          };
          return () =>
            h(
              Radio,
              {
                'modelValue': checked.value,
                'value': 'yes',
                'onUpdate:modelValue': onUpdate,
              },
              () => 'Label',
            );
        },
      }),
    );
    cy.get('input').should('not.be.checked');
    cy.get('.sd-radio').click();
    cy.get('@handleUpdate').should('have.been.calledWith', 'yes');
    cy.get('input').should('be.checked');
    // 已选中的 radio 再次点击不产生新的更新（原生 change 只在选中态变化时触发）
    cy.get('.sd-radio').click();
    cy.get('@handleUpdate').should('not.have.been.calledTwice');
  });

  it('emits change with the value and the native event', () => {
    cy.mount(Radio, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-radio').click();
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(1);
      const payload = change?.[0];
      const firstArg = payload?.[0];
      const secondArg = payload?.[1];
      expect(firstArg).to.equal('test');
      expect(secondArg instanceof Event).to.equal(true);
    });
  });

  it('defaultChecked renders checked without interaction (uncontrolled)', () => {
    cy.mount(Radio, { props: { defaultChecked: true } });
    cy.get('input').should('be.checked');
  });

  it('type=button renders the button variant with button content wrapper', () => {
    cy.mount(Radio, { props: { type: 'button' }, slots: { default: 'Label' } });
    cy.get('.sd-radio-button').should('exist');
    cy.get('.sd-radio-button-content').should('have.text', 'Label');
  });

  it('group defaultValue selects an option without interaction (uncontrolled)', () => {
    cy.mount(Radio.Group, {
      props: { defaultValue: '2' },
      slots: {
        default: '<sd-radio value="1">A</sd-radio><sd-radio value="2">B</sd-radio>',
      },
    });
    cy.get('input').eq(1).should('be.checked');
  });

  it('group v-model: emits the selected value and stays in sync with the controlled modelValue', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const selected = ref<string | number | boolean>('1');
          const onUpdate = (next: string | number | boolean) => {
            handleUpdate(next);
            selected.value = next;
          };
          return () =>
            h(
              Radio.Group,
              { 'modelValue': selected.value, 'onUpdate:modelValue': onUpdate },
              {
                default: () => [
                  h(Radio, { value: '1' }, () => 'A'),
                  h(Radio, { value: '2' }, () => 'B'),
                ],
              },
            );
        },
      }),
    );
    cy.get('input').eq(0).should('be.checked');
    cy.get('input').eq(1).should('not.be.checked');
    cy.get('.sd-radio').eq(1).click();
    cy.get('@handleUpdate').should('have.been.calledWith', '2');
    cy.get('input').eq(1).should('be.checked');
    cy.get('input').eq(0).should('not.be.checked');
  });

  it('group options render plain, object and function labels with per-option disabled', () => {
    cy.mount(Radio.Group, {
      props: {
        modelValue: 'b',
        options: [
          'a',
          2,
          { label: 'B', value: 'b', disabled: true },
          { label: () => 'Fn', value: 'd' },
        ],
      },
    });
    cy.get('.sd-radio').should('have.length', 4);
    cy.get('.sd-radio-label').eq(0).should('have.text', 'a');
    cy.get('.sd-radio-label').eq(1).should('have.text', '2');
    cy.get('label.sd-radio').eq(2).should('have.class', 'sd-radio-disabled');
    cy.get('input').eq(2).should('be.disabled');
    cy.get('label.sd-radio').eq(2).should('have.class', 'sd-radio-checked');
    cy.get('label.sd-radio').eq(3).should('have.text', 'Fn');
  });

  it('group label slot overrides option labels', () => {
    cy.mount(Radio.Group, {
      props: { options: [{ label: 'Original', value: 'a' }] },
      slots: {
        label:
          '<template #label="{ data }"><b class="custom-label">{{ data.value }}</b></template>',
      },
    });
    cy.get('.custom-label').should('have.text', 'a');
  });

  it('group direction and size drive modifier classes', () => {
    cy.mount(Radio.Group, {
      props: { direction: 'vertical', size: 'small' },
      slots: { default: '<sd-radio value="1">A</sd-radio>' },
    });
    cy.get('.sd-radio-group')
      .should('have.class', 'sd-radio-group-direction-vertical')
      .and('have.class', 'sd-radio-group-size-small');
    cy.mount(Radio.Group, {
      slots: { default: '<sd-radio value="1">A</sd-radio>' },
    });
    cy.get('.sd-radio-group').should('have.class', 'sd-radio-group-direction-horizontal');
    cy.get('.sd-radio-group').should('have.class', 'sd-radio-group-size-medium');
  });

  it('group disabled propagates to every radio', () => {
    cy.mount(Radio.Group, {
      props: { disabled: true },
      slots: {
        default: '<sd-radio value="1">A</sd-radio><sd-radio value="2">B</sd-radio>',
      },
    });
    cy.get('.sd-radio')
      .should('have.length', 2)
      .each(($el) => {
        expect($el.hasClass('sd-radio-disabled')).to.equal(true);
      });
    cy.get('input').each(($el) => {
      expect($el.prop('disabled')).to.equal(true);
    });
  });

  it('group type=button renders the button variant for the group and every radio', () => {
    cy.mount(Radio.Group, {
      props: { type: 'button', modelValue: '1' },
      slots: {
        default: '<sd-radio value="1">A</sd-radio><sd-radio value="2">B</sd-radio>',
      },
    });
    cy.get('.sd-radio-group-button').should('exist');
    cy.get('.sd-radio-button').should('have.length', 2);
  });

  it('arrow keys move the selection within the group via the shared native name', () => {
    cy.mount(Radio.Group, {
      slots: {
        default:
          '<sd-radio value="1">A</sd-radio><sd-radio value="2">B</sd-radio><sd-radio value="3">C</sd-radio>',
      },
    });
    cy.get('input').eq(0).focus();
    cy.focused().type('{rightArrow}');
    cy.get('input').eq(1).should('be.checked');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(1);
      const payload = change?.[0];
      const firstArg = payload?.[0];
      expect(firstArg).to.equal('2');
    });
  });

  it('radio slot replaces the visual and receives the checked/disabled scope', () => {
    cy.mount(Radio, {
      props: { modelValue: true, disabled: true },
      slots: {
        default: 'Label',
        radio:
          '<template #radio="{ checked, disabled }"><span class="custom-radio" :data-checked="checked ? \'yes\' : \'no\'" :data-disabled="disabled ? \'yes\' : \'no\'">X</span></template>',
      },
    });
    cy.get('.custom-radio')
      .should('have.attr', 'data-checked', 'yes')
      .and('have.attr', 'data-disabled', 'yes');
    // 自定义渲染替换默认视觉（icon-hover 不再渲染）
    cy.get('.sd-radio-icon-hover').should('not.exist');
  });

  it('uninjectGroupContext renders standalone inside a group (no group change events)', () => {
    cy.mount(Radio.Group, {
      slots: {
        default:
          '<sd-radio value="1">A</sd-radio><sd-radio :uninject-group-context="true" value="2">B</sd-radio>',
      },
    });
    cy.get('.sd-radio').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    // uninject 的 radio 走独立渲染路径，不触发 group 的 change 事件
    cy.get('.sd-radio').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });
});
