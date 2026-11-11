/** @jsxImportSource react */

import {
  Button,
  Collapse,
  CollapseItem,
  Input,
  Rate,
  Space,
  Switch,
  TabPane,
  Tabs,
  Tag,
} from '@sdata/web-react';
import { useState } from 'react';

import '../../home/HomePreviewGrid.scss';

export default function HomePreviewGrid() {
  const [name, setName] = useState('下一件好作品');
  const [enabled, setEnabled] = useState(true);
  const [rating, setRating] = useState(4);
  const [count, setCount] = useState(0);
  return (
    <div className="home-previews">
      <article>
        <div className="home-previews__stage">
          <Space wrap>
            <Button type="primary" onClick={() => setCount((value) => value + 1)}>
              {count ? `已点击 ${count} 次` : '开始创作'}
            </Button>
            <Button>保存草稿</Button>
          </Space>
        </div>
        <a href="/react/components/button/">
          <strong>按钮</strong>
          <span>按钮 ↗</span>
        </a>
      </article>
      <article>
        <div className="home-previews__stage">
          <div className="home-previews__field">
            <label htmlFor="home-preview-name">项目名称</label>
            <Input id="home-preview-name" value={name} onValueChange={setName} allowClear />
          </div>
        </div>
        <a href="/react/components/input/">
          <strong>输入框</strong>
          <span>输入框 ↗</span>
        </a>
      </article>
      <article>
        <div className="home-previews__stage">
          <Space size={16}>
            <Switch
              value={enabled}
              onChange={(value) => setEnabled(Boolean(value))}
              aria-label="开启通知"
            />
            <span>{enabled ? '通知已开启' : '通知已关闭'}</span>
          </Space>
        </div>
        <a href="/react/components/switch/">
          <strong>开关</strong>
          <span>开关 ↗</span>
        </a>
      </article>
      <article>
        <div className="home-previews__stage">
          <div className="home-previews__rating">
            <Rate value={rating} onValueChange={setRating} allowHalf />
            <Tag color="blue">{rating} / 5</Tag>
          </div>
        </div>
        <a href="/react/components/rate/">
          <strong>评分</strong>
          <span>评分 ↗</span>
        </a>
      </article>
      <article>
        <div className="home-previews__stage">
          <Tabs type="capsule" animation>
            <TabPane paneKey="overview" title="总览">
              所有内容，井然有序。
            </TabPane>
            <TabPane paneKey="activity" title="动态">
              新的想法，正在发生。
            </TabPane>
          </Tabs>
        </div>
        <a href="/react/components/tabs/">
          <strong>标签页</strong>
          <span>标签页 ↗</span>
        </a>
      </article>
      <article>
        <div className="home-previews__stage">
          <Collapse bordered={false}>
            <CollapseItem itemKey="details" header="展开，了解更多">
              把次要信息留到需要时。
            </CollapseItem>
          </Collapse>
        </div>
        <a href="/react/components/collapse/">
          <strong>折叠面板</strong>
          <span>折叠面板 ↗</span>
        </a>
      </article>
    </div>
  );
}
