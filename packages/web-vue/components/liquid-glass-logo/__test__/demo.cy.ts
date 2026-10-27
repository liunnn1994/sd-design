import type { Component } from 'vue';

import {
  liquidGlassLogoDefaults,
  normalizeLiquidGlassLogo,
} from '@sdata/web-core/liquid-glass-logo/foundation';

import brandLogo from '../../../../sd-vue-docs/public/logo-icon.png';
import { runDemoTests } from '../../../cypress/support/demo-test';
import JsonForm from '../../json-form';
import LiquidGlassLogo from '../index';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/liquid-glass-logo/*.vue',
);

beforeEach(() => {
  cy.intercept('GET', '/logo-icon.png', (request) => request.redirect(brandLogo));
  cy.intercept('POST', '**', { statusCode: 200 }).as('remoteUploads');
});

runDemoTests('liquid-glass-logo', demos, (name) => {
  cy.get('.sd-liquid-glass-logo').should('have.attr', 'data-liquid-glass-ready');
  cy.get('@vue').then(({ wrapper }) => {
    const glass = wrapper.findComponent(LiquidGlassLogo);
    expect(glass.props('logo')).to.equal('/logo-icon.png');
    expect(glass.props('logoColor')).to.equal('original');
  });
  cy.get('.sd-liquid-glass-logo canvas').should('be.visible');
  if (name === 'basic' || name === 'large') {
    cy.get('.sd-liquid-glass-logo').should(
      'have.css',
      'height',
      name === 'basic' ? '32px' : '256px',
    );
  }
  if (name === 'basic') {
    cy.get('.sd-page-header-title .sd-liquid-glass-logo')
      .should('be.visible')
      .should(($logo) => {
        expect($logo[0].getBoundingClientRect().width).to.be.within(80, 140);
      });
    cy.get('.sd-page-header-title').should(($title) => {
      expect($title.text().trim()).to.equal('');
    });
    cy.get('@vue').then(({ wrapper }) => {
      const glass = wrapper.findComponent(LiquidGlassLogo);
      expect(glass.props('autoWidth')).to.equal(true);
      expect(glass.props('ending')).to.equal('wordmark');
      expect(glass.props('mark')).to.equal('logo');
      expect(glass.props('text')?.trim()).to.equal('Design');
      expect(glass.props('paused')).to.equal(false);
      const canvas = glass.find('canvas').element;
      const gl = canvas.getContext('webgl2')!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      const time = gl.getUniformLocation(program, 'uTime');
      const started = Number(gl.getUniform(program, time));
      cy.wrap(null).should(() => {
        expect(Number(gl.getUniform(program, time))).to.be.greaterThan(started + 0.05);
      });
    });
  }
  if (name !== 'playground') {
    cy.get('@vue').then(({ wrapper }) => wrapper.findComponent(LiquidGlassLogo).vm.seek(3.3));
    cy.contains('button', '重新播放').should('have.class', 'sd-btn-primary').click();
    cy.get('@vue').then(({ wrapper }) => {
      const canvas = wrapper.findComponent(LiquidGlassLogo).find('canvas').element;
      const gl = canvas.getContext('webgl2')!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      expect(
        Number(gl.getUniform(program, gl.getUniformLocation(program, 'uTime'))),
      ).to.be.lessThan(1.7);
    });
  }
  if (name === 'interactive') {
    cy.get('.liquid-glass-interactive').should(($demo) => {
      const toolbar = $demo[0].querySelector('.sd-space')!;
      const preview = $demo[0].querySelector('.sd-liquid-glass-logo')!;
      expect(
        preview.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom,
      ).to.be.at.least(16);
    });
    cy.contains('button', '暂停播放').should('have.class', 'sd-btn-status-warning').click();
    cy.contains('button', '继续播放').should('have.class', 'sd-btn-status-success').click();
    cy.contains('button', '暂停播放').click();
    cy.contains('button', '重新播放').click();
    cy.contains('button', '暂停播放').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(LiquidGlassLogo).props('paused')).to.equal(false);
    });
    cy.contains('button', '查看最终字标').click();
    cy.get('.sd-liquid-glass-logo').should(($glass) => {
      expect($glass.attr('aria-label')?.trim()).to.equal('Design');
    });
  }
  if (name === 'composition') {
    cy.get('.sd-liquid-glass-logo-background').should('have.length', 2);
  }
  if (name === 'playground') {
    cy.contains('button', '选择本地 Logo').should('be.visible');
    cy.contains('button', '重播预览').should('have.class', 'sd-btn-primary').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(LiquidGlassLogo).props('paused')).to.equal(false);
    });
    cy.contains('button', '恢复默认值').should('have.class', 'sd-btn-status-warning');
    cy.get('@vue').then(({ wrapper }) => {
      const schemas = wrapper
        .findAllComponents(JsonForm)
        .flatMap((form) => form.props('schemas') ?? []);
      for (const [field, value] of Object.entries(liquidGlassLogoDefaults)) {
        if (typeof value !== 'number') continue;
        const schema = schemas.find((item) => 'field' in item && item.field === field);
        expect(schema, field).not.to.equal(undefined);
        if (!schema || !('componentProps' in schema)) throw new Error(`缺少数值字段 ${field}`);
        const key = field as keyof typeof liquidGlassLogoDefaults;
        expect(schema.componentProps?.min, `${field} min`).to.equal(
          normalizeLiquidGlassLogo({ ...liquidGlassLogoDefaults, [key]: -Number.MAX_VALUE })[key],
        );
        expect(schema.componentProps?.max, `${field} max`).to.equal(
          normalizeLiquidGlassLogo({ ...liquidGlassLogoDefaults, [key]: Number.MAX_VALUE })[key],
        );
        expect(schema.componentProps?.step, `${field} step`).to.be.greaterThan(0);
      }
      for (const [field, min, max] of [
        ['backgroundX', -100, 100],
        ['backgroundY', -100, 100],
        ['backgroundScale', 1, 3],
        ['backgroundTintOpacity', 0, 1],
      ] as const) {
        const schema = schemas.find((item) => 'field' in item && item.field === field);
        if (!schema || !('componentProps' in schema)) throw new Error(`缺少背景字段 ${field}`);
        expect(schema.componentProps?.min).to.equal(min);
        expect(schema.componentProps?.max).to.equal(max);
      }
    });
    cy.contains('summary', '玻璃光学').scrollIntoView().click();
    cy.contains('.sd-form-item', '光学深度')
      .find('input')
      .scrollIntoView()
      .clear()
      .type('999')
      .blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(LiquidGlassLogo).props('depth')).to.equal(6);
    });
    cy.get('.liquid-glass-playground input[type=file]').selectFile(
      {
        contents: Cypress.Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="blue"/></svg>',
        ),
        fileName: 'custom-logo.svg',
        mimeType: 'image/svg+xml',
      },
      { force: true },
    );
    cy.contains('custom-logo.svg').should('be.visible');
    cy.get('@remoteUploads.all').should('have.length', 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(LiquidGlassLogo).props('logo')).to.match(/^blob:/);
    });
    cy.contains('button', '恢复默认值').click();
    cy.get('@vue').should(({ wrapper }) => {
      const glass = wrapper.findComponent(LiquidGlassLogo);
      expect(glass.props('logo')).to.equal('/logo-icon.png');
      expect(glass.props('depth')).to.equal(liquidGlassLogoDefaults.depth);
      expect(glass.props('paused')).to.equal(true);
    });
  }
});
