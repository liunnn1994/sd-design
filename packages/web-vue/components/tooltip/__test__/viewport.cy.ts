import { defineComponent, h, ref } from 'vue';

import Tooltip from '../index';

const longContent = 'This is tooltip content. '.repeat(500);

function expectInsideViewport($popup: JQuery<HTMLElement>) {
  const rect = $popup[0].getBoundingClientRect();
  const win = $popup[0].ownerDocument.defaultView!;
  expect(rect.width).to.be.greaterThan(0);
  expect(rect.height).to.be.greaterThan(0);
  expect(rect.left).to.be.at.least(7);
  expect(rect.top).to.be.at.least(7);
  expect(rect.right).to.be.at.most(win.innerWidth - 7);
  expect(rect.bottom).to.be.at.most(win.innerHeight - 7);
}

describe('Tooltip viewport boundaries', () => {
  it('fits a clipped popup container and stays open while scrolling', () => {
    cy.viewport(480, 320);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'div',
            {
              id: 'tooltip-boundary',
              style: 'position:relative;overflow:hidden;width:260px;height:200px;margin:20px',
            },
            [
              h(
                Tooltip,
                {
                  content: longContent,
                  popupContainer: '#tooltip-boundary',
                  mouseEnterDelay: 0,
                },
                { default: () => h('button', 'Help') },
              ),
            ],
          ),
      }),
    );
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should(($content) => {
      const contentRect = $content[0].getBoundingClientRect();
      const boundary = $content[0].ownerDocument
        .querySelector('#tooltip-boundary')!
        .getBoundingClientRect();
      expect(contentRect.left).to.be.at.least(boundary.left + 7);
      expect(contentRect.right).to.be.at.most(boundary.right - 7);
      expect(contentRect.top).to.be.at.least(boundary.top + 7);
      expect(contentRect.bottom).to.be.at.most(boundary.bottom - 7);
    });
    cy.get('.sd-tooltip').should('have.css', 'pointer-events', 'auto');
    cy.get('button').trigger('mouseleave');
    cy.get('.sd-tooltip').trigger('mouseenter');
    cy.get('.sd-tooltip-scrollbar [data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.wait(150);
    cy.get('.sd-tooltip-content').should('be.visible');
    cy.get('.sd-tooltip').trigger('mouseleave');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Tooltip).emitted('popupVisibleChange')?.at(-1)).to.deep.equal([
        false,
      ]);
    });
  });

  for (const position of ['top', 'bottom', 'left', 'right'] as const) {
    it(`keeps long ${position} content inside the viewport and scrolls internally`, () => {
      cy.viewport(480, 320);
      cy.mount(Tooltip, {
        props: { content: longContent, defaultPopupVisible: true, position },
        slots: { default: '<button style="position:fixed;top:140px;left:210px">Help</button>' },
      });
      cy.get('.sd-tooltip-content').should(expectInsideViewport);
      cy.get('.sd-tooltip').should('have.css', 'pointer-events', 'auto');
      cy.get('.sd-tooltip-scrollbar [data-overlayscrollbars-viewport]')
        .should(($viewport) => {
          expect($viewport[0].scrollHeight).to.be.greaterThan($viewport[0].clientHeight);
        })
        .scrollTo('bottom')
        .should(($viewport) => expect($viewport[0].scrollTop).to.be.greaterThan(0));
      cy.viewport(280, 240);
      cy.get('.sd-tooltip-content').should(expectInsideViewport);
      cy.get('.sd-tooltip-popup-arrow').should('have.css', 'border-radius', '0px');
    });
  }

  it('updates scrollability when slot content grows and shrinks', () => {
    const content = ref('Short help');
    cy.viewport(320, 240);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Tooltip,
            { defaultPopupVisible: true },
            {
              default: () => h('button', { style: 'position:fixed;top:20px;left:20px' }, 'Help'),
              content: () => content.value,
            },
          ),
      }),
    );
    cy.get('.sd-tooltip').should('have.css', 'pointer-events', 'none');
    cy.then(() => {
      content.value = longContent;
    });
    cy.get('.sd-tooltip-content').should(expectInsideViewport);
    cy.get('.sd-tooltip').should('have.css', 'pointer-events', 'auto');
    cy.then(() => {
      content.value = 'Short again';
    });
    cy.get('.sd-tooltip').should('have.css', 'pointer-events', 'none');
  });
});
