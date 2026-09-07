import { defineComponent, h, ref } from 'vue';

import Switch from '../index';

describe('Switch', () => {
  it('emits change on click', () => {
    cy.mount(Switch);
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      const changeEvent = wrapper.emitted('change') as Array<[boolean]> | undefined;
      expect(changeEvent?.[0]?.[0]).to.equal(true);
    });
  });

  it('exposes role=switch and toggles aria-checked on click', () => {
    cy.mount(Switch);
    cy.get('button').should('have.attr', 'role', 'switch');
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'false');
  });

  it('auto enters loading until the controlled modelValue updates', () => {
    cy.clock();
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const value = ref<boolean | string | number>(false);
          const onUpdate = (nextValue: boolean | string | number) => {
            handleUpdate(nextValue);
            setTimeout(() => {
              value.value = nextValue;
            }, 1000);
          };
          return () =>
            h(Switch, {
              'modelValue': value.value,
              'autoLoading': true,
              'onUpdate:modelValue': onUpdate,
            });
        },
      }),
    );
    cy.get('button').click();
    cy.get('@handleUpdate').should('have.been.calledOnce');
    cy.get('button')
      .should('have.class', 'sd-switch-loading')
      .and('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('@handleUpdate').should('have.been.calledOnce');
    cy.tick(1000);
    cy.get('button')
      .should('not.have.class', 'sd-switch-loading')
      .and('have.attr', 'aria-checked', 'true');
  });

  it('supports uncontrolled state via defaultChecked', () => {
    cy.mount(Switch, { props: { defaultChecked: true } });
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted<[boolean]>('change');
      expect(change).to.not.equal(undefined);
      expect(change![0][0]).to.equal(false);
    });
  });

  it('supports controlled usage through v-model', () => {
    cy.mount(
      defineComponent({
        setup() {
          const value = ref<boolean | string | number>(false);
          return () =>
            h(Switch, {
              'modelValue': value.value,
              'onUpdate:modelValue': (next: boolean | string | number) => {
                value.value = next;
              },
            });
        },
      }),
    );
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'false');
  });

  it('emits checkedValue/uncheckedValue instead of plain booleans', () => {
    cy.mount(Switch, { props: { checkedValue: 'yes', uncheckedValue: 'no' } });
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted<[string]>('change');
      expect(change).to.not.equal(undefined);
      expect(change![0][0]).to.equal('yes');
    });
  });

  it('ignores clicks when disabled', () => {
    cy.mount(Switch, { props: { disabled: true, defaultChecked: true } });
    cy.get('button').should('be.disabled');
    cy.get('button').should('have.class', 'sd-switch-disabled');
    cy.get('button').click({ force: true });
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('shows a loading state with the spinner icon and ignores clicks while loading', () => {
    cy.mount(Switch, { props: { loading: true, defaultChecked: true } });
    cy.get('button').should('have.class', 'sd-switch-loading');
    cy.get('button').should('have.attr', 'aria-busy', 'true');
    cy.get('.sd-switch-handle-icon svg.sd-icon-loading').should('exist');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('blocks the change when beforeChange returns false', () => {
    cy.mount(Switch, { props: { beforeChange: () => false } });
    cy.get('button').click();
    cy.get('button').should('not.have.class', 'sd-switch-loading');
    cy.get('button').should('have.attr', 'aria-checked', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('keeps loading during an async beforeChange and changes after it resolves', () => {
    let resolveBeforeChange: (value: boolean) => void = () => undefined;
    const beforeChange = () =>
      new Promise<boolean>((resolve) => {
        resolveBeforeChange = resolve;
      });
    cy.mount(Switch, { props: { beforeChange } });
    cy.get('button').click();
    // 异步 beforeChange 期间展示 loading 且不切换
    cy.get('button').should('have.class', 'sd-switch-loading');
    cy.get('button').should('have.attr', 'aria-busy', 'true');
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.wrap(null).then(() => resolveBeforeChange(true));
    cy.get('button').should('not.have.class', 'sd-switch-loading');
    cy.get('button').should('have.attr', 'aria-checked', 'true');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted<[boolean]>('change');
      expect(change).to.not.equal(undefined);
      expect(change![0][0]).to.equal(true);
    });
  });

  it('emits focus and blur events', () => {
    cy.mount(Switch);
    cy.get('button').focus();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.not.equal(undefined);
    });
    cy.get('button').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('blur')).to.not.equal(undefined);
    });
  });

  it('renders checkedText/uncheckedText and switches text with the state', () => {
    cy.mount(Switch, { props: { checkedText: 'ON', uncheckedText: 'OFF' } });
    cy.get('.sd-switch-text').should('have.text', 'OFF');
    cy.get('button').click();
    cy.get('.sd-switch-text').should('have.text', 'ON');
  });

  it('prefers checked/unchecked slots over the text props', () => {
    cy.mount(Switch, {
      props: { checkedText: 'ON', uncheckedText: 'OFF' },
      slots: {
        checked: '<span class="custom-checked">开</span>',
        unchecked: '<span class="custom-unchecked">关</span>',
      },
    });
    cy.get('.sd-switch-text .custom-unchecked').should('exist');
    cy.get('button').click();
    cy.get('.sd-switch-text .custom-checked').should('exist');
  });

  it('applies checkedColor as background color and uses custom color class for line type', () => {
    cy.mount(Switch, { props: { modelValue: true, checkedColor: 'rgb(0, 128, 0)' } });
    cy.get('button').should('have.css', 'background-color', 'rgb(0, 128, 0)');

    cy.mount(Switch, {
      props: { modelValue: true, type: 'line', checkedColor: 'rgb(255, 0, 0)' },
    });
    cy.get('button').should('have.class', 'sd-switch-custom-color');
  });
});
