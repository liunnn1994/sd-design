const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';

describe('shared documentation experience', () => {
  for (const framework of ['vue', 'react']) {
    const prefix = framework === 'react' ? '/react' : '';
    it(`${framework}: home components, links and mobile layout`, () => {
      cy.visit(`${origin}${prefix}/`, {
        onBeforeLoad(win) {
          Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
        },
      });
      cy.get('.home-hero__actions a')
        .first()
        .should('have.attr', 'href', `${prefix}/guides/start/`);
      cy.get('.home-hero__workbench astro-island').should('not.have.attr', 'ssr');
      cy.get('.home-workbench [aria-label="选择工作方式"]').click();
      cy.contains('[role="menuitem"]', '提问').click();
      cy.get('.home-workbench [aria-label="选择工作方式"]').should('contain.text', '提问');
      cy.get('#components').scrollIntoView();
      cy.contains('.home-previews button', '开始创作').click();
      cy.contains('.home-previews button', '已点击 1 次').should('exist');
      cy.viewport(390, 844);
      cy.document().should((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    });

    it(`${framework}: categorized navigation, pagination and scoped search`, () => {
      cy.visit(`${origin}${prefix}/components/button/`);
      cy.get('.sidebar-content').should('contain.text', '开始使用').and('contain.text', '主题');
      cy.get('.pagination-links a').each<HTMLAnchorElement>((link) => {
        expect(new URL(link[0].href).pathname.startsWith('/react/')).to.equal(
          framework === 'react',
        );
      });
      cy.get('button[data-open-modal]').click();
      cy.get('site-search input[type="text"]').type('Button');
      cy.get('.pagefind-ui__result a', { timeout: 30000 })
        .should('have.length.at.least', 1)
        .each<HTMLAnchorElement>((link) => {
          expect(new URL(link[0].href).pathname.startsWith('/react/')).to.equal(
            framework === 'react',
          );
        });
    });
  }

  it('edits and executes TSX, restores errors and manages files', () => {
    cy.visit(`${origin}/react/components/button/`, {
      onBeforeLoad(win) {
        Object.defineProperty(win, 'EditContext', { configurable: true, value: undefined });
      },
    });
    const block = '.demo-block[data-example="button/basic"]';
    cy.get(`${block} .demo-editor__button`).click();
    cy.get(`${block} .monaco-editor textarea.inputarea`, { timeout: 60000 }).as('code');
    const replaceCode = (source: string) => {
      cy.get('@code').focus().trigger('keydown', {
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
        ctrlKey: true,
        force: true,
      });
      cy.get('@code').then((field) => {
        const win = field[0].ownerDocument.defaultView!;
        const clipboardData = new win.DataTransfer();
        clipboardData.setData('text/plain', source);
        field[0].dispatchEvent(
          new win.ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
        );
      });
    };
    replaceCode('export default function Example() { return <button>React 在线编辑成功</button> }');
    cy.get<HTMLIFrameElement>(`${block} iframe`).should((frame) => {
      expect(frame[0].contentDocument?.querySelector('button')?.textContent).to.contain(
        'React 在线编辑成功',
      );
    });
    replaceCode('export default <');
    cy.get(`${block} [role="alert"]`).should('be.visible');
    cy.contains(`${block} button`, '重置').click();
    cy.get<HTMLIFrameElement>(`${block} iframe`).should((frame) => {
      expect(frame[0].contentDocument?.querySelector('button')?.textContent).to.contain('主要');
    });
    cy.get(`${block} [aria-label="文件名"]`).type('Helper.tsx');
    cy.contains(`${block} button`, '新增文件').click();
    cy.get(`${block} [role="tab"]`).should('have.length', 2);
    cy.get(`${block} [aria-label="文件名"]`).type('Renamed.tsx');
    cy.contains(`${block} button`, '重命名').click();
    cy.get(`${block} [role="tab"][aria-selected="true"]`).should('have.text', 'Renamed.tsx');
    cy.contains(`${block} button`, '删除文件').click();
    cy.get(`${block} [role="tab"]`).should('have.length', 1);
  });

  it('uses real React components in the shared theme workspace', () => {
    cy.viewport(1440, 1000);
    cy.visit(`${origin}/react/guides/theme-editor/`);
    cy.get('[data-framework="react"] [data-testid="workspace-page"]', { timeout: 60000 }).should(
      'exist',
    );
    cy.contains('[data-framework="react"] button', '新建任务').click();
    cy.get('.sd-modal input[aria-label="任务名称"]').type('React 主题验收');
    cy.contains('.sd-modal button', '创建任务').click();
    cy.get('[data-framework="react"] .sd-table').should('contain.text', 'React 主题验收');
    cy.contains('.preview-toolbar label', '深色').click();
    cy.get('[data-framework="react"] [data-sd-theme="dark"]').should('exist');
  });
});

export {};
