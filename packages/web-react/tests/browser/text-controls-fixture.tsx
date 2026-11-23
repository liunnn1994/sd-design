import { useState } from 'react';

import { Button } from '../../src/button/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import { Link } from '../../src/link/index.js';

export function TextControlsFixture() {
  const [clicks, setClicks] = useState(0);
  const [plain, setPlain] = useState(false);
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
        status={plain ? 'warning' : 'normal'}
        hoverable={plain ? false : undefined}
        icon={plain ? <strong>自定义链接图标</strong> : true}
        onClick={() => setClicks((value) => value + 1)}
      >
        正常链接
      </Link>
      <Link
        data-testid="icon-link"
        icon
        hoverable={plain ? true : undefined}
        iconTooltip="图标说明"
        aria-label="图标链接"
      />
      <Link data-testid="ellipsis-link" ellipsis={!plain} style={{ width: 120 }}>
        链接长文本内容在悬浮时完整显示
      </Link>
      <Button onClick={() => setPlain(!plain)}>切换链接样式</Button>
      <output data-testid="link-clicks">{clicks}</output>
    </section>
  );
}
