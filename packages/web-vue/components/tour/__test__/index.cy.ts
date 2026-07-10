import { h } from 'vue';

import type { TourStep } from '../types';

import Tour from '../index';

const steps: TourStep[] = [
  { element: '#tour-step-a', popover: { title: '步骤一', description: '内容一' } },
  { element: '#tour-step-b', popover: { title: '步骤二', description: '内容二' } },
];

const defaultSlots = {
  default: '<div><button id="tour-step-a">A</button><button id="tour-step-b">B</button></div>',
};

const zIndex = (selector: string, value: string) =>
  cy.get(selector).should(($el) => {
    expect(($el[0] as HTMLElement).style.zIndex).to.equal(value);
  });

describe('Tour', () => {
  afterEach(() => {
    // Tour portals its overlay/popover to document.body; remove only those,
    // never the whole body (that would wipe Cypress's [data-cy-root] mount point).
    document.body
      .querySelectorAll('.sd-tour-popover, .sd-tour-overlay, .sd-tour-mask')
      .forEach((el) => el.remove());
  });

  it('uses localized button text and keeps default actions', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '下一步').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    cy.get('.sd-tour-popover-prev-btn').should('contain.text', '上一步');
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '完成');
    cy.get('.sd-tour-popover-prev-btn').click();
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤一');
    cy.get('.sd-tour-popover-close-btn').click();
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('starts from the default state', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, defaultCurrent: 1, steps },
      slots: defaultSlots,
    });
    cy.get('.sd-tour-popover').should('exist');
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
    zIndex('.sd-tour-overlay', '1000');
    zIndex('.sd-tour-popover', '1001');
  });

  it('reacts to controlled current changes', () => {
    cy.mount(Tour, { props: { visible: true, current: 0, steps }, slots: defaultSlots });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ current: 1 })));
    cy.get('.sd-tour-popover-title').should('contain.text', '步骤二');
  });

  it('preserves user hooks via the controller', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps, zIndex: 3200, showProgress: true, allowClose: false },
      slots: defaultSlots,
    });
    cy.get('@vue').should(({ wrapper }) => {
      const controller = (
        wrapper.vm as unknown as {
          getController: () => {
            getConfig: () => { showProgress?: boolean; allowClose?: boolean };
          };
        }
      ).getController();
      expect(controller?.getConfig().showProgress).to.equal(true);
      expect(controller?.getConfig().allowClose).to.equal(false);
    });
    zIndex('.sd-tour-popover', '3201');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ zIndex: 4200 })));
    zIndex('.sd-tour-popover', '4201');
  });

  it('renders custom title/description slots with button props', () => {
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        steps,
        buttonProps: {
          previous: { type: 'outline' },
          next: { status: 'danger' },
          close: { type: 'text' },
        },
      },
      slots: {
        ...defaultSlots,
        title: ({ current, title }: any) =>
          h('div', { class: 'tour-title-slot' }, `${title}-${(current ?? 0) + 1}`),
        description: ({ current, description }: any) =>
          h('div', { class: 'tour-description-slot' }, [
            h('span', `${description}-${(current ?? 0) + 1}`),
            h('table', { class: 'tour-description-table' }, [
              h('tbody', [
                h('tr', [h('td', 'A'), h('td', 'B')]),
                h('tr', [h('td', 'C'), h('td', 'D')]),
              ]),
            ]),
          ]),
      },
    });
    cy.get('.tour-title-slot').should('contain.text', '步骤一-1');
    cy.get('.tour-description-slot').should('contain.text', '内容一-1');
    cy.get('.tour-description-table').should('exist');
    cy.get('.sd-tour-popover-next-btn').should('have.class', 'sd-btn-status-danger');
    cy.get('.sd-tour-popover-prev-btn').should('have.class', 'sd-btn-outline');
    cy.get('.sd-tour-popover-close-btn').should('have.class', 'sd-btn-text');
  });

  it('renders the overlay with an explicit hollow fill rule', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps }, slots: defaultSlots });
    cy.get('.sd-tour-overlay')
      .should('have.attr', 'fill-rule', 'evenodd')
      .and('have.attr', 'clip-rule', 'evenodd');
    cy.get('.sd-tour-overlay path')
      .should('have.attr', 'fill-rule', 'evenodd')
      .and('have.attr', 'd')
      .and('include', 'Z M');
  });
});
