import { flushPromises } from '@vue/test-utils';

import type { FileItem, RequestOption } from '../interfaces';

import Upload from '../index';

const select = (fileName = 'a.txt') =>
  cy
    .get('input[type=file]')
    .selectFile({ contents: Cypress.Buffer.from('content'), fileName }, { force: true });

describe('Upload race conditions', () => {
  it('keeps independent files parallel and accepts controlled list feedback', () => {
    const requests: RequestOption[] = [];
    cy.mount(Upload, {
      props: {
        customRequest: (option: RequestOption) => {
          requests.push(option);
          return {};
        },
      },
    });
    select();
    select('b.txt');
    cy.get('@vue').then(async ({ wrapper }) => {
      expect(requests).to.have.length(2);
      const files = wrapper.emitted('update:fileList')?.at(-1)?.[0] as FileItem[];
      await wrapper.setProps({ fileList: files.map((file) => ({ ...file })) });
      requests[1].onSuccess('second');
      requests[0].onSuccess('first');
      expect(wrapper.emitted('success')).to.have.length(2);
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 2);
  });

  it('releases reserved slots when validation rejects', () => {
    let reject!: (error: Error) => void;
    cy.mount(Upload, {
      props: {
        limit: 1,
        autoUpload: false,
        onBeforeUpload: () =>
          new Promise<boolean>((_resolve, fail) => {
            reject = fail;
          }),
      },
    });
    select();
    cy.get('@vue').then(async ({ wrapper }) => {
      reject(new Error('validation rejected'));
      await flushPromises();
      await wrapper.setProps({ onBeforeUpload: () => true });
    });
    select('b.txt');
    cy.get('.sd-upload-list-item').should('have.length', 1).and('contain.text', 'b.txt');
  });

  it('reserves limit slots while beforeUpload is pending', () => {
    let resolve!: (allowed: boolean) => void;
    cy.mount(Upload, {
      props: {
        limit: 1,
        autoUpload: false,
        onBeforeUpload: () =>
          new Promise<boolean>((done) => {
            resolve = done;
          }),
      },
    });
    select();
    select('b.txt');
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('exceedLimit')).to.have.length(1);
      resolve(true);
    });
    cy.get('.sd-upload-list-item').should('have.length', 1).and('contain.text', 'a.txt');
  });

  it('ignores duplicate submit and callbacks from a cancelled request after retry', () => {
    const requests: RequestOption[] = [];
    cy.mount(Upload, {
      props: {
        customRequest: (option: RequestOption) => {
          requests.push(option);
          return { abort: () => option.onError('abort callback') };
        },
      },
    });
    select();
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.submit(requests[0].fileItem);
      expect(requests).to.have.length(1);
    });
    cy.get('.sd-upload-icon-cancel').click();
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('error')).to.have.length(1);
    });
    cy.get('.sd-upload-icon-upload').click();
    cy.then(() => {
      requests[1].onProgress(0.6);
      requests[0].onProgress(0.1);
      requests[0].onSuccess('old');
      requests[0].onError('old');
    });
    cy.get('@vue').then(({ wrapper }) => {
      expect(wrapper.emitted('success')).to.equal(undefined);
      const files = wrapper.emitted('update:fileList')?.at(-1)?.[0] as FileItem[];
      expect(files[0].status).to.equal('uploading');
      expect(files[0].percent).to.equal(0.6);
      requests[1].onSuccess('new');
      requests[1].onProgress(0.2);
      requests[1].onError('late');
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
  });

  it('does not retain a request that completes synchronously', () => {
    const abort = Cypress.sinon.spy();
    cy.mount(Upload, {
      props: {
        customRequest: (option: RequestOption) => {
          option.onSuccess('ok');
          return { abort };
        },
      },
    });
    select();
    cy.get('@vue').then(({ wrapper }) => {
      const file = wrapper.emitted('success')?.[0]?.[0] as FileItem;
      wrapper.vm.abort(file);
      expect(abort.callCount).to.equal(0);
      expect(wrapper.emitted('error')).to.equal(undefined);
    });
    cy.get('.sd-upload-list-item-done').should('have.length', 1);
  });

  for (const mode of ['remove', 'controlled', 'unmount'] as const) {
    it(`invalidates requests on ${mode}`, () => {
      let request!: RequestOption;
      const abort = Cypress.sinon.spy();
      cy.mount(Upload, {
        props: {
          customRequest: (option: RequestOption) => {
            request = option;
            return { abort };
          },
        },
      });
      select();
      if (mode === 'remove') cy.get('.sd-upload-list-item-operation [role=button]').click();
      cy.get('@vue').then(async ({ wrapper }) => {
        if (mode === 'controlled') await wrapper.setProps({ fileList: [] });
        if (mode === 'unmount') wrapper.unmount();
        expect(abort.callCount).to.equal(1);
        request.onSuccess('late');
        request.onError('late');
        request.onProgress(0.5);
        expect(wrapper.emitted('success')).to.equal(undefined);
        expect(wrapper.emitted('error')).to.equal(undefined);
        expect(wrapper.emitted('progress')).to.equal(undefined);
      });
    });
  }

  it('does not upload when beforeUpload resolves after unmount', () => {
    let resolve!: (allowed: boolean) => void;
    const request = Cypress.sinon.spy(() => ({}));
    cy.mount(Upload, {
      props: {
        customRequest: request,
        onBeforeUpload: () =>
          new Promise<boolean>((done) => {
            resolve = done;
          }),
      },
    });
    select();
    cy.get('@vue').then(async ({ wrapper }) => {
      wrapper.unmount();
      resolve(true);
      await flushPromises();
    });
    cy.then(() => {
      expect(request.callCount).to.equal(0);
    });
  });
});
