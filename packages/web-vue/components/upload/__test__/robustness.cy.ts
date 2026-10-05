import { defineComponent, h, ref } from 'vue';

import type { FileItem, RequestOption } from '../interfaces';

import Upload from '../index';
import { loopDirectory } from '../utils';

const files: FileItem[] = [
  { uid: 'one', name: 'One.txt' },
  { uid: 'two', name: 'Two.txt' },
];

describe('Upload robustness', () => {
  it('preserves custom row state by file UID after removal', () => {
    const Row = defineComponent({
      props: { fileItem: { type: Object, required: true } },
      setup(props) {
        const initialUid = props.fileItem.uid;
        return () => h('div', { class: 'custom-row' }, `${props.fileItem.name}|${initialUid}`);
      },
    });
    const list = ref(files);
    cy.mount({
      setup: () => () =>
        h(
          Upload,
          { fileList: list.value },
          { 'upload-item': ({ fileItem }: { fileItem: FileItem }) => h(Row, { fileItem }) },
        ),
    });
    cy.get('.custom-row').last().should('have.text', 'Two.txt|two');
    cy.then(() => {
      list.value = [files[1]];
    });
    cy.get('.custom-row').should('have.length', 1).and('have.text', 'Two.txt|two');
  });

  it('passes fileItem to the picture-card extra-button slot', () => {
    cy.mount(Upload, {
      props: { listType: 'picture-card', defaultFileList: [files[0]] },
      slots: {
        'extra-button': ({ fileItem }: { fileItem?: FileItem }) =>
          h('span', { class: 'extra' }, fileItem?.name ?? 'Missing'),
      },
    });
    cy.get('.extra').should('have.text', 'One.txt');
  });

  for (const status of ['init', 'error'] as const) {
    it(`does not render a cancel action for ${status} without its start/retry action`, () => {
      cy.mount(Upload, {
        props: {
          defaultFileList: [{ ...files[0], status }],
          showStartButton: false,
          showRetryButton: false,
        },
      });
      cy.get('.sd-upload-icon-cancel').should('not.exist');
    });
  }

  it('finishes cancellation even when custom abort throws', () => {
    let option!: RequestOption;
    cy.mount(Upload, {
      props: {
        customRequest: (request: RequestOption) => {
          option = request;
          return {
            abort: () => {
              throw new Error('abort failed');
            },
          };
        },
      },
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file'), fileName: 'One.txt' },
      { force: true },
    );
    cy.get('@vue').then(({ wrapper }) => {
      expect(() => wrapper.vm.abort(option.fileItem)).not.to.throw();
      expect(wrapper.emitted('error')).to.have.length(1);
      option.onSuccess('late');
      expect(wrapper.emitted('success')).to.equal(undefined);
    });
    cy.get('.sd-upload-list-item-error').should('exist');
  });

  for (const errorType of ['file', 'directory'] as const) {
    it(`finishes a directory traversal after an entry ${errorType} read fails`, () => {
      cy.then(
        () =>
          new Promise<void>((resolve) => {
            const good = {
              isFile: true,
              fullPath: '/Good.txt',
              file: (done: (file: File) => void) =>
                setTimeout(() => done(new File(['file'], 'Good.txt')), 0),
            };
            const bad =
              errorType === 'file'
                ? {
                    isFile: true,
                    file: (_done: unknown, fail?: (error: Error) => void) =>
                      setTimeout(() => fail?.(new Error('missing file')), 0),
                  }
                : {
                    isDirectory: true,
                    createReader: () => ({
                      readEntries: (_done: unknown, fail?: (error: Error) => void) =>
                        setTimeout(() => fail?.(new Error('unreadable directory')), 0),
                    }),
                  };
            const received: string[][] = [];
            loopDirectory(
              [good, bad].map((entry) => ({
                webkitGetAsEntry: () => entry,
              })) as unknown as DataTransferItemList,
              undefined,
              (result) => {
                received.push(result.map((file) => file.name));
              },
            );
            setTimeout(() => {
              expect(received).to.deep.equal([['Good.txt']]);
              resolve();
            }, 50);
          }),
      );
    });
  }

  it('calls directory completion once for null entries mixed with files', () => {
    cy.then(
      () =>
        new Promise<void>((resolve) => {
          const received: string[][] = [];
          loopDirectory(
            [
              { webkitGetAsEntry: () => null },
              {
                webkitGetAsEntry: () => ({
                  isFile: true,
                  fullPath: '/Good.txt',
                  file: (done: (file: File) => void) =>
                    setTimeout(() => done(new File(['file'], 'Good.txt')), 0),
                }),
              },
            ] as unknown as DataTransferItemList,
            undefined,
            (result) => {
              received.push(result.map((file) => file.name));
            },
          );
          setTimeout(() => {
            expect(received).to.deep.equal([['Good.txt']]);
            resolve();
          }, 50);
        }),
    );
  });
  for (const [slot, listType] of [
    ['file-name', 'text'],
    ['file-icon', 'text'],
    ['image', 'picture'],
    ['image', 'picture-card'],
  ] as const) {
    it(`passes camelCase fileItem to ${slot} in ${listType}`, () => {
      cy.mount(Upload, {
        props: { listType, defaultFileList: [files[0]] },
        slots: {
          [slot]: ({ fileItem }: { fileItem?: FileItem }) =>
            h('span', { class: 'slot-value' }, fileItem?.name ?? 'Missing'),
        },
      });
      cy.get('.slot-value').should('have.text', 'One.txt');
    });
  }

  for (const slot of ['file-name', 'upload-button']) {
    it(`renders a ${slot} slot added after mounting`, () => {
      const shown = ref(false);
      cy.mount({
        setup: () => () =>
          h(
            Upload,
            { defaultFileList: [files[0]] },
            shown.value
              ? {
                  [slot]: () => h('span', { class: 'added-slot' }, 'Added'),
                }
              : {},
          ),
      });
      cy.get('.added-slot').should('not.exist');
      cy.then(() => {
        shown.value = true;
      });
      cy.get('.added-slot').should('have.text', 'Added');
    });
  }
  it('avoids generated UIDs that already belong to caller-supplied files', () => {
    cy.mount(Upload, {
      props: { autoUpload: false, defaultFileList: [{ uid: '1234-0', name: 'Existing.txt' }] },
    });
    cy.window().then((win) => {
      cy.get('@vue').then(({ wrapper }) => {
        const now = Date.now;
        const windowNow = win.Date.now;
        try {
          Date.now = () => 1234;
          win.Date.now = () => 1234;
          wrapper.vm.upload([new File(['file'], 'New.txt')]);
        } finally {
          Date.now = now;
          win.Date.now = windowNow;
        }
        const list = wrapper.emitted('update:fileList')?.at(-1)?.[0] as FileItem[];
        expect(list[1].uid).to.match(/^1234-/);
        expect(new Set(list.map((file) => file.uid)).size).to.equal(2);
      });
    });
  });

  for (const synchronous of [true, false]) {
    it(`ends a failed response URL mapping safely, synchronous=${synchronous}`, () => {
      const key = `mapper-${crypto.randomUUID()}`;
      let option!: RequestOption;
      cy.mount(Upload, {
        props: {
          lockKey: synchronous ? undefined : key,
          responseUrlKey: () => {
            throw new Error('URL mapping failed');
          },
          customRequest: (request: RequestOption) => {
            option = request;
            if (synchronous) request.onSuccess({});
            return {};
          },
        },
      });
      cy.get('input[type=file]').selectFile(
        { contents: Cypress.Buffer.from('file'), fileName: 'File.txt' },
        { force: true },
      );
      cy.get('@vue').should(() => expect(option).not.to.equal(undefined));
      cy.get('@vue').then(({ wrapper }) => {
        if (!synchronous) expect(() => option.onSuccess({})).not.to.throw();
        expect(wrapper.emitted('error')).to.have.length(1);
        expect(wrapper.emitted('success')).to.equal(undefined);
      });
      cy.get('.sd-upload-list-item-error').should('exist');
      if (!synchronous)
        cy.window().then((win) =>
          win.navigator.locks.request(`sd-upload:${key}`, { ifAvailable: true }, (lock) => {
            expect(lock).not.to.equal(null);
          }),
        );
    });
  }

  it('does not publish success when a URL mapper cancels its upload', () => {
    let option!: RequestOption;
    let cancel!: (file: FileItem) => void;
    cy.mount(Upload, {
      props: {
        responseUrlKey: (file: FileItem) => {
          cancel(file);
          return '/cancelled.txt';
        },
        customRequest: (request: RequestOption) => {
          option = request;
          return {};
        },
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      cancel = (file) => wrapper.vm.abort(file);
    });
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from('file'), fileName: 'File.txt' },
      { force: true },
    );
    cy.get('@vue').then(({ wrapper }) => {
      option.onSuccess({});
      expect(wrapper.emitted('error')).to.have.length(1);
      expect(wrapper.emitted('success')).to.equal(undefined);
      expect(option.fileItem.url).to.equal(undefined);
    });
  });
});
