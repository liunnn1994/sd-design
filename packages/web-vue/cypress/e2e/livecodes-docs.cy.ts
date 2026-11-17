const app = (frame: HTMLIFrameElement) =>
  frame.contentDocument?.querySelector<HTMLIFrameElement>('iframe[name="app"]')?.contentDocument;
const preview = (frame: HTMLIFrameElement) =>
  app(frame)?.querySelector<HTMLIFrameElement>('#result iframe')?.contentDocument;

function contrast(element: Element) {
  const view = element.ownerDocument.defaultView!;
  const channels = (color: string) => color.match(/[\d.]+/g)!.map(Number);
  const blend = (foreground: number[], background: number[]) =>
    background.map(
      (channel, index) =>
        foreground[index]! * (foreground[3] ?? 1) + channel * (1 - (foreground[3] ?? 1)),
    );
  const ancestors: Element[] = [];
  for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node);
  const background = ancestors.reduce(
    (color, node) => blend(channels(view.getComputedStyle(node).backgroundColor), color),
    [255, 255, 255],
  );
  const luminance = (channels: number[]) => {
    return channels.reduce((sum, channel, index) => {
      const value = channel / 255;
      return (
        sum +
        (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][index]!
      );
    }, 0);
  };
  const foregroundLuminance = luminance(
    blend(channels(view.getComputedStyle(element).color), background),
  );
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

for (const framework of ['vue', 'react']) {
  for (const theme of ['light', 'dark']) {
    it(`${framework}: renders a Chinese playground with the ${theme} SD theme`, () => {
      cy.visit(`${framework === 'react' ? '/react' : ''}/components/button/`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('starlight-theme', theme);
        },
      });
      cy.get('html').should('have.attr', 'data-theme', theme);
      cy.get('.demo-block')
        .first()
        .scrollIntoView()
        .within(() => {
          cy.contains('button', '在线编辑', { timeout: 30000 }).click();
          cy.get<HTMLIFrameElement>('iframe.livecodes', { timeout: 90000 }).should((frames) => {
            const doc = app(frames[0])!;
            expect(preview(frames[0])?.querySelector('button.sd-btn')?.textContent).to.contain(
              '主要',
            );
            expect(doc.querySelector('#external-resources-btn')?.getAttribute('title')).to.equal(
              '外部资源',
            );
            const logo = doc.querySelector('#toolbar #logo')!;
            expect(
              doc.defaultView!.getComputedStyle(logo).pointerEvents,
              'standalone playground link ignores pointer events',
            ).to.equal('none');
            expect(doc.defaultView!.getComputedStyle(logo).display).not.to.equal('none');
            const parentStyles = frames[0].ownerDocument.defaultView!.getComputedStyle(
              frames[0].ownerDocument.body,
            );
            const background = doc.querySelector('.monaco-editor-background')!;
            expect(doc.defaultView!.getComputedStyle(background).backgroundColor).to.equal(
              parentStyles.backgroundColor,
            );
            expect(doc.documentElement.style.getPropertyValue('--sd-primary-6')).to.equal(
              parentStyles.getPropertyValue('--sd-primary-6'),
            );
            expect(preview(frames[0])?.body.getAttribute('sd-theme')).to.equal(theme);
            if (framework === 'react') {
              const monaco = (
                doc.defaultView as unknown as {
                  monaco: {
                    editor: { getModels(): { uri: { path: string }; getValue(): string }[] };
                  };
                }
              ).monaco;
              expect(
                monaco.editor
                  .getModels()
                  .some(
                    (model) =>
                      model.uri.path.endsWith('.tsx') &&
                      model.getValue().includes('export default'),
                  ),
                'React source uses a TSX model',
              ).to.equal(true);
            }
            const colors = Array.from(
              doc.querySelectorAll('.view-lines span span'),
              (span) => doc.defaultView!.getComputedStyle(span).color,
            );
            expect(new Set(colors).size, 'syntax highlighting colors').to.be.greaterThan(2);
            for (const title of doc.querySelectorAll('.tools-pane-title'))
              expect(contrast(title), 'bottom tab contrast').to.be.at.least(4.5);
          });
          cy.get<HTMLIFrameElement>('iframe.livecodes').then((frames) => {
            cy.wrap(app(frames[0])!).find('#external-resources-btn').click();
            cy.wrap(app(frames[0])!)
              .find('#modal .modal-title')
              .should((titles) => {
                expect(titles[0].textContent).to.contain('外部资源');
                expect(contrast(titles[0]), 'resource modal heading contrast').to.be.at.least(4.5);
              });
          });
          cy.contains('button', '收起').click().should('have.attr', 'aria-expanded', 'false');
          cy.get('.demo-editor__panel').should('not.be.visible');
        });
    });
  }
  for (const component of ['icon', 'icon-component']) {
    it(`${framework}: renders ${component} including stylesheet imports`, () => {
      cy.visit(`${framework === 'react' ? '/react' : ''}/components/${component}/`);
      cy.get('.demo-block')
        .first()
        .scrollIntoView()
        .within(() => {
          cy.contains('button', '在线编辑', { timeout: 30000 }).click();
          cy.get<HTMLIFrameElement>('iframe.livecodes', { timeout: 90000 }).should((frames) => {
            const selector =
              component === 'icon'
                ? '[data-testid="icon-demo-preview"]'
                : '[data-testid="icon-font-demo"]';
            expect(Boolean(preview(frames[0])?.querySelector(selector))).to.equal(true);
          });
        });
    });
  }
}

it('Vue completes template props and typed script members with word suggestions disabled', () => {
  cy.visit('/components/select/');
  cy.get('.demo-block')
    .first()
    .within(() => {
      cy.contains('button', '在线编辑', { timeout: 30000 }).click();
      cy.get<HTMLIFrameElement>('iframe.livecodes', { timeout: 90000 })
        .should((frames) => {
          expect(Boolean(preview(frames[0])?.querySelector('.sd-select'))).to.equal(true);
        })
        .then((frames) => {
          const doc = app(frames[0])!;
          cy.wrap(doc.defaultView)
            .its('monaco.editor')
            .invoke('getEditors')
            .then((editors) => {
              const editor = editors.find((candidate: { getDomNode(): HTMLElement }) =>
                candidate.getDomNode().closest('#markup'),
              );
              expect(editor.getModel().getLanguageId()).to.equal('vue');
              editor.updateOptions({ wordBasedSuggestions: 'off' });
              editor.setValue(
                '<script setup>\nimport SdSelect from "@sdata/web-vue/es/select/index.js";\n</script>\n<template>\n<sd-select si />\n</template>',
              );
              editor.setPosition({ lineNumber: 5, column: 14 });
              editor.focus();
              editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
              return cy
                .wrap(doc)
                .find('.suggest-widget .monaco-list-row', { timeout: 30000 })
                .should('contain.text', 'size')
                .then(() => {
                  editor.trigger('keyboard', 'hideSuggestWidget', {});
                  const source =
                    '<script setup lang="ts">\ninterface Answer { typedAnswerProperty: number; }\nconst answer = {} as Answer;\nanswer.\n</script>\n<template><div /></template>';
                  editor.setValue(source);
                  editor.setPosition(
                    editor.getModel().getPositionAt(source.indexOf('answer.') + 'answer.'.length),
                  );
                  editor.focus();
                  editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
                })
                .then(() =>
                  cy
                    .wrap(doc)
                    .find('.suggest-widget', { timeout: 30000 })
                    .contains('.monaco-list-row', 'typedAnswerProperty', { timeout: 30000 })
                    .find('.codicon-symbol-property')
                    .should('exist'),
                );
            });
        });
    });
});
