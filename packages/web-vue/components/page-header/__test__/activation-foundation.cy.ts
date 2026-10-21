import { defineComponent, h, provide, reactive, shallowRef } from 'vue';

import type { FileItem } from '../../upload/interfaces';

import Arrow from '../../carousel/carousel-arrow.vue';
import { uploadInjectionKey, type UploadContext } from '../../upload/context';
import UploadPictureItem from '../../upload/upload-picture-item.vue';
import UploadProgress from '../../upload/upload-progress.vue';
import PageHeader from '../index';

describe('Shared keyboard activation adapters', () => {
  it('preserves an explicitly empty parent PictureItem action slot', () => {
    const file: FileItem = { uid: 'empty', name: 'empty.png', status: 'done' };
    const context: UploadContext = {
      slots: {},
      iconCls: 'empty-icon',
      showRemoveButton: true,
      onUpload() {},
      onAbort() {},
      onRemove() {},
      onPreview() {},
    };
    cy.mount(
      defineComponent({
        setup() {
          provide(uploadInjectionKey, context);
          return () => h(UploadPictureItem, { file }, { default: () => [] });
        },
      }),
    );
    cy.get('.empty-icon-remove').should('exist').find('svg').should('not.exist');
  });
  it('keeps the parent default slot as the PictureItem action override', () => {
    const file: FileItem = { uid: 'custom', name: 'custom.png', status: 'done' };
    const remove = cy.spy();
    const context: UploadContext = {
      slots: {},
      iconCls: 'custom-icon',
      showRemoveButton: true,
      onUpload() {},
      onAbort() {},
      onRemove: remove,
      onPreview() {},
    };
    cy.mount(
      defineComponent({
        setup() {
          provide(uploadInjectionKey, context);
          return () =>
            h(
              UploadPictureItem,
              { file },
              { default: () => h('b', { class: 'parent-action' }, 'Remove') },
            );
        },
      }),
    );
    cy.get('.custom-icon-remove .parent-action').should('have.text', 'Remove');
    cy.get('.custom-icon-remove .sd-icon-delete').should('not.exist');
    cy.get('.custom-icon-remove').focus().trigger('keydown', { key: 'Enter' });
    cy.then(() => {
      expect(remove.callCount).to.equal(1);
      expect(remove.firstCall.args[0]).to.equal(file);
    });
  });
  it('preserves the native keyboard event for PageHeader back and skips Spacebar/Escape', () => {
    cy.mount(PageHeader);
    cy.get('[role="button"]')
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: ' ' })
      .trigger('keydown', { key: 'Spacebar' })
      .trigger('keydown', { key: 'Escape' });
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('back')!;
      expect(events).to.have.length(2);
      expect(
        events.every(
          (event) => event.length === 1 && (event[0] as KeyboardEvent).type === 'keydown',
        ),
      ).to.equal(true);
    });
  });
  it('routes Carousel keyboard activation once to the matching event', () => {
    cy.mount(Arrow);
    cy.get('[role="button"]').first().trigger('keydown', { key: ' ' });
    cy.get('[role="button"]')
      .last()
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: 'Escape' });
    cy.get('@vue').should(({ wrapper }) => {
      for (const name of ['previousClick', 'nextClick']) {
        const events = wrapper.emitted(name)!;
        expect(events).to.have.length(1);
        expect((events[0]![0] as Event).type).to.equal('keydown');
        expect(events[0]).to.have.length(1);
      }
    });
  });
  it('retries an Upload progress item with its original file and context receiver', () => {
    const file: FileItem = { uid: 'error', name: 'failed.png', status: 'error' },
      upload = cy.spy().as('upload');
    const context: UploadContext = {
      slots: {},
      showRetryButton: true,
      onUpload: upload,
      onAbort() {},
      onRemove() {},
      onPreview() {},
    };
    cy.mount(
      defineComponent({
        setup() {
          provide(uploadInjectionKey, context);
          return () => h(UploadProgress, { file, listType: 'text' });
        },
      }),
    );
    cy.get('[role="button"]')
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: ' ' })
      .trigger('keydown', { key: 'Spacebar' });
    cy.then(() => {
      expect(upload.callCount).to.equal(2);
      for (const call of upload.getCalls()) {
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.equal(file);
        expect(call.thisValue).to.equal(context);
      }
    });
  });
  it('preserves PictureItem remove payload and hides actions when the injected disabled state changes', () => {
    const file: FileItem = {
        uid: 'done',
        name: 'done.png',
        status: 'done',
        url: 'data:image/svg+xml,%3Csvg/%3E',
      },
      remove = cy.spy().as('remove');
    const context = reactive<UploadContext>({
      slots: {},
      iconCls: 'test-upload-icon',
      showRemoveButton: true,
      disabled: false,
      onUpload() {},
      onAbort() {},
      onRemove: remove,
      onPreview() {},
    });
    const currentFile = shallowRef(file);
    cy.mount(
      defineComponent({
        setup() {
          provide(uploadInjectionKey, context);
          return () => h(UploadPictureItem, { file: currentFile.value });
        },
      }),
    );
    cy.get('.test-upload-icon-remove .sd-icon-delete').should('exist');
    cy.get('.test-upload-icon-remove')
      .focus()
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: 'Escape' });
    cy.then(() => {
      expect(remove.callCount).to.equal(1);
      expect(remove.firstCall.args).to.have.length(1);
      expect(remove.firstCall.args[0]).to.equal(file);
      expect(remove.firstCall.thisValue).to.equal(context);
    });
    cy.then(() => {
      currentFile.value = { ...file, name: 'changed', status: 'error' };
    });
    cy.get('.test-upload-icon-remove').trigger('keydown', { key: ' ' });
    cy.then(() => {
      expect(remove.callCount).to.equal(2);
      expect(remove.secondCall.args[0].name).to.equal('changed');
      context.disabled = true;
    });
    cy.get('.test-upload-icon-remove').should('not.exist');
  });
});
