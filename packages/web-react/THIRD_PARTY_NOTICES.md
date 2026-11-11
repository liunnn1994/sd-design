# Third-party notices

## Markstream

markstream-react 2.0.18 is used as an unmodified runtime dependency. Its CSS is imported through the official package export; no SDK runtime or declarations are copied into this package.

The streamed text selection handling and settled DOM append behavior in `src/markdown-render/nodes/text.tsx`, and recursive custom node children and inherited renderer options in `src/markdown-render/custom-children.tsx`, are adapted from markstream-vue 2.0.18.

The native measurement probes in `src/markdown-render/height-probes.tsx` and the matching native-node token styles in `styles/markdown-render.scss` are adapted from markstream-vue 2.0.18.

Code renderer selection for height estimation in `src/markdown-render/code-height.ts` follows markstream-vue 2.0.18.

The preformatted code shell, logical lines, copy feedback and diagram-language dispatch in `src/markdown-render/nodes/pre-code.tsx`, and default diff preview rendering in `src/markdown-render/nodes/pre-diff.tsx`, are adapted from markstream-vue 2.0.18. Diff data and row measurements are provided through web-core.

The manual performance monitor is provided by web-core and adapted from markstream-vue 2.0.18. The React adapter retains the browser debugger helper names and shares the same Core monitor instance.

The virtual scroll option unions and scroll-root compatibility contracts in `src/markdown-render/types.ts` follow markstream-vue 2.0.18, with React `RefObject.current` replacing Vue ref values.

MIT License

Copyright (c) 2022 Simon He

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
