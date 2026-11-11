/** @jsxImportSource react */
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
  Tag,
} from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const shortcuts = {
    qualityRoute: 'Alt+Shift+1',
    localRoute: 'Alt+Shift+2',
  } as const;

  return (
    <>
      <ModelSelector data-v-2429b4d7="" closeOnSelect={false}>
        <ModelSelectorTrigger
          data-v-2429b4d7=""
          children={({ open, visible }) => (
            <>
              <Tag
                data-v-2429b4d7=""
                className={'model-route-trigger'}
                color={visible ? 'blue' : 'gray'}
                role={'button'}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  open();
                }}
              >
                {formatValue(visible ? '正在选择模型路由' : '选择模型路由')}
              </Tag>
            </>
          )}
        />
        <ModelSelectorContent data-v-2429b4d7="" maskClosable={false} title={'选择路由模型'}>
          <ModelSelectorInput data-v-2429b4d7="" placeholder={'搜索模型路由'} />
          <ModelSelectorList data-v-2429b4d7="">
            <ModelSelectorGroup
              data-v-2429b4d7=""
              heading={
                <>
                  <div data-v-2429b4d7="" className={'group-heading'}>
                    <span data-v-2429b4d7="">{'智能路由'}</span>
                    <Tag data-v-2429b4d7="" color={'green'}>
                      {'推荐'}
                    </Tag>
                  </div>
                </>
              }
            >
              <ModelSelectorItem
                data-v-2429b4d7=""
                value={'quality-route'}
                selected={true}
                shortcut={shortcuts.qualityRoute}
              >
                <ModelSelectorLogoGroup data-v-2429b4d7="">
                  <ModelSelectorLogo data-v-2429b4d7="" provider={'openai'} />
                  <ModelSelectorLogo data-v-2429b4d7="" provider={'anthropic'} />
                  <ModelSelectorLogo data-v-2429b4d7="" provider={'google'} />
                </ModelSelectorLogoGroup>
                <ModelSelectorName data-v-2429b4d7="">
                  <strong data-v-2429b4d7="">{'质量优先'}</strong>
                  <small data-v-2429b4d7="">{'自动选择当前最强模型'}</small>
                </ModelSelectorName>
                <ModelSelectorShortcut data-v-2429b4d7="">
                  {formatValue(shortcuts.qualityRoute)}
                </ModelSelectorShortcut>
              </ModelSelectorItem>
              <ModelSelectorItem
                data-v-2429b4d7=""
                value={'local-route'}
                shortcut={shortcuts.localRoute}
              >
                <ModelSelectorName data-v-2429b4d7="">
                  <strong data-v-2429b4d7="">{'私有模型'}</strong>
                  <small data-v-2429b4d7="">{'未知厂商使用离线通用 Logo'}</small>
                </ModelSelectorName>
                <ModelSelectorLogo data-v-2429b4d7="" provider={'custom-private-provider'} />
                <ModelSelectorShortcut data-v-2429b4d7="">
                  {formatValue(shortcuts.localRoute)}
                </ModelSelectorShortcut>
              </ModelSelectorItem>
            </ModelSelectorGroup>
            <ModelSelectorSeparator data-v-2429b4d7="" />
            <div data-v-2429b4d7="" className={'offline-note'}>
              {'所有 Logo 均由组件包离线提供，不会请求外部站点。'}
            </div>
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
      <style>
        {
          '\n.model-route-trigger {\n    cursor: pointer;\n}\n.group-heading {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n}\n.sd-model-selector-name {\n    display: flex;\n    flex-direction: column;\n}\n.sd-model-selector-name small,\n  .offline-note {\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n}\n.offline-note {\n    padding: 8px 12px;\n}\n'
        }
      </style>
    </>
  );
}
