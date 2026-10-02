import * as markstream from 'markstream-vue';

import * as sdRoot from '../../index';
import * as sdUpstream from '../upstream';

// SD 根入口按同名承接上游全部运行时导出，只有两个符号按约定改名或让位。
const RENAMED: Record<string, string> = { Tooltip: 'MarkstreamTooltip' };
const HANDLED_BY_SD = ['MarkdownRender'];
const upstreamNames = () =>
  Object.keys(markstream).filter((name) => name !== 'default' && !HANDLED_BY_SD.includes(name));

describe('上游公开导出兼容', () => {
  it('SD 兼容入口导出上游全部运行时符号', () => {
    const sdNames = new Set(Object.keys(sdUpstream));
    const missing = upstreamNames().filter((name) => !sdNames.has(RENAMED[name] ?? name));
    expect(missing, `兼容入口缺失的导出：${missing.join(', ')}`).to.deep.equal([]);
  });
  it('SD 根入口同样承接，不被同名符号静默挤掉', () => {
    const rootNames = new Set(Object.keys(sdRoot));
    const missing = upstreamNames().filter((name) => !rootNames.has(RENAMED[name] ?? name));
    expect(missing, `根入口缺失的导出：${missing.join(', ')}`).to.deep.equal([]);
  });
  it('默认导出保留上游渲染器', () => {
    expect(sdUpstream.default).to.equal(markstream.default);
  });
  it('同名 Tooltip 让位给 SD，上游以 MarkstreamTooltip 提供', () => {
    expect(sdUpstream.MarkstreamTooltip).to.equal(markstream.Tooltip);
  });
  it('运行时 API 与封装渲染器共用同一注册表', () => {
    expect(sdUpstream.setCustomComponents).to.equal(markstream.setCustomComponents);
    expect(sdUpstream.getCustomNodeComponents).to.equal(markstream.getCustomNodeComponents);
  });
  it('公开解析与 HTML 工具从 SD 根入口可直接使用', () => {
    expect(sdUpstream.parseMarkdownToStructure).to.equal(markstream.parseMarkdownToStructure);
    expect(sdUpstream.tokenizeHtml).to.equal(markstream.tokenizeHtml);
    expect(sdUpstream.sanitizeHtmlContent).to.equal(markstream.sanitizeHtmlContent);
  });
});
