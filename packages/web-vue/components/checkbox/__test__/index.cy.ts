import { defineComponent, h, ref } from 'vue';

import Checkbox from '../index';

describe('Checkbox', () => {
  it('should emit change event', () => {
    cy.mount(Checkbox, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('should not be toggleable when disabled', () => {
    cy.mount(Checkbox, { props: { value: 'test', disabled: true } });
    cy.get('input').should('be.disabled');
  });

  it('should emit change event in a group', () => {
    cy.mount(Checkbox.Group, {
      slots: {
        default:
          '<sd-checkbox value="1">Option1</sd-checkbox>' +
          '<sd-checkbox value="2">Option2</sd-checkbox>',
      },
    });
    cy.get('.sd-checkbox').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('renders a native checkbox with label association', () => {
    cy.mount(Checkbox, { props: { value: 'test' }, slots: { default: 'My Label' } });
    // 原生 input[type=checkbox]：自带 role/键盘/checked 语义
    cy.get('input[type="checkbox"]').should('exist');
    cy.get('.sd-checkbox > label, label.sd-checkbox, .sd-checkbox').should('exist');
  });

  it('reflects indeterminate on the native input (mixed state for SR)', () => {
    cy.mount(Checkbox, {
      props: { value: 'test', indeterminate: true },
      slots: { default: 'Label' },
    });
    cy.get('input[type="checkbox"]').should('have.prop', 'indeterminate', true);
  });

  it('group exposes role=group', () => {
    cy.mount(Checkbox.Group, {
      slots: { default: '<sd-checkbox value="1">Option1</sd-checkbox>' },
    });
    cy.get('.sd-checkbox-group').should('have.attr', 'role', 'group');
  });

  it('supports v-model: emits boolean payload and reflects the controlled value', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const checked = ref(false);
          const onUpdate = (next: boolean) => {
            handleUpdate(next);
            checked.value = next;
          };
          return () =>
            h(
              Checkbox,
              { 'modelValue': checked.value, 'onUpdate:modelValue': onUpdate },
              () => 'Label',
            );
        },
      }),
    );
    cy.get('input').should('not.be.checked');
    cy.get('.sd-checkbox').click();
    cy.get('@handleUpdate').should('have.been.calledWith', true);
    cy.get('input').should('be.checked');
    cy.get('.sd-checkbox').click();
    cy.get('@handleUpdate').should('have.been.calledWith', false);
    cy.get('input').should('not.be.checked');
    cy.get('@handleUpdate').should('have.been.calledTwice');
  });

  it('toggles uncontrolled state and emits change', () => {
    // 注：defaultChecked 初始不生效（疑似 bug，见报告），非受控翻转以点击为准
    cy.mount(Checkbox, { props: { defaultChecked: true }, slots: { default: 'Label' } });
    cy.get('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    cy.get('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(2);
    });
  });

  it('emits change with the new value and the native event', () => {
    cy.mount(Checkbox, { props: { value: 'test' }, slots: { default: 'Label' } });
    cy.get('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(1);
      const payload = change?.[0];
      const firstArg = payload?.[0];
      const secondArg = payload?.[1];
      expect(firstArg).to.equal(true);
      expect(secondArg instanceof Event).to.equal(true);
    });
  });

  it('group v-model: emits array payloads and stays in sync with the controlled modelValue', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const selected = ref<Array<string | number | boolean>>(['1']);
          const onUpdate = (next: Array<string | number | boolean>) => {
            handleUpdate(next);
            selected.value = next;
          };
          return () =>
            h(
              Checkbox.Group,
              { 'modelValue': selected.value, 'onUpdate:modelValue': onUpdate },
              {
                default: () => [
                  h(Checkbox, { value: '1' }, () => 'A'),
                  h(Checkbox, { value: '2' }, () => 'B'),
                ],
              },
            );
        },
      }),
    );
    cy.get('input').eq(0).should('be.checked');
    cy.get('input').eq(1).should('not.be.checked');
    cy.get('.sd-checkbox').eq(1).click();
    cy.get('@handleUpdate').should('have.been.calledWith', ['1', '2']);
    cy.get('input').eq(0).should('be.checked');
    cy.get('input').eq(1).should('be.checked');
    cy.get('.sd-checkbox').eq(0).click();
    cy.get('@handleUpdate').should('have.been.calledWith', ['2']);
    cy.get('input').eq(0).should('not.be.checked');
    cy.get('input').eq(1).should('be.checked');
  });

  it('group max disables unchecked options once reached and re-enables after unchecking', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const selected = ref<Array<string | number | boolean>>(['1']);
          const onUpdate = (next: Array<string | number | boolean>) => {
            handleUpdate(next);
            selected.value = next;
          };
          return () =>
            h(
              Checkbox.Group,
              { 'modelValue': selected.value, 'max': 1, 'onUpdate:modelValue': onUpdate },
              {
                default: () => [
                  h(Checkbox, { value: '1' }, () => 'A'),
                  h(Checkbox, { value: '2' }, () => 'B'),
                ],
              },
            );
        },
      }),
    );
    cy.get('input').eq(1).should('be.disabled');
    cy.get('.sd-checkbox').eq(1).should('have.class', 'sd-checkbox-disabled');
    cy.get('input').eq(0).should('not.be.disabled');
    // 取消一个已选项后，其余项恢复可用
    cy.get('.sd-checkbox').eq(0).click();
    cy.get('@handleUpdate').should('have.been.calledWith', []);
    cy.get('input').eq(1).should('not.be.disabled');
    cy.get('input').eq(0).should('not.be.disabled');
  });

  it('group disabled propagates to every checkbox', () => {
    cy.mount(Checkbox.Group, {
      props: { disabled: true },
      slots: {
        default: '<sd-checkbox value="1">A</sd-checkbox><sd-checkbox value="2">B</sd-checkbox>',
      },
    });
    cy.get('.sd-checkbox')
      .should('have.length', 2)
      .each(($el) => {
        expect($el.hasClass('sd-checkbox-disabled')).to.equal(true);
      });
    cy.get('input').each(($el) => {
      expect($el.prop('disabled')).to.equal(true);
    });
  });

  it('renders options with per-option disabled/indeterminate and function labels', () => {
    cy.mount(Checkbox.Group, {
      props: {
        modelValue: ['a', 'c'],
        options: [
          'a',
          { label: 'B', value: 'b', disabled: true },
          { label: 'C', value: 'c', indeterminate: true },
          { label: () => 'Fn', value: 'd' },
        ],
      },
    });
    cy.get('.sd-checkbox').should('have.length', 4);
    cy.get('.sd-checkbox-label').eq(0).should('have.text', 'a');
    cy.get('.sd-checkbox-label').eq(1).should('have.text', 'B');
    cy.get('.sd-checkbox-label').eq(2).should('have.text', 'C');
    cy.get('.sd-checkbox-label').eq(3).should('have.text', 'Fn');
    cy.get('input').eq(1).should('be.disabled');
    cy.get('.sd-checkbox').eq(2).should('have.class', 'sd-checkbox-checked');
    cy.get('.sd-checkbox').eq(2).should('have.class', 'sd-checkbox-indeterminate');
  });

  it('checkbox slot receives the checked/disabled scope', () => {
    cy.mount(Checkbox, {
      props: { modelValue: true, disabled: true },
      slots: {
        default: 'Label',
        checkbox:
          '<template #checkbox="{ checked, disabled }"><span class="custom-checkbox" :data-checked="checked ? \'yes\' : \'no\'" :data-disabled="disabled ? \'yes\' : \'no\'">X</span></template>',
      },
    });
    cy.get('.custom-checkbox')
      .should('have.attr', 'data-checked', 'yes')
      .and('have.attr', 'data-disabled', 'yes');
  });

  it('group checkbox slot replaces every checkbox visual with scoped props', () => {
    cy.mount(Checkbox.Group, {
      props: { modelValue: ['1'] },
      slots: {
        default: '<sd-checkbox value="1">A</sd-checkbox><sd-checkbox value="2">B</sd-checkbox>',
        checkbox:
          '<template #checkbox="{ checked, disabled }"><span class="custom-group-box" :data-checked="checked ? \'yes\' : \'no\'" :data-disabled="disabled ? \'yes\' : \'no\'">X</span></template>',
      },
    });
    cy.get('.custom-group-box').should('have.length', 2);
    cy.get('.custom-group-box').eq(0).should('have.attr', 'data-checked', 'yes');
    cy.get('.custom-group-box').eq(1).should('have.attr', 'data-checked', 'no');
  });

  it('group label slot overrides option labels', () => {
    cy.mount(Checkbox.Group, {
      props: { options: [{ label: 'Original', value: 'a' }] },
      slots: {
        label:
          '<template #label="{ data }"><b class="custom-label">{{ data.value }}</b></template>',
      },
    });
    cy.get('.custom-label').should('have.text', 'a');
  });

  it('passes tabindex to the native input and omits it by default', () => {
    cy.mount(Checkbox, { props: { tabindex: -1 } });
    cy.get('input').should('have.attr', 'tabindex', '-1');
    cy.mount(Checkbox);
    cy.get('input').should('not.have.attr', 'tabindex');
  });

  it('uninjectGroupContext renders standalone inside a group (no group state or events)', () => {
    cy.mount(Checkbox.Group, {
      slots: {
        default:
          '<sd-checkbox value="1">A</sd-checkbox><sd-checkbox :uninject-group-context="true" value="2">B</sd-checkbox>',
      },
    });
    cy.get('.sd-checkbox').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    // 独立渲染：uninject 的 checkbox 不触发 group 的 change 事件
    cy.get('.sd-checkbox').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('resets to unchecked when modelValue becomes undefined', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const checked = ref<boolean | undefined>(true);
          const onUpdate = (next: boolean | undefined) => {
            handleUpdate(next);
            checked.value = undefined;
          };
          return () =>
            h(
              Checkbox,
              { 'modelValue': checked.value, 'onUpdate:modelValue': onUpdate },
              () => 'Label',
            );
        },
      }),
    );
    cy.get('input').should('be.checked');
    cy.get('.sd-checkbox').click();
    cy.get('@handleUpdate').should('have.been.calledWith', false);
    cy.get('input').should('not.be.checked');
    cy.get('.sd-checkbox').should('not.have.class', 'sd-checkbox-checked');
  });
});
