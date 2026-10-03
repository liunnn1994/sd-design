import ConfigProvider from '../../config-provider';
import enUS from '../../locale/lang/en-us';
import zhCN from '../../locale/lang/zh-cn';
import { ModelSelectorDialog } from '../index';

const mountDialog = (locale?: typeof zhCN) =>
  cy.mount({
    components: { ConfigProvider, ModelSelectorDialog },
    setup: () => ({ locale }),
    template:
      '<ConfigProvider :locale="locale">' +
      '<ModelSelectorDialog :default-visible="true" :footer="false" />' +
      '</ConfigProvider>',
  });

describe('ModelSelectorDialog title', () => {
  it('renders the Chinese locale text by default', () => {
    mountDialog();
    cy.get('.sd-modal-header').should('contain.text', '模型选择');
  });

  it('follows the configured locale instead of hardcoding Chinese', () => {
    mountDialog(enUS);
    cy.get('.sd-modal-header').should('contain.text', 'Select a model');
  });

  it('prefers an explicitly passed title', () => {
    cy.mount(ModelSelectorDialog, {
      props: { defaultVisible: true, footer: false, title: 'Pick one' },
    });
    cy.get('.sd-modal-header').should('contain.text', 'Pick one');
  });
});
