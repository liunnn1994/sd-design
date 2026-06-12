# [2.3.0](https://github.com/liunnn1994/sd-design/compare/v2.2.1...v2.3.0) (2026-06-12)

### Bug Fixes

- **anchor:** 将 affix 属性的默认值改为 false ([1b444cb](https://github.com/liunnn1994/sd-design/commit/1b444cb3da97daab4cf450593ab886f18c233764))
- **date-picker:** 修复日期面板年份边界问题并优化日期计算 ([df04707](https://github.com/liunnn1994/sd-design/commit/df0470752775cb4b8a65ad7698550e03f49ddf7c))
- **locale:** 修复部分国际化语言检验信息字段缺失问题 ([#3656](https://github.com/liunnn1994/sd-design/issues/3656)) ([8eab41d](https://github.com/liunnn1994/sd-design/commit/8eab41dead8119cc31c7d1558e5c3a6d99892686))
- **mention:** 清除输入后关闭弹出层并重置测量信息 ([#3653](https://github.com/liunnn1994/sd-design/issues/3653)) ([e7c9aa9](https://github.com/liunnn1994/sd-design/commit/e7c9aa926d4528136c26ad8f9c378d3314fb836e))
- **scripts:** 修复 dev-component 构建 watcher 报错 ([#3654](https://github.com/liunnn1994/sd-design/issues/3654)) ([b17b75c](https://github.com/liunnn1994/sd-design/commit/b17b75c17e94044c56c8bd3ef8262a287d0e1de2))
- **textarea:** update value before input event ([#3659](https://github.com/liunnn1994/sd-design/issues/3659)) ([f7ca0c0](https://github.com/liunnn1994/sd-design/commit/f7ca0c0f7899f086de9e93a67f408a53b77b9c0e))
- **verification-code:** 修复验证码输入框光标定位与聚焦行为 ([#3658](https://github.com/liunnn1994/sd-design/issues/3658)) ([4b36fef](https://github.com/liunnn1994/sd-design/commit/4b36fef9bf54c2485cbf67b064e07793a5991c20))

### Features

- **anchor:** 新增横向锚点并优化文档示例 ([8699aee](https://github.com/liunnn1994/sd-design/commit/8699aeee4dacd25138251c5a7f6089533748cac6))
- **button:** 新增 loadingFixedWidth 和 autoInsertSpaceInButton 属性 ([1ed094f](https://github.com/liunnn1994/sd-design/commit/1ed094fc1102337b47e689d8cf453f48d5aa4f81))
- **calendar:** 新增卡片模式、下拉头部和日期内容定制功能 ([3b42562](https://github.com/liunnn1994/sd-design/commit/3b425628218dbaf96b66518cedd80345e7d2b016))
- **date-picker:** 新增 inputProps 与 fixedTime 属性并支持自定义面板头部格式 ([a19694d](https://github.com/liunnn1994/sd-design/commit/a19694d90a6974152287104e7dfa6d1ff2a2896b))
- **date-picker:** 新增时区支持、隐藏灰色日期和范围重选清空功能 ([b5d912f](https://github.com/liunnn1994/sd-design/commit/b5d912f95b171fa44df77d6f1b144ef2ee56ef9f))
- **modal:** 新增全局配置和批量关闭功能 ([ff66efd](https://github.com/liunnn1994/sd-design/commit/ff66efd03ea8019e8ef801c31e670c7bad188026))
- 🆕 去掉自定义的render-function，改为使用官方写法 ([6a865c8](https://github.com/liunnn1994/sd-design/commit/6a865c851a10e560040ea0e4713ddec06e924ff2))

# [2.2.0](https://github.com/liunnn1994/sd-design/compare/v2.1.1...v2.2.0) (2026-06-11)

### Features

- 🆕 迁移到 composition api ([a719b6f](https://github.com/liunnn1994/sd-design/commit/a719b6f3c065ae0856bbdfde6198f86c15add1a4))

# [2.0.0](https://github.com/liunnn1994/sd-design/compare/v1.20.0...v2.0.0) (2026-06-08)

### Bug Fixes

- 🐛 修复 tag 自定义颜色的问题 ([e6c8095](https://github.com/liunnn1994/sd-design/commit/e6c80955f0223cac806913746099c945585f067c))
- 🐛 修复 tailwin 的样式被 starlight 覆盖的问题 ([0163695](https://github.com/liunnn1994/sd-design/commit/016369524ac1d11e87aae5494882a74114237bcc))
- 🐛 修复二维码组件错误的导出 ([5ccb242](https://github.com/liunnn1994/sd-design/commit/5ccb2428328f75dd986069e42b9d7aa3f86355a2))
- 🐛 修复组件没有tree-shaking的问题 ([01fce1a](https://github.com/liunnn1994/sd-design/commit/01fce1a639ce914d59f1696480d31344ad344240))

### Features

- 🆕 design token 也支持前缀 ([2e1fffe](https://github.com/liunnn1994/sd-design/commit/2e1fffe8aa6da53c327179d4d727e6662b78f04e))
- 🆕 modal 和 drawer 的标题添加 ellipsis 的支持 ([348c93c](https://github.com/liunnn1994/sd-design/commit/348c93cd2fd4c7b5ef38663f326372ffaebeb7f1))
- 🆕 固定图片 ([6432cf6](https://github.com/liunnn1994/sd-design/commit/6432cf6faf765ee87a0a374ed18c82176033d11a))
- 🆕 日历组件 ([47df414](https://github.com/liunnn1994/sd-design/commit/47df414077c6d5158c38dd2d6a120e939a0f0544))
- 🆕 添加文档的类型提示，修复一些bug ([53a3337](https://github.com/liunnn1994/sd-design/commit/53a3337ebd5b2a2b38d7c8a16ea8845d73f9cf32))
- 🆕 添加漫游式导航 ([869a1f4](https://github.com/liunnn1994/sd-design/commit/869a1f49ea93568536eeec8e8135227ccf5bcccc))

### BREAKING CHANGES

- 🧨 ’

# [1.20.0](https://github.com/liunnn1994/sd-design/compare/v1.19.0...v1.20.0) (2026-05-26)

### Features

- 🆕 二维码组件 ([fa93361](https://github.com/liunnn1994/sd-design/commit/fa93361be00b16f7d028b9f2ddc337b7059681f4))
- 🆕 更新域名 ([e0d4b6c](https://github.com/liunnn1994/sd-design/commit/e0d4b6c0a7b135760414764448726278447fd172))

# [1.17.0](https://github.com/liunnn1994/sd-design/compare/v1.16.0...v1.17.0) (2026-05-21)

### Bug Fixes

- 🐛 修复 ts 报错 ([287a3a9](https://github.com/liunnn1994/sd-design/commit/287a3a9c727e028e6d5ccc669dfae9c7e32208f5))

### Features

- 🆕 menu 新增 ellipsis 功能 ([6fcb95f](https://github.com/liunnn1994/sd-design/commit/6fcb95f92b44a5bfa858dd65f795527c4a5d3e28))
- 🆕 新增 layout-header ([435d2a6](https://github.com/liunnn1994/sd-design/commit/435d2a6a9850aa6a8e685cccdbf53bd97b81c05d))
- 🆕 更新 sider 组件 ([1829fe2](https://github.com/liunnn1994/sd-design/commit/1829fe2abff4cb8a0e043d51dd0b9425be2d52e7))

# [1.16.0](https://github.com/liunnn1994/sd-design/compare/v1.15.0...v1.16.0) (2026-05-21)

### Features

- 🆕 switch 添加自动 loading ([0da0856](https://github.com/liunnn1994/sd-design/commit/0da08563a7b5706e1b3c93f79e8c6c262ed7d014))
- 🆕 添加 ai 支持 ([e004c4b](https://github.com/liunnn1994/sd-design/commit/e004c4bccf892829376f6a96956fd221da2a78a5))
- 🆕 移除所有未使用的导入 ([4c575d0](https://github.com/liunnn1994/sd-design/commit/4c575d0685c38f9ff12b4383d40517658557be0c))

# [1.15.0](https://github.com/liunnn1994/sd-design/compare/v1.14.1...v1.15.0) (2026-05-20)

### Features

- 🆕 修改 resolver 导出名，更新文档 ([5aaf449](https://github.com/liunnn1994/sd-design/commit/5aaf449f06bed9ab7380d5ba1bcd210fd06306e3))

## [1.14.1](https://github.com/liunnn1994/sd-design/compare/v1.14.0...v1.14.1) (2026-05-20)

### Bug Fixes

- 🐛 typecheck 缺图标问题 ([150436f](https://github.com/liunnn1994/sd-design/commit/150436f936f66ac889d5cd8f14ae0ab188e196f2))

# Changelog

All notable changes to this package will be documented in this file.
