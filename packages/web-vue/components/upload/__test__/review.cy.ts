import type { FileItem, RequestOption } from '../interfaces';

import Upload from '../index';
import { loopDirectory } from '../utils';

const selectImage = () =>
  cy
    .get('input[type=file]')
    .selectFile(
      { contents: Cypress.Buffer.from('image'), fileName: 'image.png', mimeType: 'image/png' },
      { force: true },
    );

describe('Upload reviewed boundaries', () => {
  it('collects every directory batch before calling upload once', () => {
    cy.then(
      () =>
        new Promise<void>((resolve) => {
          const calls: string[][] = [];
          let batch = 0;
          const entry = (name: string) => ({
            isFile: true,
            fullPath: `/folder/${name}`,
            file: (done: (file: File) => void) =>
              setTimeout(() => done(new File(['text'], name)), 0),
          });
          const directory = {
            isDirectory: true,
            createReader: () => ({
              readEntries: (done: (entries: unknown[]) => void) => {
                const entries =
                  batch++ === 0 ? [entry('first.txt')] : batch === 2 ? [entry('second.txt')] : [];
                setTimeout(() => done(entries), 10);
              },
            }),
          };
          loopDirectory(
            [{ webkitGetAsEntry: () => directory }] as unknown as DataTransferItemList,
            undefined,
            (files) => calls.push(files.map((file) => file.name)),
          );
          setTimeout(() => {
            expect(calls).to.deep.equal([['first.txt', 'second.txt']]);
            resolve();
          }, 100);
        }),
    );
  });

  it('does not remove a text-list file while disabled', () => {
    cy.mount(Upload, {
      props: { disabled: true, defaultFileList: [{ uid: 'existing', name: 'file.txt' }] },
    });
    cy.get('.sd-upload-list-item-operation [role=button]').click();
    cy.get('.sd-upload-list-item').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('change')).to.equal(undefined));
  });

  for (const status of ['init', 'error'] as const) {
    it(`does not start a ${status} file from the disabled list`, () => {
      const customRequest = cy.stub().returns({}).as('request');
      cy.mount(Upload, {
        props: {
          disabled: true,
          customRequest,
          defaultFileList: [
            { uid: 'existing', name: 'file.txt', status, file: new File(['text'], 'file.txt') },
          ],
        },
      });
      cy.get(status === 'init' ? '.sd-upload-icon-start' : '.sd-upload-icon-upload').click();
      cy.get('@request').should('not.have.been.called');
    });
  }

  for (const end of ['remove', 'controlled', 'unmount', 'response'] as const) {
    it(`releases its own image preview URL on ${end}`, () => {
      let request: RequestOption;
      let previewUrl: string;
      cy.window().then((win) => cy.spy(win.URL, 'revokeObjectURL').as('revoke'));
      cy.mount(Upload, {
        props: {
          autoUpload: end === 'response',
          responseUrlKey: 'url',
          customRequest: (option: RequestOption) => {
            request = option;
            return {};
          },
        },
      });
      selectImage();
      cy.get('@vue').then(({ wrapper }) => {
        const files = wrapper.emitted('update:fileList')?.at(-1)?.[0] as FileItem[];
        previewUrl = files[0].url!;
        expect(previewUrl).to.match(/^blob:/);
        if (end === 'controlled') return wrapper.setProps({ fileList: [] });
        if (end === 'unmount') wrapper.unmount();
        if (end === 'response') request.onSuccess({ url: '/uploaded-image.png' });
      });
      if (end === 'remove') cy.get('.sd-upload-list-item-operation [role=button]').click();
      cy.get('@revoke').should((spy: ReturnType<typeof cy.spy>) =>
        expect(spy.calledWith(previewUrl)).to.equal(true),
      );
    });
  }

  it('preserves a preview URL supplied by the caller on unmount', () => {
    let url: string;
    cy.window().then((win) => {
      url = win.URL.createObjectURL(new Blob(['image']));
      cy.spy(win.URL, 'revokeObjectURL').as('revoke');
    });
    cy.then(() =>
      cy.mount(Upload, {
        props: { defaultFileList: [{ uid: 'external', name: 'external.png', url }] },
      }),
    );
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@revoke').should((spy: ReturnType<typeof cy.spy>) =>
      expect(spy.calledWith(url)).to.equal(false),
    );
    cy.window().then((win) => win.URL.revokeObjectURL(url));
  });
});
