import { defineComponent } from 'vue';

import { mount } from 'cypress/vue';

import ModelSelector, {
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorSeparator,
  ModelSelectorTrigger,
} from '../index';
import '../style';

const Selector = defineComponent({
  components: {
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorInput,
    ModelSelectorList,
    ModelSelectorSeparator,
    ModelSelectorTrigger,
  },
  template: `
    <ModelSelector default-visible>
      <ModelSelectorTrigger>选择模型</ModelSelectorTrigger>
      <ModelSelectorContent :render-to-body="false">
        <ModelSelectorInput />
        <ModelSelectorList>
          <ModelSelectorEmpty />
          <ModelSelectorSeparator />
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  `,
});

describe('ModelSelector on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  beforeEach(() => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Selector);
  });

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles the modal', () => {
    cy.get('.sd-modal').should('have.css', 'position', 'relative');
  });

  it('styles the input', () => {
    cy.get('.sd-model-selector-input').should(($input) => {
      expect(parseFloat($input.css('height'))).to.be.closeTo(32, 0.1);
    });
  });

  it('styles the scrollbar', () => {
    cy.get('.sd-model-selector-list').should('have.css', 'position', 'relative');
  });

  it('styles the empty state image', () => {
    cy.get('.sd-empty-image').should('have.css', 'font-size', '48px');
  });

  it('styles the separator', () => {
    cy.get('.sd-model-selector-separator').should('have.css', 'position', 'relative');
  });

  it('styles the trigger button', () => {
    cy.get('.sd-model-selector-trigger').should(($button) => {
      expect(parseFloat($button.css('height'))).to.be.closeTo(32, 0.1);
    });
  });
});
