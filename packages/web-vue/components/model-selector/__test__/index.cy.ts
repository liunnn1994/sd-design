import { defineComponent, shallowRef } from 'vue';

import ModelSelector, {
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
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

  it('uses an arbitrary slot component as the trigger without a button wrapper', () => {
    const CustomTrigger = defineComponent({
      template: '<article class="custom-trigger"><slot /></article>',
    });

    cy.mount(
      defineComponent({
        components: {
          CustomTrigger,
          ModelSelector,
          ModelSelectorContent,
          ModelSelectorTrigger,
        },
        template: `
          <ModelSelector>
            <ModelSelectorTrigger v-slot="{ disabled, visible }">
              <CustomTrigger>{{ visible }}|{{ disabled }}</CustomTrigger>
            </ModelSelectorTrigger>
            <ModelSelectorContent :render-to-body="false">自定义触发内容</ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    cy.get('.custom-trigger')
      .should('have.prop', 'tagName', 'ARTICLE')
      .and('have.class', 'sd-model-selector-trigger')
      .and('have.attr', 'aria-haspopup', 'dialog')
      .and('have.attr', 'aria-expanded', 'false')
      .and('have.text', 'false|false')
      .click()
      .should('have.attr', 'aria-expanded', 'true')
      .and('have.text', 'true|false');
    cy.get('.custom-trigger').find('button').should('not.exist');
    cy.contains('.sd-model-selector', '自定义触发内容').should('be.visible');
  });

  it('does not open a disabled custom trigger', () => {
    cy.mount(
      defineComponent({
        components: {
          ModelSelector,
          ModelSelectorContent,
          ModelSelectorTrigger,
        },
        template: `
          <ModelSelector>
            <ModelSelectorTrigger disabled>
              <div class="disabled-custom-trigger">禁用触发器</div>
            </ModelSelectorTrigger>
            <ModelSelectorContent :render-to-body="false">不应打开</ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    cy.get('.disabled-custom-trigger')
      .should('have.attr', 'aria-disabled', 'true')
      .and('have.attr', 'aria-expanded', 'false')
      .click();
    cy.contains('.sd-model-selector', '不应打开').should('not.exist');
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

  const ForwardingSelector = defineComponent({
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
    emits: ['select', 'visibleChange'],
    props: {
      closeOnSelect: {
        type: Boolean,
        default: true,
      },
      resetQueryOnClose: {
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
        :reset-query-on-close="resetQueryOnClose"
        @select="(value, event) => $emit('select', value, event)"
        @visible-change="(value) => $emit('visibleChange', value)"
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
              <ModelSelectorItem value="disabled" disabled>已停用模型</ModelSelectorItem>
            </ModelSelectorGroup>
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    `,
  });

  it('emits visibleChange when the selector opens and closes', () => {
    const onVisibleChange = cy.spy().as('onVisibleChange');
    cy.mount(ForwardingSelector, { props: { onVisibleChange } });
    cy.contains('button', '选择模型').click();
    cy.get('@onVisibleChange').should('have.been.calledWith', true);

    cy.get('input[placeholder="搜索模型"]').type('{esc}');
    cy.get('@onVisibleChange').should('have.been.calledWith', false);
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('resets the search query when the selector is closed by default', () => {
    cy.mount(ForwardingSelector);
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('GPT');
    cy.get('input[placeholder="搜索模型"]').should('have.value', 'GPT');
    cy.contains('.sd-model-selector-item', 'Claude 4').should('not.be.visible');

    cy.get('input[placeholder="搜索模型"]').type('{esc}');
    cy.get('.sd-modal').should('not.be.visible');

    // The closed modal's overlay container lingers until its leave transition
    // ends, covering the trigger — reopen with a forced click.
    cy.contains('button', '选择模型').click({ force: true });
    cy.get('input[placeholder="搜索模型"]').should('have.value', '');
    cy.contains('.sd-model-selector-item', 'Claude 4').should('be.visible');
  });

  it('preserves the search query across close and reopen when resetQueryOnClose is false', () => {
    cy.mount(ForwardingSelector, { props: { resetQueryOnClose: false } });
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('Claude');
    cy.contains('.sd-model-selector-item', 'GPT-4o').should('not.be.visible');

    cy.get('input[placeholder="搜索模型"]').type('{esc}');
    cy.get('.sd-modal').should('not.be.visible');

    // The closed modal's overlay container lingers until its leave transition
    // ends, covering the trigger — reopen with a forced click.
    cy.contains('button', '选择模型').click({ force: true });
    cy.get('input[placeholder="搜索模型"]').should('have.value', 'Claude');
    cy.contains('.sd-model-selector-item', 'GPT-4o').should('not.be.visible');
    cy.contains('.sd-model-selector-item', 'Claude 4').should('be.visible');
  });

  it('moves the active item to the last enabled option with ArrowUp and selects it', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(TestSelector, { props: { onSelect } });
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('{uparrow}{enter}');
    cy.get('@onSelect').should('have.been.calledOnce');
    cy.get('@onSelect').its('firstCall.args.0').should('equal', 'claude-4');
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('syncs aria-activedescendant with keyboard navigation and hover', () => {
    cy.mount(TestSelector);
    cy.contains('button', '选择模型').click();

    cy.get('input[placeholder="搜索模型"]').type('{downarrow}');
    cy.get('.sd-model-selector-item--active')
      .invoke('attr', 'id')
      .then((activeDomId) => {
        cy.get('input[placeholder="搜索模型"]').should(
          'have.attr',
          'aria-activedescendant',
          activeDomId,
        );
      });

    cy.contains('.sd-model-selector-item', 'Claude 4').trigger('mouseenter');
    cy.contains('.sd-model-selector-item', 'Claude 4').should(
      'have.class',
      'sd-model-selector-item--active',
    );
    cy.contains('.sd-model-selector-item', 'Claude 4').then(($item) => {
      const claudeDomId = $item.attr('id');
      cy.get('input[placeholder="搜索模型"]').should(
        'have.attr',
        'aria-activedescendant',
        claudeDomId,
      );
    });
  });

  it('marks items as selected and exposes item slot props and the item select event', () => {
    const onItemSelect = cy.spy().as('onItemSelect');
    cy.mount(
      defineComponent({
        components: { ModelSelector, ModelSelectorContent, ModelSelectorList, ModelSelectorItem },
        emits: ['itemSelect'],
        template: `
          <ModelSelector default-visible>
            <ModelSelectorContent :render-to-body="false">
              <ModelSelectorList>
                <ModelSelectorItem
                  value="a"
                  selected
                  @select="(value, event) => $emit('itemSelect', value, event)"
                >
                  <template #default="{ active, selected, disabled }">
                    <span class="item-state">{{ active }}-{{ selected }}-{{ disabled }}</span>
                  </template>
                </ModelSelectorItem>
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
        `,
      }),
      { props: { onItemSelect } },
    );

    cy.get('.item-state').should('have.text', 'false-true-false');
    cy.get('.sd-model-selector-item')
      .should('have.class', 'sd-model-selector-item--selected')
      .and('have.attr', 'aria-selected', 'true');

    cy.get('.sd-model-selector-item').click();
    cy.get('@onItemSelect').should('have.been.calledOnce');
    cy.get('@onItemSelect').its('firstCall.args.0').should('equal', 'a');
    cy.get('@onItemSelect').its('firstCall.args.1').should('be.instanceOf', MouseEvent);
  });

  it('supports v-model on the search input and forwards custom input attributes', () => {
    cy.mount(
      defineComponent({
        components: { ModelSelector, ModelSelectorContent, ModelSelectorInput },
        setup() {
          const query = shallowRef('gpt');
          return { query };
        },
        template: `
          <ModelSelector default-visible>
            <ModelSelectorContent :render-to-body="false">
              <ModelSelectorInput v-model="query" :input-attrs="{ 'data-cy-input-attr': 'custom' }" />
              <span class="query-mirror">{{ query }}</span>
            </ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    // Note: `type: 'search'` from the merged input attrs is intentionally not
    // asserted here — the underlying Input's explicit `:type` binding overrides
    // it, so the native input stays `type="text"` (reported as a quirk).
    cy.get('input[role="combobox"]')
      .should('have.value', 'gpt')
      .and('have.attr', 'autocomplete', 'off')
      .and('have.attr', 'data-cy-input-attr', 'custom');
    cy.get('input[role="combobox"]').should('have.attr', 'aria-controls');

    cy.get('input[role="combobox"]').type('X');
    cy.get('.query-mirror').should('have.text', 'gptX');
  });

  it('exposes open, close and visible through the default slot props', () => {
    cy.mount(
      defineComponent({
        components: { ModelSelector, ModelSelectorContent },
        template: `
          <ModelSelector v-slot="{ open, close, visible }">
            <button data-cy="open" @click="open">打开</button>
            <button data-cy="close" @click="close">关闭</button>
            <span class="visible-state">{{ visible }}</span>
            <ModelSelectorContent :render-to-body="false">插槽控制</ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    cy.get('.visible-state').should('have.text', 'false');
    cy.get('[data-cy="open"]').click();
    cy.get('.visible-state').should('have.text', 'true');
    cy.contains('.sd-model-selector', '插槽控制').should('be.visible');

    // The open modal's mask covers the slot-rendered buttons — close with a
    // forced click.
    cy.get('[data-cy="close"]').click({ force: true });
    cy.get('.visible-state').should('have.text', 'false');
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('searches by rendered text and renders the group heading slot', () => {
    cy.mount(
      defineComponent({
        components: {
          ModelSelector,
          ModelSelectorContent,
          ModelSelectorGroup,
          ModelSelectorInput,
          ModelSelectorItem,
          ModelSelectorList,
        },
        template: `
          <ModelSelector default-visible>
            <ModelSelectorContent :render-to-body="false">
              <ModelSelectorInput placeholder="搜索模型" />
              <ModelSelectorList>
                <ModelSelectorGroup>
                  <template #heading>
                    <span class="custom-heading">自定义分组</span>
                  </template>
                  <ModelSelectorItem value="qwen">通义千问</ModelSelectorItem>
                  <ModelSelectorItem value="gpt">GPT</ModelSelectorItem>
                </ModelSelectorGroup>
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
        `,
      }),
    );

    cy.get('.sd-model-selector-group-heading').should('contain.text', '自定义分组');
    cy.get('input[placeholder="搜索模型"]').type('千问');
    cy.contains('.sd-model-selector-item', '通义千问').should('be.visible');
    cy.contains('.sd-model-selector-item', 'GPT').should('not.be.visible');
  });

  it('renders ModelSelectorDialog with its own props and forwards events', () => {
    const onSelect = cy.spy().as('onSelect');
    const onVisibleChange = cy.spy().as('onVisibleChange');
    cy.mount(
      defineComponent({
        components: {
          ModelSelectorDialog,
          ModelSelectorItem,
          ModelSelectorList,
        },
        emits: ['select', 'visibleChange'],
        template: `
          <ModelSelectorDialog
            default-visible
            title="选择AI模型"
            :width="480"
            :render-to-body="false"
            @select="(value, event) => $emit('select', value, event)"
            @visible-change="(value) => $emit('visibleChange', value)"
          >
            <ModelSelectorList>
              <ModelSelectorItem value="gpt-4o">GPT-4</ModelSelectorItem>
            </ModelSelectorList>
          </ModelSelectorDialog>
        `,
      }),
      { props: { onSelect, onVisibleChange } },
    );

    cy.get('.sd-modal[role="dialog"]').should('be.visible');
    cy.contains('.sd-modal-title', '选择AI模型').should('exist');
    cy.get('.sd-modal.sd-model-selector-modal').should('have.css', 'width', '480px');

    cy.contains('.sd-model-selector-item', 'GPT-4').click();
    cy.get('@onSelect').should('have.been.calledOnce');
    cy.get('@onSelect').its('firstCall.args.0').should('equal', 'gpt-4o');
    cy.get('@onVisibleChange').should('have.been.calledWith', false);
  });

  it('renders the presentational subcomponents with their classes and logo attributes', () => {
    cy.mount(
      defineComponent({
        components: {
          ModelSelectorLogo,
          ModelSelectorLogoGroup,
          ModelSelectorName,
          ModelSelectorShortcut,
        },
        template: `
          <ModelSelectorShortcut>Ctrl K</ModelSelectorShortcut>
          <ModelSelectorName>GPT-4o</ModelSelectorName>
          <ModelSelectorLogoGroup>
            <ModelSelectorLogo provider="openai" :width="24" :height="24" alt="OpenAI logo" />
          </ModelSelectorLogoGroup>
        `,
      }),
    );

    cy.get('kbd.sd-model-selector-shortcut').should('have.text', 'Ctrl K');
    cy.get('.sd-model-selector-name').should('have.text', 'GPT-4o');
    cy.get('.sd-model-selector-logo-group .sd-model-selector-logo')
      .should('have.attr', 'alt', 'OpenAI logo')
      .and('have.attr', 'width', '24')
      .and('have.attr', 'height', '24');
  });
});
