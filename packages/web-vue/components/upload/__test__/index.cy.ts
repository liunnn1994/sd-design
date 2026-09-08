import type { FileItem, RequestOption } from '../interfaces';

import Upload from '../index';

describe('Upload', () => {
  it('renders transition list items with an element root', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });
    cy.mount(Upload, {
      props: {
        listType: 'picture-card',
        defaultFileList: [
          { uid: '1', name: 'done.png', status: 'done', url: 'data:image/svg+xml,%3Csvg/%3E' },
          { uid: '2', name: 'failed.png', status: 'error' },
        ],
      },
    });
    cy.get('.sd-upload-list-picture').should('have.length', 2);
    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('Component inside <Transition> renders non-element root node'),
      );
    });
  });

  it('renders the default upload button when no upload-button slot is provided', () => {
    cy.mount(Upload);

    cy.get('.sd-upload button').should('contain.text', '点击上传');
  });

  it('forwards root attributes without leaking the reusable-template binding', () => {
    cy.mount(Upload, {
      props: {
        showFileList: false,
        class: 'avatar-upload',
      },
      slots: {
        'upload-button': '<div class="custom-upload-button">Upload</div>',
      },
    });

    cy.get('.sd-upload').should('have.class', 'avatar-upload');
    cy.get('.sd-upload').should('not.have.attr', 'root-attrs');
    cy.get('.sd-upload .custom-upload-button').should('be.visible');
  });

  it('renders an accessible remove button for a listed file', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'demo.png', status: 'done', url: 'data:image/svg+xml,%3Csvg/%3E' },
        ],
      },
    });
    cy.get('.sd-upload-list-item-operation [role="button"]').should(
      'have.attr',
      'aria-label',
      '移除',
    );
    cy.get('.sd-upload-list-item-operation [role="button"]').should('have.attr', 'tabindex', '0');
  });

  it('supports hiding the start action', () => {
    cy.mount(Upload, {
      props: {
        autoUpload: false,
        defaultFileList: [{ uid: '1', name: 'demo.txt', status: 'init' }],
        showStartButton: false,
      },
    });

    cy.get('.sd-upload-icon-start').should('not.exist');
  });

  it('supports hiding every list action', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'pending.txt', status: 'init' },
          { uid: '2', name: 'failed.txt', status: 'error' },
          { uid: '3', name: 'uploading.txt', status: 'uploading' },
          { uid: '4', name: 'done.txt', status: 'done' },
        ],
        showUploadButton: false,
        showStartButton: false,
        showRetryButton: false,
        showCancelButton: false,
        showRemoveButton: false,
      },
    });

    cy.get('.sd-upload').should('not.exist');
    cy.get('.sd-upload-icon-start').should('not.exist');
    cy.get('.sd-upload-icon-upload').should('not.exist');
    cy.get('.sd-upload-icon-cancel').should('not.exist');
    cy.get('.sd-upload-list-item-operation').should('not.exist');
  });

  it('supports hiding every picture-card action without hiding status indicators', () => {
    cy.mount(Upload, {
      props: {
        listType: 'picture-card',
        defaultFileList: [
          { uid: '1', name: 'pending.png', status: 'init' },
          { uid: '2', name: 'failed.png', status: 'error' },
          { uid: '3', name: 'done.png', status: 'done' },
        ],
        showUploadButton: false,
        showStartButton: false,
        showRetryButton: false,
        showPreviewButton: false,
        showRemoveButton: false,
      },
    });

    cy.get('.sd-upload-icon-start').should('not.exist');
    cy.get('.sd-upload-icon-upload').should('not.exist');
    cy.get('.sd-upload-icon-preview').should('not.exist');
    cy.get('.sd-upload-icon-remove').should('not.exist');
    cy.get('.sd-upload-icon-error').should('exist');
  });

  it('uploads through customRequest and emits progress, success, change and update:fileList', () => {
    let requestOption: RequestOption | undefined;
    cy.mount(Upload, {
      props: {
        customRequest: (option: RequestOption) => {
          requestOption = option;
          return {};
        },
      },
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file content'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.get('@vue').should(() => {
      expect(requestOption).to.not.equal(undefined);
    });
    cy.get('@vue').then(() => {
      requestOption?.onProgress(0.5);
    });
    cy.get('@vue')
      .should(({ wrapper }) => {
        expect(wrapper.emitted('progress')).to.have.length(1);
        const fileItem = (wrapper.emitted('progress')?.[0]?.[0] ?? {}) as FileItem;
        expect(fileItem.status).to.equal('uploading');
        expect(fileItem.percent).to.equal(0.5);
      })
      .then(() => {
        requestOption?.onSuccess({ ok: true });
      });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('success')).to.have.length(1);
      const fileItem = (wrapper.emitted('success')?.[0]?.[0] ?? {}) as FileItem;
      expect(fileItem.status).to.equal('done');
      expect(fileItem.response).to.deep.equal({ ok: true });
      expect(wrapper.emitted('change')?.length).to.be.at.least(3);
      expect(wrapper.emitted('update:fileList')?.length).to.be.at.least(3);
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
    cy.get('.sd-upload-list-item').should('contain.text', 'a.txt');
  });

  it('uploads through the default XHR request with headers and maps the response url', () => {
    cy.intercept('POST', '/upload', {
      statusCode: 200,
      body: { url: 'https://example.com/a.txt' },
    }).as('upload');
    cy.mount(Upload, {
      props: {
        action: '/upload',
        headers: { 'X-Custom-Header': 'yes' },
        responseUrlKey: 'url',
      },
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file content'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.wait('@upload').then((interception) => {
      const headers = Object.fromEntries(
        Object.entries(interception.request.headers).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
      expect(headers['x-custom-header']).to.equal('yes');
      expect(String(headers['content-type'])).to.include('multipart/form-data');
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('success')).to.have.length(1);
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
    cy.get('.sd-upload-list-item-name-link')
      .should('have.attr', 'href', 'https://example.com/a.txt')
      .should('not.have.attr', 'download');
  });

  it('marks failed uploads as errored and supports retrying them', () => {
    cy.intercept('POST', '/upload', { statusCode: 500, body: 'server error' }).as('uploadFail');
    cy.mount(Upload, { props: { action: '/upload' } });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file content'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.wait('@uploadFail');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('error')).to.have.length(1);
    });
    cy.get('.sd-upload-list-item-error').should('have.length', 1);
    cy.intercept('POST', '/upload', { statusCode: 200, body: 'ok' }).as('uploadRetry');
    cy.get('.sd-upload-icon-upload').click();
    cy.wait('@uploadRetry');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('success')).to.have.length(1);
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
  });

  it('emits exceedLimit when the limit is reached and hides the upload button', () => {
    cy.mount(Upload, { props: { limit: 1, autoUpload: false } });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('one'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('.sd-upload-hide').should('exist');
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('two'), fileName: 'b.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('exceedLimit')).to.have.length(1);
      const files = (wrapper.emitted('exceedLimit')?.[0]?.[1] ?? []) as File[];
      expect(files).to.have.length(1);
      expect(files[0].name).to.equal('b.txt');
    });
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ showUploadButton: { showOnExceedLimit: true } }),
    );
    cy.get('.sd-upload-hide').should('not.exist');
  });

  it('rejects the whole selection when it would exceed the limit', () => {
    cy.mount(Upload, {
      props: {
        limit: 2,
        autoUpload: false,
        defaultFileList: [{ uid: '1', name: 'existing.txt', status: 'done' }],
      },
    });
    cy.get('input[type=file]').selectFile(
      [
        { contents: Cypress.Buffer.from('one'), fileName: 'a.txt', mimeType: 'text/plain' },
        { contents: Cypress.Buffer.from('two'), fileName: 'b.txt', mimeType: 'text/plain' },
      ],
      { force: true },
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('exceedLimit')).to.have.length(1);
      const files = (wrapper.emitted('exceedLimit')?.[0]?.[1] ?? []) as File[];
      expect(files).to.have.length(2);
    });
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('.sd-upload-list-item').should('contain.text', 'existing.txt');
  });

  it('honors onBeforeUpload rejection and file transformation', () => {
    cy.mount(Upload, {
      props: {
        autoUpload: false,
        onBeforeUpload: (file: File) =>
          file.name === 'ok.txt' ? new File(['transformed'], 'renamed.txt') : false,
      },
    });
    cy.get('input[type=file]').selectFile(
      [
        { contents: Cypress.Buffer.from('bad'), fileName: 'bad.txt', mimeType: 'text/plain' },
        { contents: Cypress.Buffer.from('ok'), fileName: 'ok.txt', mimeType: 'text/plain' },
      ],
      { force: true },
    );
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('.sd-upload-list-item').should('contain.text', 'renamed.txt');
  });

  it('blocks removal while onBeforeRemove resolves false and removes once it allows', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [{ uid: '1', name: 'a.txt', status: 'done' }],
        onBeforeRemove: () => Promise.resolve(false),
      },
    });
    cy.get('.sd-upload-list-item-operation [role="button"]').click();
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ onBeforeRemove: () => Promise.resolve(true) }),
    );
    cy.get('.sd-upload-list-item-operation [role="button"]').click();
    cy.get('.sd-upload-list-item').should('have.length', 0);
    cy.get('@vue').should(({ wrapper }) => {
      const fileList = (wrapper.emitted('update:fileList')?.at(-1)?.[0] ?? []) as FileItem[];
      expect(fileList).to.have.length(0);
    });
  });

  it('aborts an in-flight upload from the cancel action', () => {
    let aborted = false;
    cy.mount(Upload, {
      props: {
        customRequest: () => ({
          abort: () => {
            aborted = true;
          },
        }),
      },
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file content'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-uploading').should('have.length', 1);
    cy.get('.sd-upload-icon-cancel').click();
    cy.get('.sd-upload-list-item-error').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(aborted).to.equal(true);
      // 取消上传后消费方应收到 error 事件
      expect(wrapper.emitted('error')).to.have.length(1);
      const fileItem = (wrapper.emitted('error')?.[0]?.[0] ?? {}) as FileItem;
      expect(fileItem.name).to.equal('a.txt');
      expect(fileItem.status).to.equal('error');
    });
  });

  it('assigns unique uids to files selected in the same batch', () => {
    cy.mount(Upload, { props: { multiple: true, autoUpload: false } });
    cy.get('input[type=file]').selectFile(
      [
        { contents: Cypress.Buffer.from('one'), fileName: 'a.txt', mimeType: 'text/plain' },
        { contents: Cypress.Buffer.from('two'), fileName: 'b.txt', mimeType: 'text/plain' },
      ],
      { force: true },
    );
    cy.get('@vue').should(({ wrapper }) => {
      const fileList = (wrapper.emitted('update:fileList')?.at(-1)?.[0] ?? []) as FileItem[];
      expect(fileList).to.have.length(2);
      const uids = fileList.map((item) => item.uid);
      expect(new Set(uids).size).to.equal(2);
    });
  });

  it('supports manual start when autoUpload is disabled', () => {
    cy.mount(Upload, {
      props: {
        autoUpload: false,
        customRequest: (option: RequestOption) => {
          option.onSuccess('ok');
          return {};
        },
      },
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file content'), fileName: 'a.txt', mimeType: 'text/plain' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-init').should('have.length', 1);
    cy.get('.sd-upload-icon-start').click();
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('success')).to.have.length(1);
    });
  });

  it('supports onButtonClick to supply files programmatically', () => {
    const files = [new File(['x'], 'from-button.txt', { type: 'text/plain' })];
    cy.mount(Upload, {
      props: {
        showFileList: false,
        autoUpload: false,
        onButtonClick: () => Promise.resolve(files as unknown as FileList),
      },
    });
    cy.get('.sd-upload').click();
    cy.get('@vue').should(({ wrapper }) => {
      const fileList = (wrapper.emitted('update:fileList')?.at(-1)?.[0] ?? []) as FileItem[];
      expect(fileList).to.have.length(1);
      expect(fileList[0].name).to.equal('from-button.txt');
    });
  });

  it('emits preview when clicking a file name rendered without a link', () => {
    cy.mount(Upload, {
      props: { defaultFileList: [{ uid: '1', name: 'a.txt', status: 'done' }] },
    });
    cy.get('.sd-upload-list-item-name-text').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('preview')).to.have.length(1);
      const fileItem = (wrapper.emitted('preview')?.[0]?.[0] ?? {}) as FileItem;
      expect(fileItem.name).to.equal('a.txt');
    });
  });

  it('renders a download link only when showLink and download are enabled', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'a.txt', status: 'done', url: 'https://example.com/a.txt' },
        ],
      },
    });
    cy.get('.sd-upload-list-item-name-link').should(
      'have.attr',
      'href',
      'https://example.com/a.txt',
    );
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ download: true }));
    cy.get('.sd-upload-list-item-name-link').should('have.attr', 'download', 'a.txt');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ showLink: false }));
    cy.get('.sd-upload-list-item-name-link').should('not.exist');
  });

  it('sets the accept attribute on the file input', () => {
    // accept 的文件过滤由浏览器原生对话框完成，selectFile 会绕过它
    cy.mount(Upload, { props: { accept: '.txt' } });
    cy.get('input[type=file]').should('have.attr', 'accept', '.txt');
  });

  it('accepts multiple selected files and switches the input to directory mode', () => {
    cy.mount(Upload, { props: { multiple: true, autoUpload: false } });
    cy.get('input[type=file]').selectFile(
      [
        { contents: Cypress.Buffer.from('one'), fileName: 'a.txt', mimeType: 'text/plain' },
        { contents: Cypress.Buffer.from('two'), fileName: 'b.txt', mimeType: 'text/plain' },
      ],
      { force: true },
    );
    cy.get('.sd-upload-list-item').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ directory: true }));
    cy.get('input[type=file]').should('have.attr', 'webkitdirectory');
  });

  it('adds dropped files and ignores drops while disabled', () => {
    cy.mount(Upload, { props: { draggable: true, autoUpload: false } });
    const drop = (name: string) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File([name], name, { type: 'text/plain' }));
      cy.get('.sd-upload').trigger('drop', { dataTransfer });
    };
    drop('dropped-a.txt');
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('.sd-upload-list-item').should('contain.text', 'dropped-a.txt');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
    drop('dropped-b.txt');
    cy.get('.sd-upload-list-item').should('have.length', 1);
  });

  it('supports keyboard activation of the remove action', () => {
    cy.mount(Upload, {
      props: { defaultFileList: [{ uid: '1', name: 'a.txt', status: 'done' }] },
    });
    cy.get('.sd-upload-list-item-operation [role="button"]').focus().type('{enter}');
    cy.get('.sd-upload-list-item').should('have.length', 0);
    cy.get('@vue').should(({ wrapper }) => {
      const fileList = (wrapper.emitted('update:fileList')?.at(-1)?.[0] ?? []) as FileItem[];
      expect(fileList).to.have.length(0);
    });
  });

  it('renders the upload-item slot for each file', () => {
    cy.mount(Upload, {
      props: {
        defaultFileList: [
          { uid: '1', name: 'a.txt', status: 'done' },
          { uid: '2', name: 'b.txt', status: 'error' },
        ],
      },
      slots: {
        'upload-item':
          '<template #upload-item="{ fileItem, index }"><div class="custom-item">{{ index }}: {{ fileItem.name }}</div></template>',
      },
    });
    cy.get('.custom-item').should('have.length', 2);
    cy.get('.custom-item').first().should('contain.text', '0: a.txt');
    cy.get('.custom-item').last().should('contain.text', '1: b.txt');
  });

  it('renders picture thumbnails with the configured imageLoading', () => {
    cy.mount(Upload, {
      props: {
        listType: 'picture',
        imageLoading: 'lazy',
        defaultFileList: [
          { uid: '1', name: 'a.png', status: 'done', url: 'data:image/svg+xml,%3Csvg/%3E' },
        ],
      },
    });
    cy.get('.sd-upload-list-item-thumbnail img').should('have.attr', 'loading', 'lazy');
  });

  it('renders the picture-card button with its tip', () => {
    cy.mount(Upload, { props: { listType: 'picture-card', tip: '上传图片' } });
    cy.get('.sd-upload-picture-card-text').should('exist');
    cy.get('.sd-upload-tip').should('contain.text', '上传图片');
  });

  it('exposes programmatic upload and submit control', () => {
    cy.intercept('POST', '/upload', { statusCode: 200, body: 'ok' }).as('upload');
    cy.mount(Upload, { props: { autoUpload: false, action: '/upload' } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as { upload: (files: File[]) => void }).upload([
        new File(['manual'], 'manual.txt', { type: 'text/plain' }),
      ]);
    });
    cy.get('.sd-upload-list-item-init').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as { submit: () => void }).submit();
    });
    cy.wait('@upload');
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
  });
});
