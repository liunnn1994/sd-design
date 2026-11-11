import { useState } from 'react';

import { Avatar, AvatarGroup, ConfigProvider } from '../../src/index';

export function AvatarGroupFixture() {
  const [rtl, setRtl] = useState(false);
  const [limit, setLimit] = useState(2);
  const [ascend, setAscend] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
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
            <Avatar shape="circle" size={64}>
              LongName
            </Avatar>
            <Avatar>B</Avatar>
          </>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
        </AvatarGroup>
      </ConfigProvider>
      <button onClick={() => setRtl(!rtl)}>切换头像 RTL</button>
      <button onClick={() => setLimit(limit ? 0 : 2)}>切换头像数量限制</button>
      <button onClick={() => setAscend(!ascend)}>切换头像层级</button>
      <button onClick={() => setAutoFix(!autoFix)}>启用组字体缩放</button>
    </section>
  );
}
