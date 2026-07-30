import { defineComponent, shallowRef } from 'vue';

import ModelSelector, {
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorSeparator,
  ModelSelectorTrigger,
} from '../index';

const TestSelector = defineComponent({
  components: {
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorSeparator,
    ModelSelectorTrigger,
  },
  emits: ['select'],
  props: {
    closeOnSelect: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const visible = shallowRef(false);
    return { visible };
  },
  template: `
    <ModelSelector
      v-model:visible="visible"
      :close-on-select="closeOnSelect"
      @select="(value, event) => $emit('select', value, event)"
    >
      <ModelSelectorTrigger>选择模型</ModelSelectorTrigger>
      <ModelSelectorContent :render-to-body="false">
        <ModelSelectorInput placeholder="搜索模型" />
        <ModelSelectorList>
          <ModelSelectorEmpty>没有匹配模型</ModelSelectorEmpty>
          <ModelSelectorSeparator />
          <ModelSelectorGroup heading="常用模型">
            <ModelSelectorItem
              value="gpt-4o"
              label="GPT-4o"
              :keywords="['OpenAI']"
              shortcut="Alt+Shift+1"
            >
              GPT-4o
            </ModelSelectorItem>
            <ModelSelectorItem value="claude-4" label="Claude 4" shortcut="Alt+Shift+2">
              Claude 4
            </ModelSelectorItem>
            <ModelSelectorItem value="disabled" disabled>
              已停用模型
            </ModelSelectorItem>
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  `,
});

function pressAltShiftDigit(digit: '1' | '2', shiftedKey: '!' | '@') {
  cy.window().then((window) => {
    window.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        altKey: true,
        bubbles: true,
        code: 'AltLeft',
        key: 'Alt',
      }),
    );
    window.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        altKey: true,
        bubbles: true,
        code: 'ShiftLeft',
        key: 'Shift',
        shiftKey: true,
      }),
    );
    window.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        altKey: true,
        bubbles: true,
        code: `Digit${digit}`,
        key: shiftedKey,
        shiftKey: true,
      }),
    );
    window.dispatchEvent(
      new window.KeyboardEvent('keyup', {
        altKey: true,
        bubbles: true,
        code: `Digit${digit}`,
        key: shiftedKey,
        shiftKey: true,
      }),
    );
    window.dispatchEvent(
      new window.KeyboardEvent('keyup', {
        altKey: true,
        bubbles: true,
        code: 'ShiftLeft',
        key: 'Shift',
      }),
    );
    window.dispatchEvent(
      new window.KeyboardEvent('keyup', {
        bubbles: true,
        code: 'AltLeft',
        key: 'Alt',
      }),
    );
  });
}

