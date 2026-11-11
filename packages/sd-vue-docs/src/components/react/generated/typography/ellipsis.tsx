/** @jsxImportSource react */
import { TypographyParagraph, TypographyTitle } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  return (
    <>
      <div data-v-873c83c7="" className={'typography-ellipsis-demo'}>
        <section data-v-873c83c7="" className={'typography-ellipsis-demo__case'}>
          <header data-v-873c83c7="" className={'typography-ellipsis-demo__header'}>
            <strong data-v-873c83c7="">{'单行省略'}</strong>
            <span data-v-873c83c7="">{'标题超过一行后裁剪'}</span>
          </header>
          <TypographyTitle
            data-v-873c83c7=""
            heading={4}
            ellipsis={true}
            style={{ marginBottom: '0' }}
          >
            {
              ' 设计是一套用于构造对象、系统或流程的计划与规范，它让复杂目标能够被清晰地表达和实现。 '
            }
          </TypographyTitle>
        </section>
        <section data-v-873c83c7="" className={'typography-ellipsis-demo__case'}>
          <header data-v-873c83c7="" className={'typography-ellipsis-demo__header'}>
            <strong data-v-873c83c7="">{'多行省略与提示'}</strong>
            <span data-v-873c83c7="">{'保留两行，悬停查看完整内容'}</span>
          </header>
          <TypographyParagraph
            data-v-873c83c7=""
            ellipsis={{
              rows: 2,
              showTooltip: true,
            }}
            style={{ marginBottom: '0' }}
          >
            {
              ' 设计不只是外观，它还需要说明信息如何组织、操作如何反馈，以及不同状态之间如何转换。 一份清晰的设计能够让复杂系统更容易理解，也让使用者在完成任务时始终知道下一步该做什么。 '
            }
          </TypographyParagraph>
        </section>
        <section data-v-873c83c7="" className={'typography-ellipsis-demo__case'}>
          <header data-v-873c83c7="" className={'typography-ellipsis-demo__header'}>
            <strong data-v-873c83c7="">{'后缀与自定义展开'}</strong>
            <span data-v-873c83c7="">{'保留两行，并自定义展开、收起文案'}</span>
          </header>
          <TypographyParagraph
            data-v-873c83c7=""
            ellipsis={{
              suffix: '——SD Design',
              rows: 2,
              expandable: true,
              showTooltip: {
                type: 'popover',
                props: {
                  contentStyle: { maxWidth: '28rem' },
                },
              },
            }}
            style={{ marginBottom: '0' }}
            expandNode={(expanded) => <>{formatValue(expanded ? '收起' : '展开')}</>}
          >
            {
              ' 组件库中的文字省略需要同时兼顾布局、可读性和交互。当内容超出指定行数时，组件展示省略号、固定后缀和展开入口；展开后仍然保留收起入口，避免用户陷入无法恢复的状态。 '
            }
          </TypographyParagraph>
        </section>
        <section data-v-873c83c7="" className={'typography-ellipsis-demo__case'}>
          <header data-v-873c83c7="" className={'typography-ellipsis-demo__header'}>
            <strong data-v-873c83c7="">{'默认展开操作'}</strong>
            <span data-v-873c83c7="">{'保留三行，使用组件默认文案'}</span>
          </header>
          <TypographyParagraph
            data-v-873c83c7=""
            ellipsis={{
              suffix: '——SD Design',
              rows: 3,
              expandable: true,
            }}
            style={{ marginBottom: '0' }}
          >
            {
              ' 当正文较长时，可以增加保留行数，让读者先获得足够的上下文，再决定是否展开全文。默认展开操作适合常规内容，自定义插槽则适合需要调整文案或补充业务语义的场景。 在信息密度较高的页面中，这种渐进展示能够保持版面稳定，同时避免重要信息被永久隐藏。 '
            }
          </TypographyParagraph>
        </section>
      </div>
      <style>
        {
          '\n.typography-ellipsis-demo[data-v-873c83c7] {\n    display: grid;\n    width: min(100%, 28rem);\n    gap: 1.5rem;\n}\n.typography-ellipsis-demo__case[data-v-873c83c7] {\n    display: grid;\n    gap: 0.5rem;\n}\n.typography-ellipsis-demo__case + .typography-ellipsis-demo__case[data-v-873c83c7] {\n    padding-top: 1.25rem;\n    border-top: 1px solid var(--sd-color-border-2);\n}\n.typography-ellipsis-demo__header[data-v-873c83c7] {\n    display: grid;\n    gap: 0.125rem;\n}\n.typography-ellipsis-demo__header strong[data-v-873c83c7] {\n    font-size: 0.875rem;\n    line-height: 1.5;\n}\n.typography-ellipsis-demo__header span[data-v-873c83c7] {\n    color: var(--sd-color-text-3);\n    font-size: 0.75rem;\n    line-height: 1.5;\n}\n'
        }
      </style>
    </>
  );
}
