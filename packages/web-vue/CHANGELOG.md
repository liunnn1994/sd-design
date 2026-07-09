# [3.7.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.6.0...web-vue-v3.7.0) (2026-07-09)


### Features

* 🆕 移除历史兼容层，统一使用 v-model ([7bf0921](https://github.com/liunnn1994/sd-design/commit/7bf09218f7b68dacfeeabb3a0e7ce6fe38c40fb8))

# [3.6.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.5.0...web-vue-v3.6.0) (2026-07-08)


### Bug Fixes

* 🐛 修复 trigger 嵌套的时候无法关闭的问题 ([dffee59](https://github.com/liunnn1994/sd-design/commit/dffee5943a76b609cba8e82a02dbbe8d08447e1f))
* 🐛 修复错误的 Vue runtime 引用，会导致在线编辑中的 vue 实例引用不是一个，触发意外错误 ([41bf83a](https://github.com/liunnn1994/sd-design/commit/41bf83ae61cdb452853f32f8cf95fc0afc2cf7c0))


### Features

* 🆕 使用Image组件预览图片，videojs预览音视频 ([14735ee](https://github.com/liunnn1994/sd-design/commit/14735ee3a881bbd7be71890d1b8ea01a31817712))

# [3.5.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.4.0...web-vue-v3.5.0) (2026-07-08)

### Features

- 🆕 移除 toolbar 的背景色 ([7074fdc](https://github.com/liunnn1994/sd-design/commit/7074fdcbb6ad75ce8f4a02767dfd840418c5cebc))

# [3.4.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.3.1...web-vue-v3.4.0) (2026-07-08)

### Bug Fixes

- 🐛 tag 最小有一个字符的宽度 ([84b7c8c](https://github.com/liunnn1994/sd-design/commit/84b7c8cebd31199df84e06ccfb35667ec7ce323d))
- 🐛 修复 table 错误的高度处理 ([70d068f](https://github.com/liunnn1994/sd-design/commit/70d068fdc4d9f83a0b6be839c70c927014841110))

### Features

- 🆕 table 使用全新的虚拟滚动，现已支持树形等复杂结构 ([76e43a4](https://github.com/liunnn1994/sd-design/commit/76e43a47f68449ff1e271dea632dbf5566d652ea))
- 🆕 重构虚拟列表，使用 virtua 替换 vue-virtual-scroller ([816cc59](https://github.com/liunnn1994/sd-design/commit/816cc59662d6ea9aa57034cf5496771ee98222b8))

## [3.3.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.3.0...web-vue-v3.3.1) (2026-07-07)

### Bug Fixes

- 🐛 修复错误的文字颜色 ([b5b3234](https://github.com/liunnn1994/sd-design/commit/b5b32348c981610fbb61efce3c037fe453b56a1e))

# [3.3.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.2.1...web-vue-v3.3.0) (2026-07-07)

### Bug Fixes

- 🐛 修复 color-picker 颜色切换无效的问题 ([23926ad](https://github.com/liunnn1994/sd-design/commit/23926ad0cadb702eeafb1e469d0f0fe1415aeab8))
- 🐛 修复tagProps没有后正确使用的问题 ([659c91d](https://github.com/liunnn1994/sd-design/commit/659c91d347ac0728e9727feb386ab9536d7a7e22))

### Features

- 🆕 message的resetOnHover默认是true ([f2dcdbc](https://github.com/liunnn1994/sd-design/commit/f2dcdbc006dff7422728e4db84b0e1c6256c4514))
- 🆕 tag 支持从 color 中自动提取透明度 ([7f3edca](https://github.com/liunnn1994/sd-design/commit/7f3edcaecce38083d53f97f0e159257bf541ec44))
- 🆕 优化 color-picker 性能，并避免快速拖拽时浏览器触发页面文字选中 ([38760c7](https://github.com/liunnn1994/sd-design/commit/38760c77057b0f14b1c84f44ac5445cb2785a134))
- 🆕 把文档从 netlify 迁移到 gh page ([a7143a4](https://github.com/liunnn1994/sd-design/commit/a7143a49eba3faba99d8664a7a4f887d67b2af62))
- 🆕 新 table 组件，对齐arcodesign ([fca78cb](https://github.com/liunnn1994/sd-design/commit/fca78cb5817b9a8f48a687a6736cb8ee4e6dfbc5))
- 🆕 新增 toolbar 组件 ([59d3485](https://github.com/liunnn1994/sd-design/commit/59d348578ac131b43ddb6da80f20a23918408da4))
- 🆕 新增全局配置 pagination ([43da319](https://github.com/liunnn1994/sd-design/commit/43da319027e87668d3e051d501c9fdc867e6b863))
- 🆕 新增全局配置 pagination ([aedf056](https://github.com/liunnn1994/sd-design/commit/aedf0563874b6fc9480932a808264120604e9ac4))

# [3.1.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.2...web-vue-v3.1.0) (2026-07-03)

### Bug Fixes

- 🐛 修复未导出的类型 ([5ef7e6d](https://github.com/liunnn1994/sd-design/commit/5ef7e6df7664d3a84b0669de6dcf61d1ce69d3cb))
- 🐛 修复测试用例报错 ([3c10669](https://github.com/liunnn1994/sd-design/commit/3c106699c2ca49abd7fa472e24dd2fd4f56d8f49))
- 🐛 修复滚动滚动条的问题 ([367c3f6](https://github.com/liunnn1994/sd-design/commit/367c3f6ebde8638eabe41d123c1e2ab4e06f40f4))

### Features

- 🆕 tree node 在block模式下是100% ([83912ea](https://github.com/liunnn1994/sd-design/commit/83912ea27ffdb1752238961d12b14e8d321e9c00))
- 🆕 透传 node 事件 ([a2bdf88](https://github.com/liunnn1994/sd-design/commit/a2bdf8834dfd07bf720ccce1e2f56ecb6d477eac))

## [3.0.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.1...web-vue-v3.0.2) (2026-07-03)

### Bug Fixes

- 🐛 修复 trigger 层级的问题 ([c703be3](https://github.com/liunnn1994/sd-design/commit/c703be3d4fc97be334b1144714043e973f13ddf9))

## [3.0.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.0.0...web-vue-v3.0.1) (2026-07-02)

### Bug Fixes

- 🐛 修复 json form 错误的 margin ([f3ba0d1](https://github.com/liunnn1994/sd-design/commit/f3ba0d1b6a714191b70cfa79930df5830682633b))

# [3.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.3...web-vue-v3.0.0) (2026-06-30)

### Features

- 🆕 修改 spin 的样式 ([44f0b53](https://github.com/liunnn1994/sd-design/commit/44f0b538f2ca79cae64bf73dbe4236caf66a6839))

### BREAKING CHANGES

- 🧨 spin 由 inline-block 改为 block

## [2.11.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.2...web-vue-v2.11.3) (2026-06-29)

### Bug Fixes

- 🐛 修复在线编辑器的自动导入无法识别部分组件的问题 ([2807ecb](https://github.com/liunnn1994/sd-design/commit/2807ecbcbab6a42e434cdb18a75bc85ccb4e6693))

## [2.11.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.1...web-vue-v2.11.2) (2026-06-29)

### Bug Fixes

- 🐛 修复错误的样式处理 ([3423331](https://github.com/liunnn1994/sd-design/commit/3423331861c6d846d5b639828a5489dad08c1d89))

## [2.11.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.11.0...web-vue-v2.11.1) (2026-06-25)

### Bug Fixes

- 🐛 修复错误的竟态 ([5d3efcb](https://github.com/liunnn1994/sd-design/commit/5d3efcbf1c7882954903cab6c2a3acb73af7354c))

# [2.11.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.2...web-vue-v2.11.0) (2026-06-25)

### Bug Fixes

- 🐛 修复错误的大小写 ([fed991f](https://github.com/liunnn1994/sd-design/commit/fed991f7bcc1b66fc377dec8d738484c01e5ce04))
- 🐛 修复首次启动文件缺失的问题 ([81dc32e](https://github.com/liunnn1994/sd-design/commit/81dc32e42744732645da59aa0996190f63c22df8))

### Features

- 🆕 优化 layout header 的默认按钮颜色 ([6ff7edc](https://github.com/liunnn1994/sd-design/commit/6ff7edc8eac3268f0d54611711266762d3d86f17))

## [2.10.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.1...web-vue-v2.10.2) (2026-06-25)

### Bug Fixes

- 🐛 修复header错误的颜色 ([cac77ae](https://github.com/liunnn1994/sd-design/commit/cac77ae162ce0fe0ed428f22050bc65d39487ac5))

## [2.10.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.10.0...web-vue-v2.10.1) (2026-06-25)

### Bug Fixes

- 🐛 CI 发布时跳过本地 pre-push 钩子 ([37a6e99](https://github.com/liunnn1994/sd-design/commit/37a6e9920300b791b2ade7b19052eb48e5ca0ddd))

# [2.10.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v2.9.0...web-vue-v2.10.0) (2026-06-25)

### Features

- 🆕 layout 添加 rail 模式 ([43ae0db](https://github.com/liunnn1994/sd-design/commit/43ae0dbdf0e1e17c434a60d0bf73e34cd47e4f3a))
- 🆕 文档站更新到 astro 7 ([606a140](https://github.com/liunnn1994/sd-design/commit/606a140300af766f8b26d3caab1f290f53853005))
- 🆕 隔离 web-vue 与 auto-import-resolver 的发布 tag 命名空间 ([95ad739](https://github.com/liunnn1994/sd-design/commit/95ad7393ae2dfc9ea4fcdf040a38b43b2016e906))

# [2.9.0](https://github.com/liunnn1994/sd-design/compare/v2.8.0...v2.9.0) (2026-06-23)

### Features

- 🆕 统一 layout 的 header 背景颜色 ([76796f3](https://github.com/liunnn1994/sd-design/commit/76796f3358e174d55ea15dd0bf8559cfe9ebc41e))

# [2.8.0](https://github.com/liunnn1994/sd-design/compare/v2.7.0...v2.8.0) (2026-06-23)

### Features

- 🆕 更新依赖 ([a014966](https://github.com/liunnn1994/sd-design/commit/a014966faf938539e5bff78b334af2d40efc135f))

# [2.6.0](https://github.com/liunnn1994/sd-design/compare/v2.5.0...v2.6.0) (2026-06-22)

### Bug Fixes

- 🐛 修复 lint 警告 ([5842e17](https://github.com/liunnn1994/sd-design/commit/5842e17389e110aa78d522f6b552cd54553672a7))

### Features

- 🆕 全新的 layout，对齐 antd ([85a8cb8](https://github.com/liunnn1994/sd-design/commit/85a8cb84bf7601527262f7fd2a1aaeab35d570c9))
- 🆕 统一主题获取，消除重复性 ([d2c0d47](https://github.com/liunnn1994/sd-design/commit/d2c0d47d4f09a96c5b5cdff97bd5eda730b9654f))

## [2.3.1](https://github.com/liunnn1994/sd-design/compare/v2.3.0...v2.3.1) (2026-06-15)

### Bug Fixes

- 🐛 修复自动导入工具无效的问题 ([45eaaf7](https://github.com/liunnn1994/sd-design/commit/45eaaf721699c8027edf0ec1541c404efb0a0be2))

## [2.2.1](https://github.com/liunnn1994/sd-design/compare/v2.2.0...v2.2.1) (2026-06-11)

### Bug Fixes

- 🐛 修复打包失败的问题 ([590a3cd](https://github.com/liunnn1994/sd-design/commit/590a3cd0715fa49cd2ed2e4ff55cd108a129ea3b))

## [2.1.1](https://github.com/liunnn1994/sd-design/compare/v2.1.0...v2.1.1) (2026-06-09)

### Bug Fixes

- 🐛 修复 ts 报错 ([cf2f1ac](https://github.com/liunnn1994/sd-design/commit/cf2f1ac4a9b9166e927255fc547a054c40930348))
- 🐛 修复 ts 的类型 ([e76e685](https://github.com/liunnn1994/sd-design/commit/e76e68536c4a97181f3b4549c4a98a24751bb68d))

# [2.1.0](https://github.com/liunnn1994/sd-design/compare/v2.0.0...v2.1.0) (2026-06-09)

### Features

- 🆕 去掉option组件 ([74283d9](https://github.com/liunnn1994/sd-design/commit/74283d9adfb312c241509a035dd85511e04f716c))

# [1.19.0](https://github.com/liunnn1994/sd-design/compare/v1.18.0...v1.19.0) (2026-05-21)

### Features

- 🆕 去掉首页的侧边栏 ([c0ee6c3](https://github.com/liunnn1994/sd-design/commit/c0ee6c3f9c9a7d3e2001e3ce262b42ae09da1f46))

# [1.18.0](https://github.com/liunnn1994/sd-design/compare/v1.17.0...v1.18.0) (2026-05-21)

### Features

- 🆕 添加了 ai 工具说明 ([19b9ada](https://github.com/liunnn1994/sd-design/commit/19b9ada07f5125e4ef79bff25ec00871d2c877a4))

# [1.14.0](https://github.com/liunnn1994/sd-design/compare/v1.13.0...v1.14.0) (2026-05-19)

### Bug Fixes

- 🐛 修复 ts 报错 ([ce5b3c2](https://github.com/liunnn1994/sd-design/commit/ce5b3c2a1319bbf573968c132d20985b40d9bd0b))
- 🐛 修复 ts 报错 ([5156619](https://github.com/liunnn1994/sd-design/commit/5156619f189b6628cb9132ec5604509987f46277))

### Features

- 🆕 DatePicker 默认配置 ([a71ba18](https://github.com/liunnn1994/sd-design/commit/a71ba18bb4bd2913048f9ad683661316fabe9042))
- 🆕 新增自动导入插件 ([cc6fb54](https://github.com/liunnn1994/sd-design/commit/cc6fb54744d015c535d98636e02581cb6b3f7e42))
- 🆕 给 modal/drawer 添加全局配置 ([a81fff9](https://github.com/liunnn1994/sd-design/commit/a81fff99e566aa0d4a3808ab7c3434cb5ee155ff))

# [1.13.0](https://github.com/liunnn1994/sd-design/compare/v1.12.0...v1.13.0) (2026-05-19)

### Features

- 🆕 新增默认下拉虚拟滚动参数 ([5fabe49](https://github.com/liunnn1994/sd-design/commit/5fabe499adb899069b1213807de91e7f19582639))

# [1.12.0](https://github.com/liunnn1994/sd-design/compare/v1.11.1...v1.12.0) (2026-05-19)

### Bug Fixes

- 🐛 修复 css 不存在的问题 ([b13f58f](https://github.com/liunnn1994/sd-design/commit/b13f58fb52ff73a55292cbbae49bee5a2f5b1653))
- 🐛 修复 ts 报错 ([b0e43e4](https://github.com/liunnn1994/sd-design/commit/b0e43e409d2afbbb0597902fd553027fb1814379))
- 🐛 修复打包错误 ([d484da2](https://github.com/liunnn1994/sd-design/commit/d484da2b6c15b4188ac896173dddf92bd23ebdaa))

### Features

- 🆕 input number 新增字符串格式的支持 ([a0781f4](https://github.com/liunnn1994/sd-design/commit/a0781f4af9b23d3e1e0cbf9a1826b8f2f366a025))
- 🆕 link 支持 ellipsis 功能 ([b4a3faa](https://github.com/liunnn1994/sd-design/commit/b4a3faad4699443633d1280c12c368f5bbc2f32e))
- 🆕 tag 新增 ellipsis 支持，新增 tagGroup ([4f3eec1](https://github.com/liunnn1994/sd-design/commit/4f3eec192392fda1eff7d543839189c83629f783))
- 🆕 为 copy 添加参数透传 ([eac34d2](https://github.com/liunnn1994/sd-design/commit/eac34d28950bbebf5751807675ef672930b988cb))
- 🆕 新增 copy 组件 ([abc7f71](https://github.com/liunnn1994/sd-design/commit/abc7f716c087378d12ad8174a6681f32a01f22e1))
- 🆕 新增 cropper 组件 ([5836775](https://github.com/liunnn1994/sd-design/commit/5836775e97006df825ceb87191c71ef80a4aa0e1))
- 🆕 添加 llms.txt ([f7728d0](https://github.com/liunnn1994/sd-design/commit/f7728d060de8f9b257fba80dd5bad8cb826b7ea6))
- 🆕 添加 secret 组件 ([8baa016](https://github.com/liunnn1994/sd-design/commit/8baa016b3da76ac907d46ef469573d4b14bfab93))
- 🆕 添加全局 allow-search ([2816edd](https://github.com/liunnn1994/sd-design/commit/2816edd6368c12b4cffb2958b11fbdc6c35d935a))
- 🆕 组件改为 setup 写法 ([282678b](https://github.com/liunnn1994/sd-design/commit/282678bce6a34512d3656bf215d7cfd0c13bdf2c))

## [1.11.1](https://github.com/liunnn1994/sd-design/compare/v1.11.0...v1.11.1) (2026-05-16)

### Bug Fixes

- 🐛 修复 ts 和错误导入 react 的问题 ([3518677](https://github.com/liunnn1994/sd-design/commit/3518677a09d1a96f1198c462a345a9caca2761f0))
- 🐛 修复错误的引入 react 的问题 ([5b790a0](https://github.com/liunnn1994/sd-design/commit/5b790a01c3fe1054c618645f763e038d80eddad3))

# [1.11.0](https://github.com/liunnn1994/sd-design/compare/v1.10.0...v1.11.0) (2026-05-16)

### Bug Fixes

- 🐛 修复 table 固定列的问题 ([26d4dcd](https://github.com/liunnn1994/sd-design/commit/26d4dcd5eae33a01f4718b813494a454c36cecef))
- 🐛 修复 ts 报错 ([31880dc](https://github.com/liunnn1994/sd-design/commit/31880dc15596465cd4272039a84dae5ce31d58c3))
- 🐛 修复 ts 报错 ([ea5166e](https://github.com/liunnn1994/sd-design/commit/ea5166ea6b68cd079009d0fffccdaf1c8c2d461a))

### Features

- 🆕 优化所有 less 遗留 ([8513187](https://github.com/liunnn1994/sd-design/commit/8513187d734703cdbb8345750438c335a7f2daf9))

# [1.10.0](https://github.com/liunnn1994/sd-design/compare/v1.9.0...v1.10.0) (2026-05-12)

### Bug Fixes

- 🐛 修复打包报错 ([d16773c](https://github.com/liunnn1994/sd-design/commit/d16773cf404004aba1030822fa74bbed74bde69f))

### Features

- 🆕 使用 ts7 并修复 ts 报错 ([667fb96](https://github.com/liunnn1994/sd-design/commit/667fb96b73d17cc2e098bf960cf826db06a8ad67))
- 🆕 迁移 cascader ([3242fdb](https://github.com/liunnn1994/sd-design/commit/3242fdbe3ca558d7b6e5392bf5c5df2c9c92a73b))
- 🆕 迁移 scrollbar ([563830b](https://github.com/liunnn1994/sd-design/commit/563830bf9d49228c85d4f0f042e87dff99b349c0))
- 🆕 迁移虚拟列表 ([098b1c9](https://github.com/liunnn1994/sd-design/commit/098b1c9e8cefe2f7dd3d18d339e712d259652224))

# [1.9.0](https://github.com/liunnn1994/sd-design/compare/v1.8.0...v1.9.0) (2026-05-08)

### Features

- 🆕 迁移 select ([b0102fa](https://github.com/liunnn1994/sd-design/commit/b0102faad9f0d4ad580b193e51d45f3f6baf72d4))
- 🆕 迁移 select 和 tree-select ([9997da2](https://github.com/liunnn1994/sd-design/commit/9997da2175b5d93bc8f11d9b9b5678ca5730cff9))

# [1.8.0](https://github.com/liunnn1994/sd-design/compare/v1.7.1...v1.8.0) (2026-05-07)

### Features

- 🆕 新增 allowClear 全局配置 ([368f106](https://github.com/liunnn1994/sd-design/commit/368f1064b3a47ea97a1bfc6a3098d2ba259be7e2))
- 🆕 新增 color-picker ([54e12e9](https://github.com/liunnn1994/sd-design/commit/54e12e9bd77d6aafa70c9ab60d7ff3029e920139))

## [1.7.1](https://github.com/liunnn1994/sd-design/compare/v1.7.0...v1.7.1) (2026-04-30)

### Bug Fixes

- 🐛 修复局部主题会影响到全局的问题 ([10a8f46](https://github.com/liunnn1994/sd-design/commit/10a8f4697a7e30d7121d0105920630c675b637f8))

# [1.7.0](https://github.com/liunnn1994/sd-design/compare/v1.6.0...v1.7.0) (2026-04-30)

### Features

- 🆕 使用 scss 替换 less ([552728f](https://github.com/liunnn1994/sd-design/commit/552728fcb033d26a68eaa45bab94fe4e6050341c))
- 🆕 添加主题的切换以及演示 ([c467c13](https://github.com/liunnn1994/sd-design/commit/c467c1395f8610439c305141578ee544cd147142))

# [1.6.0](https://github.com/liunnn1994/sd-design/compare/v1.5.0...v1.6.0) (2026-04-21)

### Features

- 🆕 改用 Trusted publishing ([394a570](https://github.com/liunnn1994/sd-design/commit/394a570da537caee6bc53b911f9fa70b844fed7c))

# [1.5.0](https://github.com/liunnn1994/sd-design/compare/v1.4.1...v1.5.0) (2026-04-16)

### Features

- 🆕 新增 ellipsis 组件 ([4b7d562](https://github.com/liunnn1994/sd-design/commit/4b7d56275ba948befd92a7bfc5e55c1a39eec085))

## [1.4.1](https://github.com/liunnn1994/sd-design/compare/v1.4.0...v1.4.1) (2026-04-16)

### Bug Fixes

- 🐛 修复在线编辑器 ([804d0d3](https://github.com/liunnn1994/sd-design/commit/804d0d30a4a3a5e3a8bf9ef0391297d41d137830))

# [1.4.0](https://github.com/liunnn1994/sd-design/compare/v1.3.0...v1.4.0) (2026-04-16)

### Bug Fixes

- 🐛 修复 lint 问题 ([7f81320](https://github.com/liunnn1994/sd-design/commit/7f8132010628e0d976aec97448329a96e1d52b74))
- 🐛 修复在线编辑功能报错的问题 ([1bf5879](https://github.com/liunnn1994/sd-design/commit/1bf5879a52e22bb1fe6c64a14772c3e845a009d9))

### Features

- 更新架构，使用 vite+，同时把 jest 的测试用例迁移到 vitest 上 ([990b5e4](https://github.com/liunnn1994/sd-design/commit/990b5e48602b8dca3b6cb95982ffb7287173bd97))

# [1.3.0](https://github.com/liunnn1994/sd-design/compare/v1.2.0...v1.3.0) (2026-04-14)

### Features

- 移除 scripts 减少复杂度 ([655ee6c](https://github.com/liunnn1994/sd-design/commit/655ee6cdf622325ea738a6b233a7a7104d569092))

# [1.2.0](https://github.com/liunnn1994/sd-design/compare/v1.1.0...v1.2.0) (2026-04-14)

### Features

- 使用新文档 ([3619a7b](https://github.com/liunnn1994/sd-design/commit/3619a7b6ad453cfa645a6923e63f1f7d79cb55e1))

# [1.1.0](https://github.com/liunnn1994/sd-design/compare/v1.0.0...v1.1.0) (2026-04-14)

### Features

- 🆕 文档部署使用 netlify.toml 流水线 ([5663b1e](https://github.com/liunnn1994/sd-design/commit/5663b1ebaf9df7886c147148fc4fb06dde1573c3))
