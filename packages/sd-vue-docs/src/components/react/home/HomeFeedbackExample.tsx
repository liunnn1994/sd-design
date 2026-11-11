/** @jsxImportSource react */

import { Button, Link, SkeletonReveal, Tag } from '@sdata/web-react';
import { IconRefresh } from '@sdata/web-react/icon';
import { type ComponentRef, useRef, useState } from 'react';

import '../../home/HomeFeedbackExample.scss';

export default function HomeFeedbackExample() {
  const reveal = useRef<ComponentRef<typeof SkeletonReveal>>(null);
  const [adopted, setAdopted] = useState(false);
  return (
    <div className="home-feedback-example">
      <Link
        className="home-feedback-example__refresh"
        role="button"
        tabIndex={0}
        aria-label="刷新反馈示例"
        title="刷新"
        icon={<IconRefresh />}
        onClick={() => reveal.current?.replay()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            reveal.current?.replay();
          }
        }}
      />
      <SkeletonReveal ref={reveal} duration={2000}>
        <div className="home-feedback-example__answer">
          <div className="home-feedback-example__identity">
            <img src="/logo-icon.png" alt="" width={24} height={24} />
            <strong>SD 助手</strong>
            <Tag color="green" size="small">
              已生成
            </Tag>
          </div>
          <h3>产品发布计划已就绪</h3>
          <p>从亮点到行动，下一步更清晰。</p>
          <ul>
            <li>整理 3 个核心更新亮点</li>
            <li>准备发布文案与渠道</li>
            <li>收集反馈，持续改进</li>
          </ul>
          <Button
            size="small"
            type={adopted ? 'secondary' : 'primary'}
            aria-pressed={adopted}
            onClick={() => setAdopted((value) => !value)}
          >
            {adopted ? '已采用' : '采用计划'}
          </Button>
        </div>
      </SkeletonReveal>
    </div>
  );
}
