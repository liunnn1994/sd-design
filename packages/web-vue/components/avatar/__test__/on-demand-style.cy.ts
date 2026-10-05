import { h } from 'vue';

import { mount } from 'cypress/vue';

import Avatar from '../index';
import '../style';

describe('AvatarGroup on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the overflow popover with only the avatar style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Avatar.Group, {
      props: { maxCount: 1, maxPopoverTriggerProps: { trigger: 'click' } },
      slots: { default: () => [h(Avatar, {}, () => 'A'), h(Avatar, {}, () => 'B')] },
    });
    cy.get('.sd-avatar-group-max-count-avatar').click();
    cy.get('.sd-popover-popup-content').should('have.css', 'box-sizing', 'border-box');
    cy.get('.sd-popover-popup-content').should('have.css', 'padding-top', '12px');
  });
});
