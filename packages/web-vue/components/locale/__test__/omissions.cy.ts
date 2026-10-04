import { defineComponent, h, ref, type VNode } from 'vue';

import BasicCrudTable from '../../basic-crud-table';
import ColorPicker from '../../color-picker';
import ConfigProvider from '../../config-provider';
import InputMask from '../../input-mask';
import JsonForm, { type JsonFormInstance } from '../../json-form';
import ModelSelector, { ModelSelectorEmpty } from '../../model-selector';
import QrCodeStatus from '../../qr-code/qr-code-status.vue';
import Tour from '../../tour';
import { addI18nMessages, useLocale } from '../index';
import enUS from '../lang/en-us';
import zhCN from '../lang/zh-cn';

function mountLocalized(render: () => VNode) {
  const locale = ref(enUS);
  cy.mount(
    defineComponent({
      setup: () => () => h(ConfigProvider, { locale: locale.value }, render),
    }),
    { global: { stubs: { 'transition': false, 'transition-group': false } } },
  );
  return locale;
}

describe('Previously omitted i18n messages', () => {
  afterEach(() => useLocale('zh-CN'));

  it('localizes model selector empty text and preserves the slot', () => {
    const custom = ref(false);
    const locale = mountLocalized(() =>
      h(ModelSelector, {}, () =>
        h(ModelSelectorEmpty, {}, custom.value ? () => 'Custom empty' : undefined),
      ),
    );
    cy.get('.sd-model-selector-empty').should('have.text', 'No matching models found');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('.sd-model-selector-empty').should('have.text', '未找到匹配的模型');
    cy.then(() => {
      custom.value = true;
    });
    cy.get('.sd-model-selector-empty').should('have.text', 'Custom empty');
  });

  it('localizes QR statuses, responds to global changes, and falls back for old packs', () => {
    addI18nMessages({ 'en-US': enUS });
    useLocale('en-US');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(QrCodeStatus, { prefixCls: 'qr', status: 'expired' }),
            h(QrCodeStatus, { prefixCls: 'qr', status: 'scanned' }),
          ]),
      }),
    );
    cy.get('.qr-expired').should('have.text', 'QR code expired');
    cy.get('.qr-scanned').should('have.text', 'QR code scanned');
    cy.get('.qr-refresh-btn').should('have.text', 'Refresh');
    cy.then(() => useLocale('zh-CN'));
    cy.get('.qr-expired').should('have.text', '二维码已过期');
    cy.then(() => {
      addI18nMessages({ legacy: { ...enUS, locale: 'legacy', qrCode: undefined } });
      useLocale('legacy');
    });
    cy.get('.qr-refresh-btn').should('have.text', '刷新');
  });

  it('localizes color modes and panel labels while mounted', () => {
    const locale = mountLocalized(() =>
      h(ColorPicker, {
        hideTrigger: true,
        defaultValue: 'linear-gradient(45deg, #000000 0%, #ffffff 100%)',
        colorModes: ['monochrome', 'linear-gradient'],
        recentColors: [],
        swatchColors: ['red'],
      }),
    );
    cy.get('.sd-color-picker-panel')
      .should('contain.text', 'Solid')
      .and('contain.text', 'Gradient')
      .and('contain.text', 'Angle');
    cy.get('.sd-color-picker-panel')
      .should('contain.text', 'Recent colors')
      .and('contain.text', 'Add current color');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('.sd-color-picker-panel')
      .should('contain.text', '单色')
      .and('contain.text', '渐变')
      .and('contain.text', '角度');
    cy.get('.sd-color-picker-panel')
      .should('contain.text', '最近使用')
      .and('contain.text', '添加当前颜色');
  });

  it('localizes JSON form placeholders and required errors, preserving explicit text', () => {
    const form = ref<JsonFormInstance>();
    const locale = mountLocalized(() =>
      h(JsonForm, {
        ref: form,
        modelValue: { name: '', choice: undefined, custom: '' },
        schemas: [
          { field: 'name', label: 'Name', required: true },
          { field: 'choice', label: 'Choice', type: 'select' },
          {
            field: 'custom',
            label: 'Custom',
            componentProps: { placeholder: 'Custom placeholder' },
          },
        ],
      }),
    );
    cy.get('input[placeholder="Enter Name"]').should('exist');
    cy.then(() => form.value!.validate());
    cy.get('.sd-form-item-message').should('contain.text', 'Name is required');
    cy.get('.sd-select-view-single input').should('have.attr', 'placeholder', 'Select Choice');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('input[placeholder="请输入Name"]').should('exist');
    cy.then(() => form.value!.validate());
    cy.get('.sd-form-item-message').should('contain.text', 'Name不能为空');
    cy.get('input[placeholder="Custom placeholder"]').should('exist');
  });

  it('localizes CRUD actions, modal titles, and the open delete confirmation', () => {
    const locale = mountLocalized(() =>
      h(BasicCrudTable, {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        fetchTableApi: async () => ({ data: [{ id: 1, name: 'Alice' }], total: 1 }),
        deleteNameKey: 'name',
      }),
    );
    cy.get('.sd-basic-crud-table')
      .should('contain.text', 'Create')
      .and('contain.text', 'Actions')
      .and('contain.text', 'Edit')
      .and('contain.text', 'Delete');
    cy.contains('.sd-basic-crud-table .sd-link', 'Delete').click();
    cy.get('.sd-popconfirm').should('contain.text', 'Delete "Alice"?');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('.sd-popconfirm').should('contain.text', '确定删除【Alice】吗？');
    cy.get('.sd-basic-crud-table').should('contain.text', '新建').and('contain.text', '操作');
    cy.contains('.sd-popconfirm-footer .sd-btn', '取消').click();
    cy.contains('.sd-basic-crud-table .sd-btn', '新建').click();
    cy.get('.sd-modal-title').should('contain.text', '创建');
    cy.then(() => {
      locale.value = enUS;
    });
    cy.get('.sd-modal-title').should('contain.text', 'Create');
  });

  it('localizes Tour buttons while mounted', () => {
    const locale = mountLocalized(() =>
      h(
        Tour,
        {
          defaultVisible: true,
          steps: [
            { element: '#i18n-tour-a', popover: { title: 'A' } },
            { element: '#i18n-tour-b', popover: { title: 'B' } },
          ],
        },
        () =>
          h('div', [
            h('button', { id: 'i18n-tour-a' }, 'A'),
            h('button', { id: 'i18n-tour-b' }, 'B'),
          ]),
      ),
    );
    cy.get('.sd-tour-popover-next-btn').should('contain.text', 'Next').click();
    cy.get('.sd-tour-popover-next-btn').should('contain.text', 'Done');
    cy.get('.sd-tour-popover-prev-btn').should('contain.text', 'Previous');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('.sd-tour-popover-next-btn').should('contain.text', '完成');
    cy.get('.sd-tour-popover-prev-btn').should('contain.text', '上一步');
    cy.get('.sd-tour-popover-close-btn').click();
  });

  it('localizes the IP preset placeholder and preserves explicit placeholders', () => {
    const locale = mountLocalized(() =>
      h('div', [
        h(InputMask, { preset: 'ip' }),
        h(InputMask, { preset: 'ip', placeholder: 'Custom IP' }),
      ]),
    );
    cy.get('input').first().should('have.attr', 'placeholder', '192.168.1.1 or 2001:db8::1');
    cy.then(() => {
      locale.value = zhCN;
    });
    cy.get('input').first().should('have.attr', 'placeholder', '192.168.1.1 或 2001:db8::1');
    cy.get('input').last().should('have.attr', 'placeholder', 'Custom IP');
  });
});
