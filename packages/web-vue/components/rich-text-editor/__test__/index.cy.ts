import type { LexicalEditor } from 'lexical';

import { defineComponent, h, markRaw } from 'vue';

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $nodesOfType,
  createCommand,
} from 'lexical';

import type { RichTextEditorComponentNodeData, RichTextEditorRef } from '../types';

import Button from '../../button';
import ConfigProvider from '../../config-provider';
import { RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES } from '../built-in-components';
import RichTextEditor from '../index';
import { $createInlineComponentNode, InlineComponentNode } from '../nodes/inline-component-node';

const getEditor = (wrapper: { vm: unknown }) => wrapper.vm as RichTextEditorRef;

describe('RichTextEditor', () => {
  it('edits rich text and emits serialized editor state', () => {
    const changes: string[] = [];
    cy.mount(RichTextEditor, {
      props: {
        placeholder: '请输入内容',
        onChange: (_value, context) => {
          changes.push(
            context.editorState.read(() => context.editor.getRootElement()?.innerText ?? ''),
          );
        },
      },
    });

    cy.get('.sd-rich-text-editor-placeholder').should('contain.text', '请输入内容');
    cy.get('[role="textbox"]')
      .should('have.attr', 'contenteditable', 'true')
      .click()
      .type('你好 Lexical');
    cy.get('.sd-rich-text-editor-placeholder').should('not.exist');
    cy.get('[contenteditable="true"]').should('contain.text', '你好 Lexical');
    cy.then(() => expect(changes.at(-1)).to.contain('你好 Lexical'));
  });

  it('exposes the raw Lexical editor and command registration', () => {
    const CUSTOM_COMMAND = createCommand<string>('SD_TEST_COMMAND');
    let payload = '';

    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      expect(editor.editor).to.not.equal(null);
      const unregister = editor.registerCommand(
        CUSTOM_COMMAND,
        (value) => {
          payload = value;
          return true;
        },
        0,
      );
      expect(editor.dispatchCommand(CUSTOM_COMMAND, 'available')).to.equal(true);
      unregister();
      expect(payload).to.equal('available');
    });
  });

  it('supports text formatting, HTML and Markdown through exposed methods', () => {
    cy.mount(RichTextEditor, { props: { defaultValue: 'hello' } });
    cy.get('[role="textbox"]').click();
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.formatText('bold');
      editor.insertText(' world');
      cy.then(() => {
        expect(editor.getText()).to.equal('hello world');
        expect(editor.getHTML()).to.match(/<strong[^>]*> world<\/strong>/);

        editor.setMarkdown('# 标题\n\n**正文**');
        cy.then(() => {
          expect(editor.getMarkdown()).to.contain('# 标题');
          expect(editor.getHTML()).to.contain('<h1');
        });
      });
    });
  });

  it('renders and updates SD Input, Select and Tag component nodes', () => {
    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.insertComponent({
        key: 'keyword',
        name: 'input',
        value: '天气',
        props: { maxlength: 3, placeholder: '关键词' },
        textValue: '天气',
      });
      editor.insertComponent({
        key: 'city',
        name: 'select',
        value: '北京',
        props: { options: ['北京', '上海'] },
        textValue: '北京',
      });
      editor.insertComponent({
        key: 'detail',
        name: 'tag',
        value: '详细',
        props: { label: '详细', closable: true },
        textValue: '详细',
      });
    });

    cy.get('.sd-rich-text-editor-component-input input')
      .should('have.value', '天气')
      .and('have.attr', 'maxlength', '3');
    cy.get('.sd-rich-text-editor-component-select').should('contain.text', '北京');
    cy.get('.sd-rich-text-editor-component-tag').should('contain.text', '详细');
    cy.get('.sd-rich-text-editor-component-input input').clear().type('温度');
    cy.get('.sd-rich-text-editor-component-tag .sd-icon-hover').click();
    cy.get('.sd-rich-text-editor-component-tag').should('not.exist');
  });

  it('applies a selected style when a component node is keyboard-selected', () => {
    cy.mount(RichTextEditor);
    cy.get('[role="textbox"]').focus();
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.update(
        () => {
          const before = $createTextNode('前');
          const node = $createInlineComponentNode({
            key: 'selectable-tag',
            name: 'tag',
            value: '已选',
            textValue: '已选',
          });
          const after = $createTextNode('后');
          $getRoot().append($createParagraphNode().append(before, node, after));
          before.selectEnd();
        },
        { discrete: true },
      );
    });
    cy.get('[role="textbox"]').type('{rightarrow}');
    cy.get('.sd-rich-text-editor-component-selected').should('exist');
    cy.get('[role="textbox"]').type('{rightarrow}');
    cy.get('.sd-rich-text-editor-component-selected').should('not.exist');
  });

  it('isolates component node data from external and snapshot mutations', () => {
    const source: RichTextEditorComponentNodeData = {
      key: 'isolated-tag',
      name: 'tag',
      value: '原始值',
      props: { nested: { label: '原始属性' } },
      textValue: '原始值',
    };

    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.insertComponent(source);
      source.value = '外部改写';
      source.props = { nested: { label: '外部属性' } };

      const snapshot = editor.read(() =>
        $nodesOfType(InlineComponentNode)[0]?.getData(),
      ) as RichTextEditorComponentNodeData;
      snapshot.value = '快照改写';
      snapshot.props = { nested: { label: '快照属性' } };

      const exported = editor.getJSON();
      const exportedContainer = exported?.root.children.at(-1) as
        | { children: Array<{ data?: RichTextEditorComponentNodeData }> }
        | undefined;
      const exportedData = exportedContainer?.children[0]?.data;
      expect(exportedData).to.not.equal(undefined);
      if (exportedData) {
        exportedData.value = '导出值改写';
        exportedData.props = { nested: { label: '导出属性' } };
      }

      const serialized = JSON.stringify(editor.getJSON());
      expect(serialized).to.contain('原始值').and.to.contain('原始属性');
      expect(serialized).to.not.contain('外部改写');
      expect(serialized).to.not.contain('外部属性');
      expect(serialized).to.not.contain('快照改写');
      expect(serialized).to.not.contain('快照属性');
      expect(serialized).to.not.contain('导出值改写');
      expect(serialized).to.not.contain('导出属性');
    });
  });

  it('renders every JsonForm built-in node', () => {
    const sampleProps: Record<string, Record<string, unknown>> = {
      autoComplete: { data: ['Vue'] },
      cascader: { options: [] },
      checkboxGroup: { options: ['Vue'] },
      inputTag: { options: [] },
      mention: { data: ['Vue'] },
      radioGroup: { options: ['Vue'] },
      select: { options: ['Vue'] },
      transfer: { data: [] },
      treeSelect: { data: [] },
    };

    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      for (const name of RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES) {
        editor.insertComponent({
          key: `json-form-${name}`,
          name,
          value: null,
          props: sampleProps[name] ?? {},
          textValue: name,
        });
      }
    });

    expect(RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES).to.have.length(25);
    for (const name of RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES) {
      cy.get(`.sd-rich-text-editor-component-${name}`).should('exist');
      if (name !== 'noFormItem') {
        cy.get(`.sd-rich-text-editor-component-${name}`).find('*').should('exist');
      }
    }
  });

  it('opens the built-in DatePicker node', () => {
    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      getEditor(wrapper).insertComponent({
        key: 'json-form-date-picker',
        name: 'datePicker',
        value: null,
        props: { placeholder: '选择日期' },
        textValue: '日期',
      });
    });

    cy.get('.sd-rich-text-editor-component-datePicker .sd-picker input')
      .should('have.attr', 'placeholder', '选择日期')
      .click();
    cy.get('.sd-picker-container').should('be.visible');
  });

  it('keeps RangePicker and Slider usable inside the editor', () => {
    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.insertComponent({
        key: 'json-form-range-picker',
        name: 'rangePicker',
        value: ['2026-07-20', '2026-07-26'],
        props: {
          valueFormat: 'YYYY-MM-DD',
          placeholder: ['开始日期', '结束日期'],
        },
        textValue: '日期范围',
      });
      editor.insertComponent({
        key: 'json-form-slider',
        name: 'slider',
        value: 40,
        textValue: '进度',
      });
    });

    cy.get('.sd-rich-text-editor-component-rangePicker .sd-picker input')
      .should('have.length', 2)
      .first()
      .should('have.value', '2026-07-20')
      .click();
    cy.get('.sd-picker-range-container').should('be.visible');

    cy.get('.sd-rich-text-editor-component-slider .sd-slider-track').should(($track) => {
      const trackWidth = $track[0].getBoundingClientRect().width;
      const sliderWidth = $track[0].parentElement?.getBoundingClientRect().width;
      const node = $track[0].closest('.sd-rich-text-editor-component-slider');
      const nodeWidth = node?.getBoundingClientRect().width;
      const nodeStyle = node ? getComputedStyle(node) : undefined;
      expect(
        trackWidth,
        `track=${trackWidth}, slider=${sliderWidth}, node=${nodeWidth}, display=${nodeStyle?.display}, width=${nodeStyle?.width}, maxWidth=${nodeStyle?.maxWidth}, class=${node?.className}`,
      ).to.be.greaterThan(100);
    });
    cy.get('.sd-rich-text-editor-component-slider .sd-slider-bar').should(($bar) => {
      expect($bar[0].getBoundingClientRect().width).to.be.greaterThan(0);
    });
  });

  it('opens the built-in TimePicker node', () => {
    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      getEditor(wrapper).insertComponent({
        key: 'json-form-time-picker',
        name: 'timePicker',
        value: '09:30:00',
        props: { format: 'HH:mm:ss', placeholder: '选择时间' },
        textValue: '时间',
      });
    });

    cy.get('.sd-rich-text-editor-component-timePicker .sd-picker input')
      .should('have.value', '09:30:00')
      .click();
    cy.get('.sd-timepicker-container').should('be.visible');
    cy.get('.sd-timepicker')
      .should('be.visible')
      .and(($panel) => {
        expect($panel[0].getBoundingClientRect().width).to.be.greaterThan(100);
      });
  });

  it('renders populated Transfer and TreeSelect nodes', () => {
    cy.mount(RichTextEditor);
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.insertComponent({
        key: 'json-form-transfer',
        name: 'transfer',
        value: ['vue'],
        props: {
          data: [
            { value: 'vue', label: 'Vue' },
            { value: 'react', label: 'React' },
          ],
        },
        textValue: '技术栈',
      });
      editor.insertComponent({
        key: 'json-form-tree-select',
        name: 'treeSelect',
        value: 'vue',
        props: {
          data: [
            {
              key: 'frontend',
              title: '前端框架',
              children: [
                { key: 'vue', title: 'Vue' },
                { key: 'react', title: 'React' },
              ],
            },
          ],
          placeholder: '选择技术栈',
        },
        textValue: '技术栈',
      });
    });

    cy.get('.sd-rich-text-editor-component-transfer')
      .should('contain.text', 'Vue')
      .and('contain.text', 'React');
    cy.get('.sd-rich-text-editor-component-treeSelect').should('contain.text', 'Vue').click();
    cy.get('.sd-tree-select-popup').should('be.visible').and('contain.text', 'React');
  });

  it('uses JsonForm components registered by ConfigProvider', () => {
    let editor: LexicalEditor | null = null;
    const ExternalNode = defineComponent({
      props: { modelValue: { type: String, default: '' } },
      emits: { 'update:modelValue': (_value: string) => true },
      setup(props, { emit }) {
        return () =>
          h(
            'button',
            {
              class: 'external-json-form-node',
              onClick: () => emit('update:modelValue', '已更新'),
            },
            props.modelValue,
          );
      },
    });
    cy.mount(ConfigProvider, {
      props: { jsonForm: { components: { codeEditor: markRaw(ExternalNode) } } },
      slots: {
        default: () =>
          h(RichTextEditor, {
            onReady: (instance) => {
              editor = instance;
            },
          }),
      },
    });
    cy.then(() => {
      editor?.update(
        () => {
          const node = $createInlineComponentNode({
            key: 'external-code-editor',
            name: 'codeEditor',
            value: '初始值',
            textValue: '初始值',
          });
          $getRoot().append($createParagraphNode().append(node));
        },
        { discrete: true },
      );
    });
    cy.get('.external-json-form-node').should('contain.text', '初始值').click();
    cy.get('.external-json-form-node').should('contain.text', '已更新');
  });

  it('renders custom component nodes through dynamic scoped slots', () => {
    cy.mount(RichTextEditor, {
      slots: {
        'node-mention': ({ node, update }: Record<string, unknown>) =>
          h(
            Button,
            {
              class: 'mention-node',
              onClick: () => (update as (value: string) => void)('李四'),
            },
            () => String((node as { value?: string }).value),
          ),
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      getEditor(wrapper).insertComponent({
        key: 'mention-1',
        name: 'mention',
        value: '张三',
        textValue: '@张三',
      });
    });

    cy.get('.mention-node').should('contain.text', '张三').click().should('contain.text', '李四');
  });

  it('supports controlled state without emitting an external echo', () => {
    let value;
    let updates = 0;
    cy.mount(RichTextEditor, {
      props: {
        'onUpdate:modelValue': (nextValue) => {
          value = nextValue;
          updates += 1;
        },
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.insertText('受控内容');
      cy.then(() => {
        expect(value).to.not.equal(undefined);
        const beforeExternalUpdate = updates;
        return wrapper.setProps({ modelValue: value }).then(() => {
          expect(updates).to.equal(beforeExternalUpdate);
          expect(editor.getText()).to.equal('受控内容');
        });
      });
    });
  });

  it('supports undo, redo, clear, readonly and disabled states', () => {
    cy.mount(RichTextEditor, { props: { defaultValue: '初始值' } });
    cy.get('@vue').then(({ wrapper }) => {
      const editor = getEditor(wrapper);
      editor.focus(() => editor.insertText('追加'));
      cy.wrap(null).should(() => {
        expect(editor.getText()).to.equal('初始值追加');
      });
      cy.then(() => editor.undo());
      cy.wrap(null).should(() => {
        expect(editor.getText()).to.equal('初始值');
      });
      cy.then(() => editor.redo());
      cy.wrap(null).should(() => {
        expect(editor.getText()).to.equal('初始值追加');
      });
      cy.then(() => {
        editor.clear();
        expect(editor.getText()).to.equal('');
      });
    });

    cy.mount(RichTextEditor, { props: { defaultValue: '只读', readonly: true } });
    cy.get('[role="textbox"]').should('have.attr', 'contenteditable', 'false');

    cy.mount(RichTextEditor, { props: { defaultValue: '禁用', disabled: true } });
    cy.get('[role="textbox"]')
      .should('have.attr', 'contenteditable', 'false')
      .and('have.attr', 'aria-disabled', 'true');
  });

  it('runs plugin setup and cleanup with the same editor instance', () => {
    let initialized = false;
    let cleaned = false;
    cy.mount(RichTextEditor, {
      props: {
        plugins: [
          (editor, context) => {
            initialized = Boolean(editor.getRootElement() === context.rootElement);
            return () => {
              cleaned = true;
            };
          },
        ],
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      expect(initialized).to.equal(true);
      wrapper.unmount();
      expect(cleaned).to.equal(true);
    });
  });
});
