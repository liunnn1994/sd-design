import { configProviderInjectionKey } from '../../config-provider/context';
import Button from '../index';

describe('Button', () => {
  it('should emit click event', () => {
    cy.mount(Button);
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('should not emit click event when disabled', () => {
    cy.mount(Button, { props: { disabled: true } });
    cy.get('button').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('should add loading fixed width class when loadingFixedWidth is true', () => {
    cy.mount(Button, { props: { loading: true, loadingFixedWidth: true } });
    cy.get('button').should('have.class', 'sd-btn-loading-fixed-width');
  });

  it('should add two chinese chars class when autoInsertSpaceInButton is enabled', () => {
    cy.mount(Button, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            autoInsertSpaceInButton: true,
          },
        },
      },
      slots: {
        default: '测试',
      },
    });
    cy.get('button').should('have.class', 'sd-btn-two-chinese-chars');
  });

  it('should render tooltip from a string prop on hover', () => {
    cy.mount(Button, { props: { tooltip: '提示内容' } });
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('contain', '提示内容');
  });

  it('should inherit Tooltip props via object tooltip', () => {
    cy.mount(Button, {
      props: {
        tooltip: {
          content: '对象内容',
          mini: true,
          defaultPopupVisible: true,
          renderToBody: false,
        },
      },
    });
    cy.get('.sd-tooltip-content').should('contain', '对象内容');
    cy.get('.sd-tooltip-content').should('have.class', 'sd-tooltip-mini');
  });

  it('should render tooltip from the tooltip slot', () => {
    cy.mount(Button, {
      props: { tooltip: { defaultPopupVisible: true, renderToBody: false } },
      slots: { tooltip: '自定义提示' },
    });
    cy.get('.sd-tooltip-content').should('contain', '自定义提示');
  });

  it('should not render a tooltip when none is provided', () => {
    cy.mount(Button);
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-tooltip').should('not.exist');
  });
});
