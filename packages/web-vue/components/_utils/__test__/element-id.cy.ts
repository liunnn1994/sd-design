import { getElement } from '../dom';

describe('getElement literal IDs', () => {
  for (const id of ["section'one", 'section\\one', 'section:one', 'section"one']) {
    it(`resolves the literal ID ${JSON.stringify(id)} inside its container`, () => {
      const container = document.createElement('div');
      const element = document.createElement('div');
      element.id = id;
      container.appendChild(element);
      document.body.appendChild(container);
      try {
        expect(getElement(`#${id}`, container)).to.equal(element);
        expect(getElement(`#${id}`)).to.equal(element);
      } finally {
        container.remove();
      }
    });
  }
});
