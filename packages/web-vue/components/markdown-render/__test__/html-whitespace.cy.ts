import Html from '../nodes/html.vue';

describe('Markdown HTML whitespace', () => {
  for (const whitespace of [' ', '\n\t']) {
    it(`preserves ${JSON.stringify(whitespace)} between adjacent inline elements`, () => {
      cy.mount(Html, {
        props: {
          node: {
            type: 'html_block',
            content: `<p><a href="#one">one</a>${whitespace}<a href="#two">two</a></p>`,
          },
        },
      });
      cy.get('.sd-typography').should('have.text', `one${whitespace}two`);
    });
  }
});
