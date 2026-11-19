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

  it('edits and executes TSX, recovers from errors, and switches source files', () => {
    cy.visit(`${origin}/react/components/button/`);
    const block = '.demo-block[data-example="button/basic"]';
    const app = (frame: HTMLIFrameElement) =>
      frame.contentDocument?.querySelector<HTMLIFrameElement>('iframe[name="app"]')
        ?.contentDocument;
    const preview = (frame: HTMLIFrameElement) =>
      app(frame)?.querySelector<HTMLIFrameElement>('#result iframe')?.contentDocument;
    const playground = () =>
      cy.get<HTMLIFrameElement>(`${block} iframe.livecodes`, { timeout: 90000 });
    const expectButton = (text: string) =>
      playground().should((frames) => {
        expect(preview(frames[0])?.body.textContent ?? '', 'LiveCodes preview').to.contain(text);
      });

    cy.get(`${block} .demo-editor__button`).click();
    expectButton('主要');
    playground().then((frames) => {
      const doc = app(frames[0])!;
      cy.wrap(doc.defaultView)
        .its('monaco.editor')
        .invoke('getEditors')
        .then((editors) => {
          const editor = editors.find((candidate: { getDomNode(): HTMLElement }) =>
            candidate.getDomNode().closest('#script'),
          );
          expect(doc.querySelector('#script-selector')?.textContent).to.contain('button-basic.tsx');
          const original = editor.getValue();
          editor.setValue(
            'export default function Example() { return <button>React 在线编辑成功</button> }',
          );
          expectButton('React 在线编辑成功').then(() => {
            editor.setValue('throw new Error("React 在线编辑错误");');
          });
          cy.wrap(doc)
            .find('#console', { timeout: 30000 })
            .should('contain.text', 'React 在线编辑错误')
            .then(() => {
              editor.setValue(original);
            });
          expectButton('主要');
          cy.wrap(doc).find('#style-selector').click();
          cy.wrap(doc.defaultView)
            .its('monaco.editor')
            .invoke('getEditors')
            .then((editors) => {
              const style = editors.find((candidate: { getDomNode(): HTMLElement }) =>
                candidate.getDomNode().closest('#style'),
              );
              style.setValue('button { --editor-e2e-value: verified; }');
            });
          cy.wrap(doc).find('#script-selector').click();
          expectButton('主要');
          playground().should((frames) => {
            const result = preview(frames[0]);
            const button = result?.querySelector('button');
            expect(
              button &&
                result?.defaultView
                  ?.getComputedStyle(button)
                  .getPropertyValue('--editor-e2e-value')
                  .trim(),
            ).to.equal('verified');
          });
        });
    });
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
