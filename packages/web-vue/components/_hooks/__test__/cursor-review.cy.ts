import Input from '../../input';
import Textarea from '../../textarea';

for (const [name, component, selector] of [
  ['Input', Input, 'input'],
  ['Textarea', Textarea, 'textarea'],
] as const) {
  it(`${name} keeps the cursor before the following text after rejecting a deletion at the start`, () => {
    cy.mount(component, { props: { modelValue: 'abc' } });
    cy.get(selector).type('{home}{del}').should('have.value', 'abc');
    cy.get(selector).should(($element) =>
      expect(($element[0] as HTMLInputElement).selectionStart).to.equal(1),
    );
  });
}
