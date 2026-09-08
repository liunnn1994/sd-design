import { defineComponent, ref } from 'vue';
import type { Ref } from 'vue';

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
  withToolbarExtra = false,
  withRowActions = false,
}: {
  initialJson?: KvListItem[];
  initialBulk?: string;
  type?: KvListType;
  disabled?: boolean;
  bulkEditable?: boolean;
  keyProps?: Record<string, unknown>;
  valueProps?: Record<string, unknown>;
  withSlots?: boolean;
  withToolbarExtra?: boolean;
  withRowActions?: boolean;
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
        withToolbarExtra,
        withRowActions,
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
        <template v-if="withToolbarExtra" #toolbar-extra>
          <span data-testid="toolbar-extra">extra</span>
        </template>
        <template v-if="withRowActions" #row-actions="{ item, index }">
          <span data-testid="row-action">{{ index }}|{{ JSON.stringify(item) }}</span>
        </template>
      </KvList>
      <pre data-testid="json-model">{{ JSON.stringify(json) }}</pre>
      <pre data-testid="bulk-model">{{ bulk }}</pre>
    `,
  });

const createSyncHarness = ({
  jsonRef = ref<KvListItem[]>([]),
  bulkRef = ref(''),
  typeRef = ref<KvListType | undefined>(undefined),
  bulkEditableRef = ref<boolean | undefined>(undefined),
}: {
  jsonRef?: Ref<KvListItem[]>;
  bulkRef?: Ref<string>;
  typeRef?: Ref<KvListType | undefined>;
  bulkEditableRef?: Ref<boolean | undefined>;
} = {}) =>
  defineComponent({
    components: { KvList },
    setup() {
      return { jsonRef, bulkRef, typeRef, bulkEditableRef };
    },
    template: `
      <KvList
        v-model:json="jsonRef"
        v-model:bulk="bulkRef"
        :type="typeRef"
        :bulk-editable="bulkEditableRef"
      />
      <pre data-testid="json-model">{{ JSON.stringify(jsonRef) }}</pre>
      <pre data-testid="bulk-model">{{ bulkRef }}</pre>
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

  it('renders a single empty row when no items are provided', () => {
    cy.mount(createHarness());

    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', '');
    cy.get('[data-testid="kv-list-row"] input').eq(1).should('have.value', '');
    cy.get('[data-testid="json-model"]').should('have.text', '[]');
    cy.get('[data-testid="bulk-model"]').should('have.text', '');
  });

  it('parses the initial bulk model into rows and json', () => {
    cy.mount(createHarness({ initialBulk: 'x: 1' }));

    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', 'x');
    cy.get('[data-testid="kv-list-row"] input').eq(1).should('have.value', '1');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'x', value: '1' }]),
    );
  });

  it('prefers the json model when both models are initialized', () => {
    cy.mount(
      createHarness({
        initialJson: [{ key: 'a', value: '1' }],
        initialBulk: 'z: 9',
      }),
    );

    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'a', value: '1' }]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'a: 1');
  });

  it('filters rows with empty keys out of both models', () => {
    cy.mount(createHarness());

    cy.get('[data-testid="kv-list-row"] input').eq(1).type('orphan');
    cy.get('[data-testid="json-model"]').should('have.text', '[]');
    cy.get('[data-testid="bulk-model"]').should('have.text', '');
    cy.get('[data-testid="kv-list-row"] input').eq(0).type('k');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'k', value: 'orphan' }]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'k: orphan');
  });

  it('adds an empty row without committing it to the models until it is edited', () => {
    cy.mount(createHarness({ initialJson: [{ key: 'a', value: '1' }] }));

    cy.contains('button', '新增键值对').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 2);
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'a', value: '1' }]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'a: 1');
    cy.get('[data-testid="kv-list-row"]').eq(1).find('input').eq(0).type('b');
    cy.get('[data-testid="kv-list-row"]').eq(1).find('input').eq(1).type('2');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'a: 1\nb: 2');
  });

  it('keeps both models free of stale entries after add and remove cycles', () => {
    cy.mount(createHarness({ initialJson: [{ key: 'a', value: '1' }] }));

    // 新增空行后删除已有行：空键行不应写进任何模型
    cy.contains('button', '新增键值对').click();
    cy.get('[data-testid="kv-list-row"]').eq(0).contains('button', '删除键值对').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('[data-testid="json-model"]').should('have.text', '[]');
    cy.get('[data-testid="bulk-model"]').should('have.text', '');

    // 再次编辑该行后模型恢复正常
    cy.get('[data-testid="kv-list-row"] input').eq(0).type('k');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'k', value: '' }]),
    );
  });

  it('removes the targeted row and syncs both models', () => {
    cy.mount(
      createHarness({
        initialJson: [
          { key: 'a', value: '1' },
          { key: 'b', value: '2' },
        ],
      }),
    );

    cy.get('[data-testid="kv-list-row"]').eq(0).contains('button', '删除键值对').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', 'b');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'b', value: '2' }]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'b: 2');
  });

  it('keeps one empty row after removing the last row', () => {
    cy.mount(createHarness({ initialJson: [{ key: 'a', value: '1' }] }));

    cy.get('[data-testid="kv-list-row"]').eq(0).contains('button', '删除键值对').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', '');
    cy.get('[data-testid="json-model"]').should('have.text', '[]');
    cy.get('[data-testid="bulk-model"]').should('have.text', '');
  });

  it('clears all rows and resets both models', () => {
    cy.mount(
      createHarness({
        initialJson: [
          { key: 'a', value: '1' },
          { key: 'b', value: '2' },
        ],
      }),
    );

    cy.contains('button', '清空键值对').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', '');
    cy.get('[data-testid="json-model"]').should('have.text', '[]');
    cy.get('[data-testid="bulk-model"]').should('have.text', '');
  });

  it('round-trips list edits through bulk mode', () => {
    cy.mount(createHarness({ initialJson: [{ key: 'a', value: '1' }] }));

    cy.contains('button', '切换到 Bulk 编辑').click();
    cy.get('[data-testid="kv-list-bulk"] textarea')
      .should('have.value', 'a: 1')
      .type('{moveToEnd}{enter}b: 2');
    cy.contains('button', '切换到列表编辑').click();
    cy.get('[data-testid="kv-list-row"]').should('have.length', 2);
    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', 'a');
    cy.get('[data-testid="kv-list-row"] input').eq(1).should('have.value', '1');
    cy.get('[data-testid="kv-list-row"] input').eq(2).should('have.value', 'b');
    cy.get('[data-testid="kv-list-row"] input').eq(3).should('have.value', '2');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ]),
    );
    cy.get('[data-testid="bulk-model"]').should('have.text', 'a: 1\nb: 2');
  });

  it('replaces rows when the json model is updated externally', () => {
    const jsonRef = ref<KvListItem[]>([{ key: 'a', value: '1' }]);
    cy.mount(createSyncHarness({ jsonRef }));

    cy.get('[data-testid="kv-list-row"]').should('have.length', 1);
    cy.get('@vue').then(() => {
      jsonRef.value = [
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ];
    });
    cy.get('[data-testid="kv-list-row"]').should('have.length', 2);
    cy.get('[data-testid="kv-list-row"] input').eq(2).should('have.value', 'b');
    cy.get('[data-testid="bulk-model"]').should('have.text', 'a: 1\nb: 2');
  });

  it('replaces rows when the bulk model is updated externally', () => {
    const bulkRef = ref('x: 1');
    cy.mount(createSyncHarness({ bulkRef }));

    cy.get('[data-testid="kv-list-row"] input').eq(0).should('have.value', 'x');
    cy.get('@vue').then(() => {
      bulkRef.value = 'x: 1\ny: 2';
    });
    cy.get('[data-testid="kv-list-row"]').should('have.length', 2);
    cy.get('[data-testid="kv-list-row"] input').eq(2).should('have.value', 'y');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([
        { key: 'x', value: '1' },
        { key: 'y', value: '2' },
      ]),
    );
  });

  it('resets bulk mode when bulk editing becomes unavailable', () => {
    const typeRef = ref<KvListType | undefined>('http-header');
    const jsonRef = ref<KvListItem[]>([{ key: 'a', value: '1' }]);
    cy.mount(createSyncHarness({ typeRef, jsonRef }));

    cy.contains('button', '切换到 Bulk 编辑').click();
    cy.get('[data-testid="kv-list-bulk"]').should('exist');
    cy.get('@vue').then(() => {
      typeRef.value = 'secret';
    });
    cy.get('[data-testid="kv-list-bulk"]').should('not.exist');
    cy.contains('button', '切换到 Bulk 编辑').should('not.exist');
    cy.get('[data-testid="json-model"]').should(
      'have.text',
      JSON.stringify([{ key: 'a', value: '1' }]),
    );
  });

  it('renders the toolbar-extra slot', () => {
    cy.mount(createHarness({ withToolbarExtra: true }));

    cy.get('[data-testid="toolbar-extra"]').should('have.text', 'extra');
  });

  it('provides item and index to the row-actions slot', () => {
    cy.mount(
      createHarness({
        initialJson: [
          { key: 'a', value: '1' },
          { key: 'b', value: '2' },
        ],
        withRowActions: true,
      }),
    );

    cy.get('[data-testid="row-action"]').should('have.length', 2);
    cy.get('[data-testid="row-action"]').eq(0).should('have.text', '0|{"key":"a","value":"1"}');
    cy.get('[data-testid="row-action"]').eq(1).should('have.text', '1|{"key":"b","value":"2"}');
  });

  it('disables the bulk toggle when disabled', () => {
    cy.mount(createHarness({ disabled: true }));

    cy.contains('button', '切换到 Bulk 编辑').should('be.disabled');
  });
});
