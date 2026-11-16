# Third-party notices

## Zag rectangle utilities

Hover intent uses `getElementPolygon` and `isPointInPolygon` directly from the MIT-licensed `@zag-js/rect-utils` 1.47.0 dependency (https://github.com/chakra-ui/zag/tree/main/packages/utilities/rect). The shared DOM controller connects these utilities to popup and Cascader lifecycles.

## Markstream

The manual performance monitor statistics, history limits and report behavior in `src/markdown/performance-monitor.ts` are adapted from markstream-vue 2.0.18.

The Markdown virtual-state signature and cache compatibility rules in `src/markdown/virtual-state.ts`, renderer defaults and measurement identity in `src/markdown/render-options.ts`, viewport activation and idle-drain behavior in `src/markdown/viewport.ts`, parse coalescing in `src/markdown/parse-coalescer.ts`, adaptive batch scheduling in `src/markdown/batch-scheduler.ts`, cursor eligibility, text traversal and positioning in `src/markdown/cursor.ts`, enter-fade rules and lifecycle in `src/markdown/enter-fade.ts`, and text-delta segmentation and settlement in `src/markdown/text-stream.ts` are adapted from markstream-vue 2.0.18.

The built-in/custom node classification and custom attribute forwarding in `src/markdown/custom-node.ts` are also adapted from markstream-vue 2.0.18.

The static node and diagram height fallbacks in `src/markdown/fallback-height.ts` are adapted from markstream-vue 2.0.18 and its diagramHeight module.

Standalone height-cache seeding, queued virtual-state restoration, emission intervals, and the final unmount snapshot in `src/markdown/virtual-controller.ts` follow markstream-vue 2.0.18.

The native probe profiles, simple-text eligibility, prepared-text caching, and text-height estimates in `src/markdown/text-height.ts` are adapted from markstream-vue 2.0.18 and use the separately licensed @chenglou/pretext dependency.

Code geometry, wrapping and diff line counting in `src/markdown/code-height.ts` are adapted from markstream-vue 2.0.18.

Preformatted code visual options, theme and title resolution, clipboard behavior and tooltip delays in `src/markdown/pre-code.ts`, and the matching shared SCSS in `styles/markdown-render/style/pre-code.scss`, are adapted from markstream-vue 2.0.18.

Diff preview data and incremental matching are delegated to the MIT-licensed markstream-core 2.0.18 dependency. Diff metadata and DOM row measurements in `src/markdown/pre-diff.ts`, and `styles/markdown-render/style/pre-diff.scss`, follow markstream-vue 2.0.18.

The KaTeX worker threshold formulas in `src/markdown/katex-threshold.ts` and native/timer scheduling fallbacks in `src/markdown/safe-raf.ts` are adapted from markstream-vue 2.0.18.

The CDN Worker source builders, types and Blob URL lifecycle in `src/markdown/katex-cdn-worker.ts`, `src/markdown/mermaid-cdn-worker.ts` and `src/markdown/cdn-worker.ts` are adapted from markstream-vue 2.0.18.

The explicit parser facade in `src/markdown/parser.ts` delegates to the MIT-licensed stream-markdown-parser 1.2.19 dependency without replacing its runtime bindings or global configuration.

MIT License

Copyright (c) 2022 Simon He

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
