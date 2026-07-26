import type {
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import type { JsonValue } from 'type-fest';

import { cloneDeep } from 'es-toolkit';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';

import type {
  RichTextEditorComponentNodeData,
  RichTextEditorComponentNodeSnapshot,
} from '../types';

export interface SerializedInlineComponentNode extends SerializedLexicalNode {
  data: RichTextEditorComponentNodeData;
  type: 'sd-inline-component';
  version: 1;
}

export class InlineComponentNode extends DecoratorNode<null> {
  __data: RichTextEditorComponentNodeData;

  static getType(): string {
    return 'sd-inline-component';
  }

  static clone(node: InlineComponentNode): InlineComponentNode {
    return new InlineComponentNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): InlineComponentNode {
    return $createInlineComponentNode(
      (serializedNode as unknown as SerializedInlineComponentNode).data,
    );
  }

  constructor(data: RichTextEditorComponentNodeData = { key: '', name: 'custom' }, key?: NodeKey) {
    super(key);
    this.__data = cloneDeep(data);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'sd-rich-text-editor-component';
    element.dataset.richTextComponent = this.__data.name;
    element.dataset.richTextComponentKey = this.__data.key;
    return element;
  }

  updateDOM(previousNode: InlineComponentNode, element: HTMLElement): boolean {
    if (previousNode.__data.name !== this.__data.name) {
      element.dataset.richTextComponent = this.__data.name;
    }
    if (previousNode.__data.key !== this.__data.key) {
      element.dataset.richTextComponentKey = this.__data.key;
    }
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): null {
    return null;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.dataset.richTextComponent = this.__data.name;
    element.dataset.richTextComponentKey = this.__data.key;
    element.textContent = this.getTextContent();
    return { element };
  }

  exportJSON(): SerializedInlineComponentNode {
    return {
      ...super.exportJSON(),
      data: cloneDeep(this.getLatest().__data),
      type: 'sd-inline-component',
      version: 1,
    };
  }

  getData(): RichTextEditorComponentNodeSnapshot {
    return cloneDeep(this.getLatest().__data);
  }

  getTextContent(): string {
    const data = this.getLatest().__data;
    return data.textValue ?? String(data.value ?? '');
  }

  setValue(value: JsonValue): this {
    const writable = this.getWritable();
    writable.__data = { ...writable.__data, value: cloneDeep(value) };
    return writable;
  }

  setData(data: RichTextEditorComponentNodeData): this {
    const writable = this.getWritable();
    writable.__data = cloneDeep(data);
    return writable;
  }

  isInline(): true {
    return true;
  }

  isIsolated(): false {
    return false;
  }

  isKeyboardSelectable(): true {
    return true;
  }
}

export function $createInlineComponentNode(
  data: RichTextEditorComponentNodeData,
): InlineComponentNode {
  return $applyNodeReplacement(new InlineComponentNode(data));
}

export function $isInlineComponentNode(
  node: LexicalNode | null | undefined,
): node is InlineComponentNode {
  return node instanceof InlineComponentNode;
}