describe('ModelSelector', () => {
  it('supports default visibility without a controlled model', () => {
    cy.mount(
      defineComponent({
        components: { ModelSelector, ModelSelectorContent },
        template: `
          <ModelSelector default-visible>
            <ModelSelectorContent :render-to-body="false">默认打开</ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    cy.contains('.sd-model-selector', '默认打开').should('be.visible');
  });

  it('opens from the trigger and exposes an accessible dialog', () => {
    cy.mount(TestSelector);

    cy.contains('button', '选择模型')
      .should('have.class', 'sd-btn')
      .and('have.attr', 'aria-expanded', 'false')
      .click();
    cy.get('.sd-modal[role="dialog"]').should('be.visible').and('have.attr', 'aria-modal', 'true');
    cy.contains('.sd-modal-title', '模型选择').should('exist');
    cy.contains('button', '选择模型').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-model-selector-input').should('have.class', 'sd-input-wrapper');
    cy.get('.sd-model-selector').then(($selector) => {
      const selectorRect = $selector[0].getBoundingClientRect();

      cy.get('.sd-model-selector-input').should(($input) => {
        const inputRect = $input[0].getBoundingClientRect();

        expect(inputRect.left - selectorRect.left).to.be.closeTo(12, 1);
        expect(selectorRect.right - inputRect.right).to.be.closeTo(12, 1);
      });
    });
    cy.get('.sd-model-selector-list')
      .should('have.class', 'sd-scrollbar')
      .and('have.css', 'max-height', '400px');
    cy.get('.sd-model-selector-separator').should('have.class', 'sd-divider');
  });

  it('filters items, searches keywords and renders the empty state', () => {
    cy.mount(TestSelector);
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('OpenAI');
    cy.contains('.sd-model-selector-item', 'GPT-4o').should('be.visible');
    cy.contains('.sd-model-selector-item', 'Claude 4').should('not.be.visible');

    cy.get('input[placeholder="搜索模型"]').clear().type('不存在');
    cy.contains('.sd-empty', '没有匹配模型').should('be.visible');
    cy.contains('.sd-model-selector-group', '常用模型').should('not.be.visible');
  });

  it('uses the viewport height while keeping the list maximum height', () => {
    cy.viewport(800, 700);
    cy.mount(TestSelector);
    cy.contains('button', '选择模型').click();

    cy.get('.sd-model-selector-list')
      .should('have.css', 'height', '400px')
      .and('have.css', 'max-height', '400px');

    cy.viewport(800, 500);
    cy.get('.sd-model-selector-list').should('have.css', 'height', '340px');
  });

  it('supports keyboard navigation, emits selection and closes', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(TestSelector, { props: { onSelect } });
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('{downarrow}{enter}');
    cy.get('@onSelect').should('have.been.calledOnce');
    cy.get('@onSelect').its('firstCall.args.0').should('equal', 'gpt-4o');
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('selects only the item matching each custom digit shortcut', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(TestSelector, { props: { closeOnSelect: false, onSelect } });
    cy.contains('button', '选择模型').click();

    cy.contains('.sd-model-selector-item', 'GPT-4o').should(
      'have.attr',
      'aria-keyshortcuts',
      'Alt+Shift+1',
    );
    pressAltShiftDigit('1', '!');

    cy.get('@onSelect').should('have.been.calledOnce');
    cy.get('@onSelect').its('firstCall.args.0').should('equal', 'gpt-4o');
    cy.get('@onSelect').its('firstCall.args.1').should('be.instanceOf', KeyboardEvent);

    pressAltShiftDigit('2', '@');

    cy.get('@onSelect').should('have.been.calledTwice');
    cy.get('@onSelect').its('secondCall.args.0').should('equal', 'claude-4');
    cy.get('.sd-modal').should('be.visible');
  });

  it('does not select disabled items', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(TestSelector, { props: { onSelect } });
    cy.contains('button', '选择模型').click();

    cy.contains('.sd-model-selector-item', '已停用模型')
      .should('have.attr', 'aria-disabled', 'true')
      .click();
    cy.get('@onSelect').should('not.have.been.called');
    cy.get('.sd-modal').should('be.visible');
  });

  it('uses bundled SVG assets and an offline fallback', () => {
    cy.mount(
      defineComponent({
        components: { ModelSelectorLogo },
        template: `
          <div>
            <ModelSelectorLogo provider="openai" data-cy="openai" />
            <ModelSelectorLogo provider="custom-provider" data-cy="custom" />
            <ModelSelectorLogo provider="wandb" data-cy="fallback" />
          </div>
        `,
      }),
    );

    cy.get('[data-cy="openai"]')
      .should('have.attr', 'src')
      .and('satisfy', (source: string) => {
        return (
          !source.includes('models.dev') &&
          (source.startsWith('data:image/svg+xml') || source.includes('openai.svg'))
        );
      });
    cy.get('[data-cy="custom"]')
      .invoke('attr', 'src')
      .then((customSource) => {
        cy.get('[data-cy="fallback"]').should('have.attr', 'src', customSource);
      });
  });

  it('keeps monochrome provider logos visible in dark theme', () => {
    cy.mount(
      defineComponent({
        components: { ModelSelectorLogo },
        template: `
          <div sd-theme="dark">
            <ModelSelectorLogo provider="openai" />
          </div>
        `,
      }),
    );

    cy.get('.sd-model-selector-logo').should('have.css', 'filter', 'brightness(0) invert(1)');
  });
});
