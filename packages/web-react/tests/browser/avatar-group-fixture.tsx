import { useState } from 'react';

import { Avatar, AvatarGroup } from '../../src/avatar';
import { ConfigProvider } from '../../src/config-provider';

export function AvatarGroupFixture() {
  const [rtl, setRtl] = useState(false);
  const [limit, setLimit] = useState(2);
  const [ascend, setAscend] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [showLast, setShowLast] = useState(true);
  return (
    <section>
      <ConfigProvider rtl={rtl}>
        <AvatarGroup
          data-testid="avatar-group"
          size={32}
          shape="square"
          autoFixFontSize={autoFix}
          maxCount={limit}
          zIndexAscend={ascend}
          maxStyle={{ backgroundColor: '#165dff' }}
          maxPopoverTriggerProps={{ trigger: 'click' }}
        >
          <>
            {(reverse ? ['B', 'LongName'] : ['LongName', 'B']).map((name) => (
              <Avatar key={name} shape="circle" size={64}>
                {name}
              </Avatar>
            ))}
          </>
          <Avatar>C</Avatar>
          {showLast && <Avatar>D</Avatar>}
        </AvatarGroup>
      </ConfigProvider>
      <button onClick={() => setRtl(!rtl)}>切换头像 RTL</button>
      <button onClick={() => setLimit(limit ? 0 : 2)}>切换头像数量限制</button>
      <button onClick={() => setAscend(!ascend)}>切换头像层级</button>
      <button onClick={() => setAutoFix(!autoFix)}>启用组字体缩放</button>
      <button onClick={() => setReverse(!reverse)}>交换头像顺序</button>
      <button onClick={() => setShowLast(!showLast)}>Toggle last avatar</button>
    </section>
  );
}
