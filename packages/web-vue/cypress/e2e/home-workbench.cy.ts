Cypress.on('uncaught:exception', (error) => {
  if (error.message.includes('ResizeObserver loop')) return false;
});

function captureWorkbench(name: string) {
  cy.get('.home-workbench').then(($box) => {
    const rect = $box[0].getBoundingClientRect();
    const win = $box[0].ownerDocument.defaultView!;
    cy.scrollTo(0, Math.max(0, rect.top + win.scrollY - 90));
  });
  cy.get('[role="menu"]').should('be.visible');
  cy.screenshot(name, { capture: 'viewport' });
}

function createTestPdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources <<>> /Contents 5 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources <<>> /Contents 6 0 R >>',
    '<< /Length 0 >>\nstream\n\nendstream',
    '<< /Length 0 >>\nstream\n\nendstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

describe('首页中央输入面板', () => {
  beforeEach(() => {
    cy.viewport(1280, 1000);
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
        cy.spy(win.console, 'warn').as('consoleWarn');
        cy.spy(win.console, 'error').as('consoleError');
      },
    });
    cy.get('.home-hero__workbench astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-workbench [data-state]').should('have.attr', 'data-state', 'complete');
    cy.get('starlight-theme-select select:visible').select('light');
  });

  it('uses normal library buttons and a compact logo preview', () => {
    cy.get('.home-hero__actions .sd-btn')
      .should('have.length', 2)
      .each(($button) => {
        expect($button[0].getBoundingClientRect().height).to.equal(32);
      });
    cy.contains('.home-hero__actions .sd-btn', '开始使用').should(
      'have.attr',
      'href',
      '/guides/start/',
    );
    cy.contains('.home-hero__actions .sd-btn', '浏览组件').should(
      'have.attr',
      'href',
      '/components/',
    );
    cy.get('.home-workbench [contenteditable="true"]').should(($editor) => {
      const doc = $editor[0].ownerDocument;
      const walker = doc.createTreeWalker($editor[0], NodeFilter.SHOW_TEXT);
      const tops: number[] = [];
      while (walker.nextNode()) {
        if (walker.currentNode.parentElement?.closest('[aria-hidden="true"]')) continue;
        if (
          !/用 SD Design 构建|AI 对话界面|，要求|android-chrome-192x192/.test(
            walker.currentNode.textContent || '',
          )
        )
          continue;
        const range = doc.createRange();
        range.selectNodeContents(walker.currentNode);
        const rect = range.getBoundingClientRect();
        if (rect.height) tops.push(rect.top);
      }
      expect(tops.length).to.be.at.least(4);
      expect(Math.max(...tops) - Math.min(...tops), 'inline text tops').to.be.at.most(1);
    });
    cy.contains('.home-workbench a', 'android-chrome-192x192.png').focus();
    cy.get('.home-file-links__preview img').should(($image) => {
      expect(($image[0] as HTMLImageElement).naturalWidth).to.equal(192);
      expect($image[0].getBoundingClientRect().width).to.be.at.most(192);
    });
  });

  it('刷新后水合一致，Tabs 和 Collapse 的可访问性关联保留', () => {
    cy.get('#components').scrollIntoView();
    cy.get('#components astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-previews [role="tab"]').each(($tab) => {
      const id = $tab.attr('aria-controls');
      cy.document().then((doc) => expect(doc.getElementById(id!)).to.exist);
    });
    for (const alias of ['@consoleWarn', '@consoleError']) {
      cy.get(alias).should((spy) => {
        const calls = (spy as unknown as { getCalls(): { args: unknown[] }[] }).getCalls();
        const warnings = calls
          .map((call) => call.args.map(String).join(' '))
          .filter((text) => /hydration/i.test(text));
        expect(warnings.join('\n')).to.equal('');
      });
    }
  });

  it('文件作为词槽插入正文，保留前后文字且可删除', () => {
    cy.get('.home-workbench [contenteditable="true"]').as('editor').type('{moveToEnd}文件前');
    cy.get('@editor').then(($editor) => {
      const data = new DataTransfer();
      data.items.add(new File(['# 文件'], 'inline.md', { type: 'text/markdown' }));
      $editor[0].dispatchEvent(
        new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }),
      );
    });
    cy.get('@editor').contains('.home-file-links a', 'inline.md').should('exist');
    cy.get('@editor').type('{moveToEnd}文件后');
    cy.get('@editor').should('contain.text', '文件前inline.md').and('contain.text', '文件后');
    cy.get('.home-workbench .sd-sender-header').should('not.exist');
    cy.get('[aria-label="移除 inline.md"]').click();
    cy.get('@editor').should('contain.text', '文件前文件后');
    cy.contains('.home-file-links a', 'inline.md').should('not.exist');
    cy.get('[aria-label="添加内容"]').click();
    cy.contains('[role="menuitem"]', '添加组件库').click();
    cy.contains('.home-file-links a', 'inline.md').should('not.exist');
  });

  it('构建产物中的本地 PDF 可以重复悬停预览', () => {
    cy.get('.home-workbench__file').selectFile(
      {
        contents: Cypress.Buffer.from(createTestPdf()),
        fileName: 'guide.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );
    cy.contains('.home-file-links a', 'guide.pdf').focus();
    cy.get('.home-file-links__preview .sd-file-previewer-pdf-toolbar', { timeout: 20000 }).should(
      'be.visible',
    );
    cy.get('.home-file-links__preview canvas').should('be.visible');
    cy.get('.home-file-links__preview').should(($preview) => {
      const box = $preview[0].getBoundingClientRect();
      expect(box.width / box.height).to.be.closeTo(210 / 297, 0.01);
    });
    cy.get('.sd-file-previewer-pdf-canvas-wrap').should(($wrap) => {
      expect($wrap[0].scrollWidth).to.be.at.most($wrap[0].clientWidth + 1);
      expect($wrap[0].scrollHeight).to.be.at.most($wrap[0].clientHeight + 1);
    });
    cy.get('.home-file-links__preview canvas').should(($canvas) =>
      expect(($canvas[0] as HTMLCanvasElement).width).to.be.greaterThan(0),
    );
    cy.get('.home-file-links__preview .sd-file-previewer-error').should('not.exist');
    cy.contains('.home-file-links a', 'guide.pdf').blur();
    cy.get('.home-file-links__preview').should('not.exist');
    cy.contains('.home-file-links a', 'guide.pdf').focus();
    cy.get('.home-file-links__preview .sd-file-previewer-pdf-toolbar', { timeout: 20000 }).should(
      'be.visible',
    );
    cy.get('.home-file-links__preview canvas').should('be.visible');
    cy.get('.home-file-links__preview').should(($preview) => {
      const box = $preview[0].getBoundingClientRect();
      expect(box.width / box.height).to.be.closeTo(210 / 297, 0.01);
    });
    cy.get('.sd-file-previewer-pdf-canvas-wrap').should(($wrap) => {
      expect($wrap[0].scrollWidth).to.be.at.most($wrap[0].clientWidth + 1);
      expect($wrap[0].scrollHeight).to.be.at.most($wrap[0].clientHeight + 1);
    });
    cy.get('.home-file-links__preview .sd-file-previewer-error').should('not.exist');
  });

  it('Markdown 使用渲染器，预览有背景', () => {
    cy.get('.home-workbench__file').selectFile(
      {
        contents: Cypress.Buffer.from('# Sender\n\n**文件预览**'),
        fileName: 'readme.md',
        mimeType: 'text/markdown',
      },
      { force: true },
    );
    cy.get('.home-workbench').scrollIntoView({ offset: { top: -340, left: 0 } });
    cy.contains('.home-file-links a', 'readme.md').focus();
    cy.get('.home-file-links__preview').should(
      'have.css',
      'background-color',
      'rgb(255, 255, 255)',
    );
    cy.get('.home-file-links__preview .sd-markdown-render h1').should('have.text', 'Sender');
    cy.get('.home-file-links__preview strong').should('have.text', '文件预览');
    cy.get('.home-file-links__preview').should(($preview) => {
      const box = $preview[0].getBoundingClientRect();
      expect(box.width / box.height).to.be.closeTo(210 / 297, 0.01);
    });
    cy.get('.home-file-links__preview').should('be.visible');
    cy.screenshot('workbench-markdown-preview', { capture: 'viewport' });
  });

  it('横图和竖图预览跟随原图比例，并限制在视口内', () => {
    cy.document().then((doc) => {
      const images = [
        [1200, 300],
        [300, 900],
      ].map(([width, height], index) => {
        const canvas = doc.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#165dff';
        context.fillRect(0, 0, width, height);
        return {
          contents: Cypress.Buffer.from(canvas.toDataURL().split(',')[1], 'base64'),
          fileName: `image-${index}.png`,
          mimeType: 'image/png',
        };
      });
      cy.get('.home-workbench__file').selectFile(images, { force: true });
    });
    cy.get('.home-workbench').scrollIntoView({ offset: { top: -340, left: 0 } });
    for (const [index, ratio] of [
      [0, 4],
      [1, 1 / 3],
    ]) {
      cy.contains('.home-file-links a', `image-${index}.png`).focus();
      cy.get('.home-file-links__preview--image').should(($preview) => {
        const rect = $preview[0].getBoundingClientRect();
        expect(rect.width / rect.height).to.be.closeTo(ratio, 0.03);
        expect(rect.width).to.be.at.most(640);
        const viewport = $preview[0].ownerDocument.defaultView!;
        expect(rect.height).to.be.at.most(viewport.innerHeight - 96);
        expect(rect.top).to.be.at.least(0);
        expect(rect.bottom).to.be.at.most(viewport.innerHeight);
        const image = $preview[0].querySelector('img')!;
        expect(image.naturalWidth).to.be.greaterThan(0);
        const imageRect = image.getBoundingClientRect();
        expect(imageRect.width / imageRect.height).to.be.closeTo(ratio, 0.03);
        // The outer border removes two pixels of content width; a tall image
        // loses proportionally more height while retaining its natural ratio.
        expect(Math.abs(imageRect.height - rect.height)).to.be.at.most(2 + 2 / ratio);
      });
      cy.screenshot(`workbench-image-${index}`, { capture: 'viewport' });
      cy.contains('.home-file-links a', `image-${index}.png`).blur();
      cy.get('.home-file-links__preview').should('not.exist');
    }
  });

  it('视频每次打开都从头自动播放，关闭后停止', () => {
    cy.get('.home-workbench__file').selectFile('cypress/fixtures/preview.webm', { force: true });
    let previous: HTMLVideoElement;
    cy.contains('.home-file-links a', 'preview.webm').focus();
    cy.get<HTMLVideoElement>('.home-file-links__preview video')
      .should(($video) => {
        expect($video[0].paused).to.equal(false);
        expect($video[0].currentTime).to.be.greaterThan(0.3);
      })
      .then(($video) => {
        previous = $video[0];
      });
    cy.contains('.home-file-links a', 'preview.webm').blur();
    cy.get('.home-file-links__preview').should('not.exist');
    cy.wrap(null).should(() => expect(previous.paused).to.equal(true));
    cy.contains('.home-file-links a', 'preview.webm').focus();
    cy.get<HTMLVideoElement>('.home-file-links__preview video').should(($video) => {
      expect($video[0]).not.to.equal(previous);
      expect($video[0].currentTime).to.be.lessThan(0.3);
    });
    cy.get<HTMLVideoElement>('.home-file-links__preview video').should(($video) => {
      expect($video[0].paused).to.equal(false);
      expect($video[0].currentTime).to.be.greaterThan(0.3);
    });
  });

  it('工具栏加号在菜单打开关闭后仍居中', () => {
    const checkCenter = () =>
      cy.get('.home-workbench').should(($workbench) => {
        const button = $workbench[0].querySelector('[aria-label="添加内容"]')!;
        const add = button.getBoundingClientRect();
        const icon = button.querySelector('svg')!.getBoundingClientRect();
        const send = $workbench[0]
          .querySelector('[aria-label="发送需求"]')!
          .getBoundingClientRect();
        expect(Math.abs(add.top + add.height / 2 - send.top - send.height / 2)).to.be.lessThan(1);
        expect(Math.abs(icon.top + icon.height / 2 - add.top - add.height / 2)).to.be.lessThan(1);
      });
    checkCenter();
    for (let cycle = 0; cycle < 2; cycle++) {
      cy.get('.home-workbench [aria-label="添加内容"]').click();
      cy.contains('[role="menuitem"]', '添加文件').should('be.visible');
      checkCenter();
      cy.contains('[role="menuitem"]', '添加组件库').click();
      checkCenter();
    }
  });

  it('完整输入区可发送，添加菜单可选择上下文', () => {
    cy.get('.home-workbench [data-rich-text-component-key="detail"] input')
      .should('have.attr', 'placeholder', '补充要求')
      .clear()
      .type('用 Sender 构建一个聊天界面');
    cy.get('.home-workbench [aria-label="发送需求"]').click();
    cy.get('.home-workbench__result').should('not.exist');
    cy.get('.home-workbench [aria-label="添加内容"]').click();
    cy.contains('[role="menuitem"]', '添加文件').should('be.visible');
    cy.contains('[role="menuitem"]', '添加组件库').should('be.visible');
    captureWorkbench('workbench-add-light');
    cy.contains('[role="menuitem"]', '添加技能').should('not.exist');
    cy.contains('[role="menuitem"]', '添加组件库').click();
    cy.get('.home-workbench .sd-sender').should('contain.text', 'SD Design');
  });

  it('Agent 分组菜单在明暗主题下完整显示', () => {
    cy.get('.home-workbench [aria-label="选择工作方式"]').click();
    cy.contains('[role="menuitem"]', 'React').should('have.attr', 'aria-disabled', 'true');
    cy.contains('[role="menuitem"]', 'Vue 3').should('be.visible');
    captureWorkbench('workbench-agent-light');
    cy.contains('[role="menuitem"]', 'Ask').click();
    cy.get('.home-workbench [aria-label="选择工作方式"]').should('contain.text', 'Ask');
    cy.get('starlight-theme-select select:visible').select('dark');
    cy.get('html').should('have.attr', 'data-sd-theme', 'dark');
    cy.get('.home-workbench [aria-label="选择工作方式"]').click();
    cy.contains('[role="menuitem"]', 'Vue 3').should('be.visible');
    captureWorkbench('workbench-agent-dark');
  });

  it('手机尺寸下工具栏和浮层没有横向溢出', () => {
    cy.viewport(390, 844);
    cy.get('.home-workbench').scrollIntoView({ offset: { top: -100, left: 0 } });
    cy.get('.home-workbench__suggestions').should('not.exist');
    cy.get('.home-workbench [contenteditable="true"]').should(
      'contain.text',
      'android-chrome-192x192.png',
    );
    cy.get('.home-workbench [aria-label="发送需求"]').should('be.visible');
    cy.get('.home-workbench [aria-label="选择工作方式"]').click();
    cy.contains('[role="menuitem"]', 'React').should('be.visible');
    cy.document().should((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    captureWorkbench('workbench-mobile');
  });
});
