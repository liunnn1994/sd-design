import { defineComponent, ref } from 'vue';

import { VueDraggable } from 'vue-draggable-plus';

import type { KvListItem, KvListType } from '../types';

import { configProviderInjectionKey } from '../../config-provider/context';
import Input from '../../input';
import enUS from '../../locale/lang/en-us';
import KvList from '../index';

const createHarness = ({
  initialJson = [],
  initialBulk = '',
  type,
  disabled = false,
  bulkEditable,
  keyProps,
  valueProps,
  withSlots = false,
}: {
  initialJson?: KvListItem[];
  initialBulk?: string;
  type?: KvListType;
  disabled?: boolean;
  bulkEditable?: boolean;
  keyProps?: Record<string, unknown>;
  valueProps?: Record<string, unknown>;
  withSlots?: boolean;
} = {}) =>
  defineComponent({
    components: { Input, KvList },
    setup() {
      const json = ref(initialJson);
      const bulk = ref(initialBulk);
      return {
        json,
        bulk,
        type,
        disabled,
        bulkEditable,
        keyProps,
        valueProps,
        withSlots,
      };
    },
    template: `
      <KvList
        v-model:json="json"
        v-model:bulk="bulk"
        :type="type"
        :disabled="disabled"
        :bulk-editable="bulkEditable"
        :key-props="keyProps"
        :value-props="valueProps"
      >
        <template v-if="withSlots" #key="{ value, update, props }">
          <Input
            v-bind="props"
            data-testid="custom-key"
            :model-value="value"
            @update:model-value="update"
          />
        </template>
        <template v-if="withSlots" #value="{ value, update, props }">
          <Input
            v-bind="props"
            data-testid="custom-value"
            :model-value="value"
            @update:model-value="update"
          />
        </template>
      </KvList>
      <pre data-testid="json-model">{{ JSON.stringify(json) }}</pre>
      <pre data-testid="bulk-model">{{ bulk }}</pre>
    `,
  });

describe('KvList', () => {
  it('uses Input components by default and keeps both models in sync', () => {
    cy.mount(createHarness());

    cy.get('[data-testid="kv-list-row"] input').should('have.length', 2);
    cy.get('[data-testid="kv-list-row"] input').eq(0).type('region');
    cy.get('[data-testid="kv-list-row"] input').eq(1).type('cn-north');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'region', value: 'cn-north' }]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'region: cn-north');
  });

  it('uses HTTP header autocomplete for the http-header type', () => {
    cy.mount(createHarness({ type: 'http-header' }));

    cy.get('[data-testid="kv-list-row"] input').eq(0).focus().type('Content-T');
    cy.contains('.sd-select-option', 'Content-Type').click();
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'Content-Type', value: '' }]),
    );
  });

  it('uses InputPassword and hides bulk editing by default for the secret type', () => {
    cy.mount(createHarness({ type: 'secret' }));

    cy.get('[data-testid="kv-list-row"] input').eq(1).should('have.attr', 'type', 'password');
    cy.contains('button', '切换到 Bulk 编辑').should('not.exist');
    cy.get('[data-testid="kv-list-row"] input').eq(0).type('token');
    cy.get('[data-testid="kv-list-row"] input').eq(1).type('secret-value');
    cy.get('[data-testid="bulk-model"]').should('have.text', 'token: secret-value');
  });

  it('allows explicitly enabling bulk editing for secrets', () => {
    cy.mount(createHarness({ type: 'secret', bulkEditable: true }));

    cy.contains('button', '切换到 Bulk 编辑').click();
    cy.get('[data-testid="kv-list-bulk"]').should('exist');
  });

  it('passes keyProps and valueProps through while retaining model control', () => {
    cy.mount(
      createHarness({
        keyProps: { placeholder: '自定义键', allowClear: true },
        valueProps: { placeholder: '自定义值', readonly: true },
      }),
    );

    cy.get('[data-testid="kv-list-row"] input')
      .eq(0)
      .should('have.attr', 'placeholder', '自定义键')
      .type('editable');
    cy.get('[data-testid="kv-list-row"] input')
      .eq(1)
      .should('have.attr', 'placeholder', '自定义值')
      .and('have.attr', 'readonly');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'editable', value: '' }]),
    );
  });

  it('lets key and value slots override built-in editors', () => {
    cy.mount(createHarness({ withSlots: true }));

    cy.get('[data-testid="custom-key"] input').type('custom');
    cy.get('[data-testid="custom-value"] input').type('renderer');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'custom', value: 'renderer' }]),
    );
  });

  it('disables field and structural editing', () => {
    cy.mount(createHarness({ disabled: true }));

    cy.get('[data-testid="kv-list-row"] input').should('be.disabled');
    cy.contains('button', '新增键值对').should('be.disabled');
    cy.contains('button', '删除键值对').should('be.disabled');
    cy.contains('button', '清空键值对').should('be.disabled');
  });

  it('syncs both models when vue-draggable-plus updates row order', () => {
    cy.mount(
      createHarness({
        initialJson: [
          { key: 'first', value: '1' },
          { key: 'second', value: '2' },
        ],
      }),
    );

    cy.get('@vue').then(({ wrapper }) => {
      const draggable = wrapper.findComponent(VueDraggable);
      const rows = draggable.props('modelValue');
      draggable.vm.$emit('update:modelValue', [...rows].reverse());
      draggable.vm.$emit('update');
    });
    cy.get('[data-testid="bulk-model"]').should('have.text', 'second: 2\nfirst: 1');
  });

  it('uses locale messages', () => {
    cy.mount(createHarness(), {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: { locale: enUS },
        },
      },
    });

    cy.contains('button', 'Add item').should('exist');
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.attr', 'placeholder', 'Key');
  });
});
