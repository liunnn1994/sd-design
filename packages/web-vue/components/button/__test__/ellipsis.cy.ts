import { h, ref } from 'vue';

import { PerformantEllipsis } from '../../ellipsis';
import IconPlus from '../../icon/icon-plus';
import Button from '../index';

const text = '这是一段很长的按钮文字，需要在宽度不足时省略并显示完整提示';

describe('Button ellipsis', () => {
  for (const href of [undefined, '#']) {
    it(`shows and dismisses the ${href ? 'anchor' : 'native'} ellipsis tooltip on outer focus and blur`, () => {
      const onFocusin = cy.spy().as('focusin');
      const onFocusout = cy.spy().as('focusout');
      cy.mount(() => [
        h('button', { class: 'before' }, 'Before'),
        h(Button, { href, style: 'width: 160px', onFocusin, onFocusout }, () => text),
      ]);
      cy.get('.before').focus();
      cy.then(async () => {
        for (const type of ['keyDown', 'keyUp']) {
          await Cypress.automation('remote:debugger:protocol', {
            command: 'Input.dispatchKeyEvent',
            params: {
              type,
              key: 'Tab',
              code: 'Tab',
              windowsVirtualKeyCode: 9,
              nativeVirtualKeyCode: 9,
            },
          });
        }
      });
      cy.get('.sd-btn').should('be.focused');
      cy.get('[role="tooltip"]').should('be.visible').and('contain', text);
      cy.get('@focusin').should('have.been.calledOnce');
      cy.get('.sd-btn').should('be.focused').blur();
      cy.get('[role="tooltip"]').should('not.be.visible');
      cy.get('@focusout').should('have.been.calledOnce');
      cy.get('.sd-btn').focus();
      cy.get('[role="tooltip"]').should('be.visible');
      cy.get('.sd-btn').should('be.focused');
    });

    for (const useSlot of [false, true]) {
      it(`prefers the whole-button tooltip from ${useSlot ? 'slot' : 'prop'} for ${href ? 'anchors' : 'buttons'}`, () => {
        cy.mount(Button, {
          props: { href, tooltip: useSlot ? undefined : '整按钮提示' },
          attrs: { style: 'width: 160px' },
          slots: { default: text, ...(useSlot ? { tooltip: '整按钮提示' } : {}) },
        });
        cy.get('.sd-btn').trigger('mouseenter');
        cy.get('.sd-btn-content').trigger('mouseenter');
        cy.get('[data-ellipsis-measure]').should('exist');
        cy.get('[role="tooltip"]').should('be.visible').and('contain', '整按钮提示');
        cy.get('@vue').should(({ wrapper }) => {
          expect(wrapper.findComponent(PerformantEllipsis).props('tooltip')).to.equal(false);
        });
        cy.get('[role="tooltip"]').should('have.length', 1);
        cy.get('.sd-btn-content').should('have.attr', 'title', '');
      });
    }

    it(`truncates ${href ? 'anchor' : 'native'} button content and shows a tooltip on first hover`, () => {
      cy.mount(Button, {
        props: { href },
        attrs: { style: 'width: 160px' },
        slots: { default: text, icon: IconPlus },
      });
      cy.get('.sd-btn-content').should(($content) => {
        expect($content[0].scrollWidth).to.be.greaterThan($content[0].clientWidth);
        expect($content[0].getBoundingClientRect().right).to.be.lessThan(
          $content.closest('.sd-btn')[0].getBoundingClientRect().right,
        );
      });
      cy.get('.sd-btn-icon').should('have.css', 'flex-shrink', '0');
      cy.get('.sd-btn-content').trigger('mouseenter');
      cy.get('[role="tooltip"]').should('be.visible').and('contain', text);
    });
  }

  it('forwards the same ellipsis options as Link', () => {
    cy.mount(Button, {
      props: { ellipsisLineClamp: '2', ellipsisExpandTrigger: 'click', ellipsisTooltip: false },
      slots: { default: text },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const ellipsis = wrapper.findComponent(PerformantEllipsis);
      expect(ellipsis.props('lineClamp')).to.equal('2');
      expect(ellipsis.props('expandTrigger')).to.equal('click');
      expect(ellipsis.props('tooltip')).to.equal(false);
    });
  });

  it('does not reopen a tooltip when focus leaves during lazy activation', () => {
    cy.mount(Button, { attrs: { style: 'width: 160px' }, slots: { default: text } });
    cy.get('.sd-btn').then(($button) => {
      $button[0].focus();
      $button[0].blur();
    });
    cy.get('[data-ellipsis-measure]').should('exist');
    cy.wait(250);
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('supports toggling ellipsis and adding default content dynamically', () => {
    const enabled = ref(true);
    const content = ref(false);
    cy.mount(() =>
      h(Button, { ellipsis: enabled.value }, content.value ? { default: () => text } : {}),
    );
    cy.get('.sd-btn-content').should('not.exist');
    cy.then(() => {
      content.value = true;
    });
    cy.get('.sd-btn-content').should('have.text', text);
    cy.then(() => {
      enabled.value = false;
    });
    cy.get('.sd-btn-content').should('not.exist');
    cy.get('.sd-btn').should('have.text', text);
    cy.then(() => {
      enabled.value = true;
    });
    cy.get('.sd-btn-content').should('exist');
  });

  it('expands multiline content on a native first click and keeps tooltip disabled', () => {
    cy.mount(Button, {
      props: { ellipsisLineClamp: 2, ellipsisExpandTrigger: 'click', ellipsisTooltip: false },
      attrs: { style: 'width: 160px; height: auto' },
      slots: { default: text },
    });
    cy.get('.sd-btn-content').should('have.css', '-webkit-line-clamp', '2');
    cy.get('.sd-btn-content').then(($content) => $content[0].click());
    cy.get('.sd-btn-content').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-btn-content').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('supports a custom ellipsis tooltip without creating a whole-button tooltip', () => {
    cy.mount(Button, {
      attrs: { style: 'width: 160px' },
      props: { ellipsisTooltip: { position: 'bottom', mini: true } },
      slots: { 'default': text, 'ellipsis-tooltip': '自定义省略提示' },
    });
    cy.get('.sd-btn-content').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible').and('contain', '自定义省略提示');
    cy.get('.sd-tooltip-content').should('have.class', 'sd-tooltip-mini');
  });

  it('does not show a tooltip for text that fits', () => {
    cy.mount(Button, { slots: { default: '确认' } });
    cy.get('.sd-btn-content').trigger('mouseenter');
    cy.get('[data-ellipsis-measure]').should('exist');
    cy.wait(200);
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('keeps the loading icon and suppresses clicks on truncated content', () => {
    cy.mount(Button, {
      props: { loading: true },
      attrs: { style: 'width: 160px' },
      slots: { default: text },
    });
    cy.get('.sd-icon-loading').should('be.visible');
    cy.get('.sd-btn-content').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });
});
