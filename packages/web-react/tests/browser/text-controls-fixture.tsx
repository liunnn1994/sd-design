import { useState } from 'react';

import { Button, ConfigProvider, Link, Tag } from '../../src/index';

export function TextControlsFixture() {
  const [clicks, setClicks] = useState(0);
  return (
    <section>
      <Button data-testid="ellipsis-button" style={{ width: 120 }}>
        按钮长文本在键盘聚焦时显示省略提示
      </Button>
      <ConfigProvider autoInsertSpaceInButton>
        <Button data-testid="spaced-button">确认</Button>
      </ConfigProvider>
      <Button
        data-testid="override-button"
        style={{ width: 120 }}
        tooltip="完整按钮提示"
        ellipsisTooltipContent="不应出现的省略提示"
      >
        按钮长内容用于验证外层提示优先级
      </Button>
      <Tag data-testid="custom-tag" tooltip="标签自定义提示">
        短标签
      </Tag>
      <Tag data-testid="plain-tag" ellipsis={false} tooltip="无省略提示">
        普通标签
      </Tag>
      <Tag data-testid="disabled-tooltip-tag" ellipsisTooltip={false} tooltip="禁用的提示">
        禁用提示
      </Tag>
      <Tag
        data-testid="multiline-tag"
        ellipsisLineClamp={2}
        ellipsisExpandTrigger="click"
        style={{ width: 140 }}
      >
        {'多行标签长内容。'.repeat(10)}
      </Tag>
      <Link
        data-testid="disabled-link"
        href="#forbidden"
        disabled
        onClick={() => setClicks((value) => value + 1)}
      >
        禁用链接
      </Link>
      <Link
        data-testid="loading-link"
        href="#forbidden"
        loading
        onClick={() => setClicks((value) => value + 1)}
      >
        加载中的 Link
      </Link>
      <Link
        data-testid="normal-link"
        href="#allowed"
        icon
        onClick={() => setClicks((value) => value + 1)}
      >
        正常链接
      </Link>
      <Link data-testid="icon-link" icon iconTooltip="图标说明" aria-label="图标链接" />
      <Link data-testid="ellipsis-link" style={{ width: 120 }}>
        链接长文本内容在悬浮时完整显示
      </Link>
      <output data-testid="link-clicks">{clicks}</output>
    </section>
  );
}
