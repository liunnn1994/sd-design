# [6.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.9.0...web-vue-v6.0.0) (2026-10-06)


### Features

* 🆕 整合Split组件和PanelGroup ([8105d50](https://github.com/liunnn1994/sd-design/commit/8105d50b4511e27d670bf53e0ef35526b83eff7e))


### BREAKING CHANGES

* Split组件已经移除

# [5.9.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.7...web-vue-v5.9.0) (2026-10-06)


### Features

* 🆕 色阶算法本地化 ([3d63538](https://github.com/liunnn1994/sd-design/commit/3d63538681cd9605284c3cffc3f862ce93f95eb1))
* 🆕 迁移拖拽排序组件 ([b7120e8](https://github.com/liunnn1994/sd-design/commit/b7120e8c4b1a2436082645353d9a38ed8ad50b88))

## [5.8.7](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.6...web-vue-v5.8.7) (2026-10-06)


### Bug Fixes

* 🐛 修复 radio 样式 ([084bf3b](https://github.com/liunnn1994/sd-design/commit/084bf3b823305069a3063317f9c5b69d0fbc2965))
* **cascader:** 修正列上下文注入的可选类型 ([3d19d7d](https://github.com/liunnn1994/sd-design/commit/3d19d7d4097a20c73fe7b5aca7eddfeae50e639d))
* **docs:** 修复滚动条验证码输入框和浮层示例的样式覆盖 ([7ed0d17](https://github.com/liunnn1994/sd-design/commit/7ed0d17c17da59a9aab254f418b78c576b60a303))
* **docs:** 恢复复选和单选卡片的选中样式 ([4bdcd38](https://github.com/liunnn1994/sd-design/commit/4bdcd3896fdc56b5f941e9c8d2629f14eb21e015))
* **docs:** 预构建媒体预览和裁剪器依赖以避免加载时出现504 ([1aa63e5](https://github.com/liunnn1994/sd-design/commit/1aa63e5f3671e0dffde7e9fea469833a3ba9cb5a))
* **form:** 保留无错误提示文案时的表单项间距 ([564c7fa](https://github.com/liunnn1994/sd-design/commit/564c7faad194a3f8ad201913fc08555e25320f0a))
* **layout:** 修复嵌套侧栏导致外层布局方向错误 ([ae5176b](https://github.com/liunnn1994/sd-design/commit/ae5176b2534543867b1af88d44561df22bb06ab6))
* **layout:** 完善固定头部示例的滚动区域和文字对比度 ([0abdce3](https://github.com/liunnn1994/sd-design/commit/0abdce357c31f22688887e7064732e7243ecfe48))
* **panel-group:** 修复快速拖拽松手时尺寸回弹 ([b34a943](https://github.com/liunnn1994/sd-design/commit/b34a943a1bcfe9a9f86adb76ce8f3c5e9beba96f))
* **progress:** 修复渐变进度条示例的颜色变量 ([b2b2995](https://github.com/liunnn1994/sd-design/commit/b2b2995e8a390b2235b81e544213e106ef00ad34))
* **select:** 约束级联列宽和树选择弹层以恢复文本省略 ([599dd76](https://github.com/liunnn1994/sd-design/commit/599dd7684c50583a8b8260ced4bfd3ab0d4351ad))
* **sender:** 清理被取消的展开动画以避免状态回写错乱 ([98d4ea4](https://github.com/liunnn1994/sd-design/commit/98d4ea492b730603f8c9e1dc63389f9e2682882c))
* **sender:** 补全功能开关的输入与提交示例 ([5bb7bc6](https://github.com/liunnn1994/sd-design/commit/5bb7bc611a8fe87f16302b8df618c2ca0b0ab2c3))
* **table:** 移除整行拖拽并保留锚点拖拽排序 ([857c38b](https://github.com/liunnn1994/sd-design/commit/857c38bc4c3251908cf997ef0c32e3ea686bf088))
* **table:** 让空拖拽配置默认使用锚点模式 ([995fa5e](https://github.com/liunnn1994/sd-design/commit/995fa5e7c8146ceba30e296a2708628c0250117b))
* **trigger:** 恢复弹层示例的背景颜色 ([15f06db](https://github.com/liunnn1994/sd-design/commit/15f06dbb1cf22d427707352662522290bfa103fa))
* **voice-glow:** 隔离示例卡片样式并修复浅色背景 ([c59f83a](https://github.com/liunnn1994/sd-design/commit/c59f83a34d2f88ee3df2161ad7e0192b86b7f837))

## [5.8.6](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.5...web-vue-v5.8.6) (2026-10-06)


### Bug Fixes

* **affix:** 修复固定内容尺寸变化后占位高度不更新 ([ab5e4bb](https://github.com/liunnn1994/sd-design/commit/ab5e4bbcce3d8d79c29da124dde860c7774da0c3))
* **anchor:** 恢复横向布局并补齐固钉按需样式 ([f08f565](https://github.com/liunnn1994/sd-design/commit/f08f565dd7e9b4a7650cebc0ea87e34558243a29))
* **avatar:** 同步替换后的默认插槽内容与图片样式 ([ccbda27](https://github.com/liunnn1994/sd-design/commit/ccbda27f5a395a02bb96edebe15c38d0afdea022))
* **bloom-menu:** 修复展开后修改偏移量不更新定位 ([83d3624](https://github.com/liunnn1994/sd-design/commit/83d3624d1c026b5b8239e05a9662f4be75565746))
* **calendar:** 修复横向周视图隐藏星期后渲染失败 ([38f108f](https://github.com/liunnn1994/sd-design/commit/38f108f86122601e7f7e83011dbf574a237a4d91))
* **calendar:** 切换事件日程后重新计算重叠宽度 ([d959540](https://github.com/liunnn1994/sd-design/commit/d95954027817b8c99d53fd7da7052f461d8be4d4))
* **calendar:** 外部拖入事件时同步目标全天状态 ([c9a9b05](https://github.com/liunnn1994/sd-design/commit/c9a9b05bff4b004055a8755487e59fb78d72062c))
* **calendar:** 松开指针后取消事件长按计时器 ([bdbc32b](https://github.com/liunnn1994/sd-design/commit/bdbc32bd477d4e7e58c72d839523e411be61670e))
* **calendar:** 避免旧语言加载结果覆盖最新语言 ([0bae82f](https://github.com/liunnn1994/sd-design/commit/0bae82f6725586f3e7f59d75dad794ec30238e74))
* **cascader:** 阻止只读状态下的值修改 ([94fc6d7](https://github.com/liunnn1994/sd-design/commit/94fc6d72c65dcc9854764c6e408001fb7665643c))
* **color-picker:** 避免回车重复提交颜色 ([8a0df57](https://github.com/liunnn1994/sd-design/commit/8a0df57c0db7b4f637477274b90f455c0c24d2d0))
* **copy:** 补齐按钮和链接属性透传 ([2dd019a](https://github.com/liunnn1994/sd-design/commit/2dd019ad83c9b828ca24c5ca3a3d73f9a5e38abb))
* **cropper:** 修正图片缩小时的选区尺寸 ([bfd46fd](https://github.com/liunnn1994/sd-design/commit/bfd46fd31de1d54e3383ebf8132dead37524b7ca))
* **date-picker:** 保留自定义只读提示文案 ([574832f](https://github.com/liunnn1994/sd-design/commit/574832f1bcf8a618e5d7051378b21253220db0e4))
* **date-picker:** 周选择器继承全局首日配置 ([22d40f1](https://github.com/liunnn1994/sd-design/commit/22d40f1b8294e1d966331f0770b25a434fc63c45))
* **dropdown:** 阻止禁用按钮通过悬停打开菜单 ([fed0fec](https://github.com/liunnn1994/sd-design/commit/fed0fec7f6f21ee2caaf60e5a3041c280539c361))
* **image:** 保留预览自定义操作区的输入和焦点 ([81cfc85](https://github.com/liunnn1994/sd-design/commit/81cfc855936e7e2c34428f4dd25e5cd63418f37a))
* **input-number:** 卸载时清理长按步进定时器 ([81a1f49](https://github.com/liunnn1994/sd-design/commit/81a1f490e09f6cec89e5d29922f128e48d1ab707))
* **json-form:** 保留列宽为零的配置 ([348e64e](https://github.com/liunnn1994/sd-design/commit/348e64e4f19bad12fe4ef84fb56eecd83c923419))
* **list:** 挂载时使用实际滚动视口判断触底 ([0aa8d2b](https://github.com/liunnn1994/sd-design/commit/0aa8d2bd04e09a2a0dc7d6cff34148558d40f2a8))
* **markdown-render:** 保留内联空白并配对图片加载状态 ([ae61f69](https://github.com/liunnn1994/sd-design/commit/ae61f69ac04628efb4ce4f77477ce3e5b8053a29))
* **mention:** 正确读取文本域节点并同步定位样式 ([7e46ffc](https://github.com/liunnn1994/sd-design/commit/7e46ffc6c1795dc93dfc69f5ced1e8daaabacada))
* **mention:** 释放已移除选项的节点引用 ([62119fd](https://github.com/liunnn1994/sd-design/commit/62119fd84f2082c70278af7502e50020d774cb69))
* **menu:** 使用父菜单键上报嵌套弹层数据 ([dbd043e](https://github.com/liunnn1994/sd-design/commit/dbd043e8aec8d22b20ca0945dc8caa003c658ec3))
* **message:** 支持键盘关闭消息 ([98ecc92](https://github.com/liunnn1994/sd-design/commit/98ecc92a2d5568675938e0c92193ceb1364bfea8))
* **table:** 修复固定操作列偏移、分页拖拽和筛选标签渲染 ([7bb0cc8](https://github.com/liunnn1994/sd-design/commit/7bb0cc893870b43152ecc70881f178b20e1a478b))
* **time-picker:** 清理已移除选项的节点引用 ([3f00bce](https://github.com/liunnn1994/sd-design/commit/3f00bce1716724f2405c6191bee56c7a6d12beb2))
* **tour:** 关闭动画时直接显示气泡最终状态 ([28f3421](https://github.com/liunnn1994/sd-design/commit/28f34210ac3582611cb8891a3efac33f9025669a))
* **tree:** 修复虚拟列表键盘导航无法聚焦远端节点 ([c323a41](https://github.com/liunnn1994/sd-design/commit/c323a41c58ae3af4ab3639d15af85c3c4c3270e4))
* **typography:** 保持省略模式下组合文本样式的嵌套顺序 ([dfeed76](https://github.com/liunnn1994/sd-design/commit/dfeed767ac74e5fc9defa8d5a487e196b1d1d2cb))
* **watermark:** 修复错位水印透明度与逻辑对齐位置 ([dc9b81a](https://github.com/liunnn1994/sd-design/commit/dc9b81ada3af742bc2ac99a9ad01daf5511435fa))
* **web-vue:** 保留隐藏挂载分割面板的默认尺寸 ([2f55df9](https://github.com/liunnn1994/sd-design/commit/2f55df980d8912720204da06cb0785dc4305ed31))
* **web-vue:** 修复富文本下划线与删除线叠加显示 ([6ab5b74](https://github.com/liunnn1994/sd-design/commit/6ab5b74ae9720d12987f5265744df769329aa71d))
* **web-vue:** 修复模型选择器重排后的键盘导航顺序 ([7e278f7](https://github.com/liunnn1994/sd-design/commit/7e278f7e6e3bf5d0bb9a3102e2429c05aca9f410))
* **web-vue:** 修复负数范围滑块的默认高亮起点 ([2105621](https://github.com/liunnn1994/sd-design/commit/21056215bea54babbe89083caab49f5b34c79d56))
* **web-vue:** 修复通知关闭按钮的键盘操作 ([3ab7adf](https://github.com/liunnn1994/sd-design/commit/3ab7adf2126201b7d18b4b528c8f51de2f8c03fc))
* **web-vue:** 清理已卸载的选择器选项引用 ([9735d38](https://github.com/liunnn1994/sd-design/commit/9735d388460d4b1512e13c74e28becf15c20a981))
* **web-vue:** 统一开关继承小尺寸时的文本显示 ([215bf74](https://github.com/liunnn1994/sd-design/commit/215bf74561b1bd8372a9d015f20b2c7610ebec83))
* **web-vue:** 阻止数字动画在卸载后启动 ([212b7f2](https://github.com/liunnn1994/sd-design/commit/212b7f2933e4c89cbede84cc894f1a012006a1dd))
* **web-vue:** 阻止锁定词槽输入框通过快捷键换行 ([dd9e7f0](https://github.com/liunnn1994/sd-design/commit/dd9e7f069c7f376349e9f1ba2f14fe744b034100))
* 正确绑定对话框和抽屉的键盘关闭处理器 ([52e3d48](https://github.com/liunnn1994/sd-design/commit/52e3d48dbf7e3046479ed2d2743539a8922076cc))
* 补齐下拉按钮全局类型并移除虚拟列表空回调 ([8cb221e](https://github.com/liunnn1994/sd-design/commit/8cb221e910e36e8de11530d2ccbb51dbda84b256))

## [5.8.5](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.4...web-vue-v5.8.5) (2026-10-05)


### Bug Fixes

* **affix:** 修复切换滚动容器后固定位置未更新 ([d502c93](https://github.com/liunnn1994/sd-design/commit/d502c9314332a40c61af74c1a075220e49898520))
* **alert:** 修复动态标题插槽未同步布局样式 ([0d6bcde](https://github.com/liunnn1994/sd-design/commit/0d6bcde6efa6b823801053e1b989de99aa82c65f))
* **avatar:** 补齐头像组溢出弹层的按需样式 ([9794f14](https://github.com/liunnn1994/sd-design/commit/9794f147f83251956d31f5aa7e96b12001a1d4e2))
* **basic-crud-table:** 阻止过期提交误用重新打开的表单 ([501a5fd](https://github.com/liunnn1994/sd-design/commit/501a5fdeba0c3613db2419f30cab9b90a4474f1f))
* **calendar:** 修复日期更新边界并清理卸载手势资源 ([fa65db3](https://github.com/liunnn1994/sd-design/commit/fa65db356431cd66db4290803214aae2ccc88375))
* **card:** 同步动态操作插槽到已挂载的元信息 ([c10239c](https://github.com/liunnn1994/sd-design/commit/c10239c14b1bf48f286cc3cab1a952bb017306aa))
* **cascader:** 修复动态浮层属性与搜索路径分隔符 ([d52b0f2](https://github.com/liunnn1994/sd-design/commit/d52b0f2e49cd10402995be261d39a9f9eef6e916))
* **color-picker:** 同步受控浮层与触发器展开状态 ([7b4178b](https://github.com/liunnn1994/sd-design/commit/7b4178bba6896163c4b8ea9d9d25a73d9c32cb85))
* **components:** 保留禁用 hover 外观时的点击转发 ([1972349](https://github.com/liunnn1994/sd-design/commit/197234945f1e58e1ddc779dd72f7be62644b2cd0))
* **components:** 修复禁用图标、空日期草稿及虚拟列表尺寸校验 ([180a154](https://github.com/liunnn1994/sd-design/commit/180a15477cd229bb23b74982a1ce390dfb7f8c6f))
* **components:** 将上游内部标识统一为 sd 前缀 ([93eeeb3](https://github.com/liunnn1994/sd-design/commit/93eeeb3ebf2953c5b68749315d8f4f23ab2ee4af))
* **config-provider:** 同步动态配置插槽到已挂载组件 ([2673f0d](https://github.com/liunnn1994/sd-design/commit/2673f0dfbec6b933f7256df0c85de41e6619d44c))
* **cropper:** 阻止销毁后重新注册图片加载监听 ([e1d7c1d](https://github.com/liunnn1994/sd-design/commit/e1d7c1dd70256ce59f02c2edbe1aa284bca9976a))
* **date-picker:** 修复配置继承与动态面板状态 ([be34bf2](https://github.com/liunnn1994/sd-design/commit/be34bf2fd2a454c2230c60326debb48ddbfb2a29))
* **drawer:** 修复嵌套弹层焦点与滚动锁释放 ([da1a17b](https://github.com/liunnn1994/sd-design/commit/da1a17b57627b0344b6050d3d2431b728f9883a9))
* **dropdown:** 修复空节点与数组子节点解析 ([43c6f60](https://github.com/liunnn1994/sd-design/commit/43c6f60e961bc47151fe7e7895ca8f179ce29d1c))
* **ellipsis:** 修复嵌套测量与懒加载行数回退 ([3dd59f1](https://github.com/liunnn1994/sd-design/commit/3dd59f16387a3934dfa4ff16d0537d8902351f6a))
* **file-previewer:** 修复媒体初始化与共享资源释放 ([a5cd4b9](https://github.com/liunnn1994/sd-design/commit/a5cd4b97c344cda712a5fc638a0665cdd32bdceb))
* **form:** 防止旧校验覆盖手动设置的字段状态 ([3fad16f](https://github.com/liunnn1994/sd-design/commit/3fad16fe0231f10888128b08cad7900cce3c1223))
* **grid:** 对齐双向间距的公开类型 ([5693a10](https://github.com/liunnn1994/sd-design/commit/5693a10d2c6246f3f868a238224425bf6f6bab63))
* **hooks:** 释放重复弹层与滚动锁并跟踪根主题变化 ([d98e599](https://github.com/liunnn1994/sd-design/commit/d98e599a269fd29be19d35ab1aa843694172ecf1))
* **image:** 修复动态页脚与预览键盘堆叠及服务端图片地址 ([3173d38](https://github.com/liunnn1994/sd-design/commit/3173d38c6a05d0bb34d0fb8d19870fdc8ba0aac7))
* **input-mask:** 修复数组掩码多字符字面量解析 ([31f8143](https://github.com/liunnn1994/sd-design/commit/31f81433b830ad2cea5409e28fb65a3d64b85f7d))
* **input-number:** 保持格式化字符串的高精度步进 ([ca34da9](https://github.com/liunnn1994/sd-design/commit/ca34da98e48b5b08d256a76ab37e90baa6305dcb))
* **input-tag:** 修复动态插槽与折叠标签身份冲突 ([ae4533e](https://github.com/liunnn1994/sd-design/commit/ae4533e38d2476456a6483a61b8fad0d6ce21e95))
* **input:** 修复动态插槽布局与密码框样式 ([5f85b34](https://github.com/liunnn1994/sd-design/commit/5f85b34468c5b11b62e3d61745233d84513bfab5))
* **json-form:** 修复动态插槽与事件配置类型 ([f295efe](https://github.com/liunnn1994/sd-design/commit/f295efec99681ec64f9329c2161b5cdbe75c8c05))
* **layout:** 修复侧栏注册冲突与动态插槽检测 ([4a1efb1](https://github.com/liunnn1994/sd-design/commit/4a1efb191650a32a23b825dc1ebd18958a6dd7d1))
* **link:** 修复动态正文与图标插槽状态 ([ccc2b45](https://github.com/liunnn1994/sd-design/commit/ccc2b45161763516d49ab0b12541af5d4d216ec4))
* **list:** 修复动态内容与栅格分页渲染 ([b45e507](https://github.com/liunnn1994/sd-design/commit/b45e50782628790ca7b1296be44ed84fb8ed72c7))
* **locale:** 修复语言注册表特殊键与响应式更新 ([38c5ce2](https://github.com/liunnn1994/sd-design/commit/38c5ce2502971459384bced9c08cc777fe9b538d))
* **mention:** 修复受控选中与候选列表状态 ([4cbf809](https://github.com/liunnn1994/sd-design/commit/4cbf8096f31c5e2e7374041f06fba10e445c47eb))
* **menu:** 修复动态插槽与嵌套菜单移除状态 ([036a66a](https://github.com/liunnn1994/sd-design/commit/036a66a42b32d0a71fb87886371367a44b8bde12))
* **message:** 修复消息标识与关闭生命周期 ([9a08331](https://github.com/liunnn1994/sd-design/commit/9a0833191484f930ae973a138129f92f6aa9700a))
* **modal:** 修复零偏移与销毁后的关闭句柄 ([1d7319a](https://github.com/liunnn1994/sd-design/commit/1d7319a6567f130a1e1daf35039265c4e1d150b2))
* **model-selector:** 修复动态受控状态与键盘选择生命周期 ([7d59e71](https://github.com/liunnn1994/sd-design/commit/7d59e716340ff0e7ace4223868bc0533cb876012))
* **notification:** 修复标识与关闭生命周期并补齐计时配置类型 ([778aa4f](https://github.com/liunnn1994/sd-design/commit/778aa4f4757b6af8db992d42ff35627a928c93e1))
* **number-flow:** 同步动态前后缀与重新启用的动效偏好 ([5c0f76d](https://github.com/liunnn1994/sd-design/commit/5c0f76dd6a8f2fac006e2c24359a01b63b9a7244))
* **pagination:** 避免受控页大小重复调整并保持禁用状态 ([3155de6](https://github.com/liunnn1994/sd-design/commit/3155de6b927b38dc81fe4fd5e2b3f7300adcbeb4))
* **panel-group:** 容器缩放后同步分隔杆尺寸边界 ([3bc9007](https://github.com/liunnn1994/sd-design/commit/3bc900759dee249f00fb5aa8c9abd975f828bc9a))
* **popconfirm:** 受控关闭后使旧异步确认失效 ([cc7de35](https://github.com/liunnn1994/sd-design/commit/cc7de358be613cd56f112805b9a22f41891d0778))
* **popover:** 移除被覆盖的圆角 token 赋值 ([306d842](https://github.com/liunnn1994/sd-design/commit/306d8420dbf8fd0bc802f3cbb87bc31a164a7043))
* **progress:** 正确应用数字宽度与显式线宽 ([2ba43d3](https://github.com/liunnn1994/sd-design/commit/2ba43d3914ceefa565a318a8b10ca1fbacee8e99))
* **qr-code:** 同步动态图标插槽容器 ([647be31](https://github.com/liunnn1994/sd-design/commit/647be3135223efa396b0a95f21f6d8c9c59c0604))
* **radio:** 受控更新未采纳时恢复整组原生选中态 ([6cc080c](https://github.com/liunnn1994/sd-design/commit/6cc080c76284cd8e32147c10d98b6588592ed69d))
* **rate:** 禁用或只读后清除悬停评分预览 ([01d00ec](https://github.com/liunnn1994/sd-design/commit/01d00eca8135dd37e64a21345677ce0f42112508))
* **regex-vis:** 正确解析 Unicode 代理项转义对 ([349bf03](https://github.com/liunnn1994/sd-design/commit/349bf03ca80e296965a7d9e28a52d7777db3ed3b))
* **rich-text-editor:** 修复外部同步编辑事件及空内容和节点兜底 ([a2c746d](https://github.com/liunnn1994/sd-design/commit/a2c746df9456c1b53ee26bd93e92e7665c226c95))
* **scrollbar:** 修复初始化事件和动态尺寸更新并对齐样式类型 ([1aa4e82](https://github.com/liunnn1994/sd-design/commit/1aa4e822ce5a2c2bcdd7021434b810155702a5c4))
* **selectable-card:** 避免嵌套标签触发卡片选择 ([393f2eb](https://github.com/liunnn1994/sd-design/commit/393f2eb9a73083f8cd206949d51c03cad92ec429))
* **select:** 修复状态同步和只读边界及异步监听器清理 ([2e43c4f](https://github.com/liunnn1994/sd-design/commit/2e43c4f11fd70a102f67803b68c0aaaaf6a812a2))
* **sender:** 修复受控切换和词槽同步及录音回调边界 ([d6e7f0b](https://github.com/liunnn1994/sd-design/commit/d6e7f0ba48de79471c53e5cc686c23d2185cb10d))
* **skeleton:** 避免默认样式覆盖较小的行间距 ([570caf7](https://github.com/liunnn1994/sd-design/commit/570caf7c36441823c55e5531c25d2a79afea3255))
* **slider:** 修复受控交互同步与拖动清理及位置精度 ([6cffe24](https://github.com/liunnn1994/sd-design/commit/6cffe2435aaaa8607ca200a38ff7b8837a7d2e04))
* **spin:** 修复动态插槽同步和重复加载延迟 ([7cb01f0](https://github.com/liunnn1994/sd-design/commit/7cb01f06c7d55d16449f108475ac431d38999114))
* **split:** 清理禁用拖动并恢复原有光标 ([1537daa](https://github.com/liunnn1994/sd-design/commit/1537daa883087d1e7da1192c9d70d3994adbbb70))
* **statistic:** 修复过期倒计时恢复和完成事件去重 ([ca041fd](https://github.com/liunnn1994/sd-design/commit/ca041fd80768812fc3029769c2effea651754801))
* **steps:** 修复动态重排和嵌套步骤索引 ([2b1c085](https://github.com/liunnn1994/sd-design/commit/2b1c0854896cef9c40638ba174b7efc32ac783ab))
* **switch:** 同步动态受控属性并清理自动加载状态 ([584ade8](https://github.com/liunnn1994/sd-design/commit/584ade8f2c607705617bbaf38fb1c5eb5d543f25))
* **table:** 修复动态状态、特殊标识及交互边界 ([9a97698](https://github.com/liunnn1994/sd-design/commit/9a976985a09f11e6011e37389a70b06c3b95a98d))
* **tabs:** 修复混合键标识、关闭引用及数字滚动配置 ([f8a15a3](https://github.com/liunnn1994/sd-design/commit/f8a15a3f5c21c490a12dce19da7fdc01d71f0087))
* **tag:** 修复动态插槽和键盘关闭并对齐分组字段类型 ([4bc7cea](https://github.com/liunnn1994/sd-design/commit/4bc7cea74e6f2e4b159c25eb27a12bd98327e053))
* **textarea:** 对齐字素长度限制和截断后的输入事件 ([80973b3](https://github.com/liunnn1994/sd-design/commit/80973b37de494b1e093594456a40ed1d7d4b19a9))
* **theme:** 按最终赋值去重主题目录与运行时包装 ([702136b](https://github.com/liunnn1994/sd-design/commit/702136b5ef4696bb7c10273d5a6712057e6e685c))
* **thinking-orb:** 修复负相位绘制和隐藏页面动画启动 ([b35f011](https://github.com/liunnn1994/sd-design/commit/b35f0112f7633e0a583fe245d260dbb721784155))
* **time-picker:** 修复面板锁定和非法步长循环 ([a27a260](https://github.com/liunnn1994/sd-design/commit/a27a2607b6dffcf1333ac422996873f71809139a))
* **timeline:** 修复动态节点顺序和横向标签间距 ([6614b68](https://github.com/liunnn1994/sd-design/commit/6614b6807e36cdccb2b55e4193f2aa0e72b540ff))
* **toolbar:** 保持重置快照独立并保留特殊字段 ([d43e98b](https://github.com/liunnn1994/sd-design/commit/d43e98b918817af0da3b64f1f937d7385e36077f))
* **tour:** 修复关闭权限和高亮生命周期清理 ([cd0bbe3](https://github.com/liunnn1994/sd-design/commit/cd0bbe332c3533d2562ccf57177fa8a056296ce6))
* **transfer:** 同步动态插槽并守卫禁用全选 ([05e61da](https://github.com/liunnn1994/sd-design/commit/05e61dace4cf5825756575ba49d01fbb965cfae7))
* **tree-select:** 修复只读选择和浮层别名等边界问题 ([dde4750](https://github.com/liunnn1994/sd-design/commit/dde47504c1d741a0b0627bf47a3c01594a79295c))
* **tree:** 稳定节点标识并修复懒加载和展开边界 ([5cc0233](https://github.com/liunnn1994/sd-design/commit/5cc0233157a39f7df60ada46004d44ef7865aae5))
* **trigger:** 修复延迟触发取消和滚动及宽度同步边界 ([c47e398](https://github.com/liunnn1994/sd-design/commit/c47e39809a98cb0563ec8384d8496cbe3eaf8bd1))
* **typography:** 修复文本测量上下文和省略状态残留 ([0044a53](https://github.com/liunnn1994/sd-design/commit/0044a53788cafb85eb0510f0ab8c7a132375a2b1))
* **upload:** 修复列表身份、插槽更新及请求异常收尾 ([45c1bd3](https://github.com/liunnn1994/sd-design/commit/45c1bd38710826e6c7acb28af43569efaba304c0))
* **utils:** 修复特殊字符元素标识导致查询异常 ([d32df18](https://github.com/liunnn1994/sd-design/commit/d32df1861512e545e7efa4d9aa8606d40d00065b))
* **utils:** 修复补齐字符边界及嵌套组件索引偏移 ([c89c1de](https://github.com/liunnn1994/sd-design/commit/c89c1deb3c2107daf71a9f09476ee290d8b706ff))
* **verification-code:** 保留非受控输入并安全处理空焦点 ([cddc278](https://github.com/liunnn1994/sd-design/commit/cddc278d5b1a47b88eb580e335b8324d527e7a9e))
* **voice-glow:** 更新动态滤镜并收敛音频初始化异常 ([5498980](https://github.com/liunnn1994/sd-design/commit/549898079c8a627f6b3044a19a17b6eddfc3f79b))
* **watermark:** 修复空内容、文字对齐及观察器窗口选择 ([89fb510](https://github.com/liunnn1994/sd-design/commit/89fb510751a1d6ac253b83c59e647a326b21cee3))

## [5.8.4](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.3...web-vue-v5.8.4) (2026-10-05)


### Bug Fixes

* **avatar:** 修复交互图标负偏移样式失效 ([c046afb](https://github.com/liunnn1994/sd-design/commit/c046afbe6ab0b3827a0501403f0a2beef22ffc33))
* **badge:** 补齐数字样式依赖并修复 RTL 徽标位置 ([149efce](https://github.com/liunnn1994/sd-design/commit/149efcef66c644dbd5610378d1b3176ca8104127))
* **basic-crud-table:** 补齐按需样式依赖并更正新建弹窗说明 ([1faa200](https://github.com/liunnn1994/sd-design/commit/1faa20002dcab43d8d180e0f456add93c0fc2340))
* **bloom-menu:** 补齐按钮和弹层的按需样式依赖 ([31d1c76](https://github.com/liunnn1994/sd-design/commit/31d1c7600db3fb688e4b7cd6a34fd63208efb01a))
* **breadcrumb:** 补齐下拉菜单的按需样式依赖 ([b60785f](https://github.com/liunnn1994/sd-design/commit/b60785f16244735118367291b34bd45f0c50a8ad))
* **button:** 补齐提示弹层的按需样式依赖 ([c23f1ac](https://github.com/liunnn1994/sd-design/commit/c23f1ac2394f160d905034e9dbffd7c57b662901))
* **calendar:** 移除无作用的分支和样式报错残留 ([5236789](https://github.com/liunnn1994/sd-design/commit/52367893d85fefbd78d2f0d6df091d7173618bc0))
* **calendar:** 补齐省略文本样式并移除未使用的局部声明 ([3c7eae2](https://github.com/liunnn1994/sd-design/commit/3c7eae270954777a4eeeb8ffde4ece9b0498f994))
* **card:** 补齐滚动条的按需样式依赖 ([3475026](https://github.com/liunnn1994/sd-design/commit/3475026faa19105ab49aec5127a641d5a94b2c97))
* **carousel:** 移除未使用的 Sass 模块导入 ([371b4a2](https://github.com/liunnn1994/sd-design/commit/371b4a22b8df31edd18db36469c4d733dd4962de))
* **cascader:** 补齐弹层和加载样式并移除未使用的局部引用 ([f9b25e9](https://github.com/liunnn1994/sd-design/commit/f9b25e9323b267720c5954747e29c5c65c1f2421))
* **color-picker:** 补齐颜色模式切换按钮的按需样式 ([56f2131](https://github.com/liunnn1994/sd-design/commit/56f2131cbb853db6df574ac4d268fbc64ab8500c))
* **components:** 移除复选框和折叠面板未使用的插槽变量 ([b31951a](https://github.com/liunnn1994/sd-design/commit/b31951ab46676734418746f709e93d4f856c1045))
* **components:** 移除日期选择器和描述项的无用局部声明 ([80bd615](https://github.com/liunnn1994/sd-design/commit/80bd61533ca2eba6eb2bece30f4b69051e47efd0))
* **copy:** 补齐复制触发器与反馈的按需样式 ([ccb604f](https://github.com/liunnn1994/sd-design/commit/ccb604fbe1d12ac3c2cbc6eb687c23c12c465b27))
* **drawer:** 补齐标题省略组件的按需样式 ([6c5aac0](https://github.com/liunnn1994/sd-design/commit/6c5aac06ac4f01cb0e9e4abecafdc95a9b979f80))
* **dropdown:** 补齐按钮和空状态的按需样式 ([e2308c4](https://github.com/liunnn1994/sd-design/commit/e2308c4bd835925f225d27d82faf6ecc981760ae))
* **ellipsis:** 补齐省略文本提示框的按需样式 ([6224e96](https://github.com/liunnn1994/sd-design/commit/6224e96175c253b8b9644ab0af932a62cc43ec8c))
* **file-previewer:** 补齐图片预览的按需样式依赖 ([692d142](https://github.com/liunnn1994/sd-design/commit/692d14234f0464bb19e67240c75c7a862c1cac33))
* **form:** 补齐标签提示样式并移除无用局部绑定 ([1c74276](https://github.com/liunnn1994/sd-design/commit/1c74276a73ce61d4f858e40ab88dbf5f5732bb23))
* **icon:** 补齐按需入口的公共图标样式 ([1cc452b](https://github.com/liunnn1994/sd-design/commit/1cc452b652ea6ec97b53e49347b8b172b54570e3))
* **image:** 补齐操作提示样式并移除无用局部声明 ([779d892](https://github.com/liunnn1994/sd-design/commit/779d892dd268e162e755582550ba05f0c5d4dcb0))
* **input-tag:** 补齐只读提示样式并移除无用插槽绑定 ([d1ce837](https://github.com/liunnn1994/sd-design/commit/d1ce837515eb34cd090746aad54420295c3f7292))
* **input:** 补齐按需样式并修复组合边框负间距 ([3b3ec00](https://github.com/liunnn1994/sd-design/commit/3b3ec00c5bcd4909a05402c438a505a909d8c45b))
* **json-form:** 补齐表单和内置控件的按需样式依赖 ([c8ac262](https://github.com/liunnn1994/sd-design/commit/c8ac2629908fc59ac9d75161c69cfe56f61697f2))
* **kv-list:** 补齐键值编辑器的按需样式依赖 ([28d3d3e](https://github.com/liunnn1994/sd-design/commit/28d3d3e539b423b47d682ec9493c15e997700d7c))
* **layout:** 修复页脚收缩与反向触发器偏移并补齐样式 ([3d651de](https://github.com/liunnn1994/sd-design/commit/3d651de9edfbcbccda27913e4f552c2054d658a1))
* **link:** 补齐省略文本和图标提示的按需样式 ([185c7f4](https://github.com/liunnn1994/sd-design/commit/185c7f4608431472be0cbc630c349ef4662e60e0))
* **markdown-render:** 保留子组件的完整按需样式依赖 ([11ed3bc](https://github.com/liunnn1994/sd-design/commit/11ed3bcea5d6a1335577654871596e7dde57304a))
* **menu:** 修复水平菜单负偏移并移除无用局部绑定 ([26b1559](https://github.com/liunnn1994/sd-design/commit/26b15599e4195e076ac48bde778b75b0c3afc96f))
* **modal:** 补齐标题省略组件的按需样式 ([45e70a0](https://github.com/liunnn1994/sd-design/commit/45e70a07ccf7acccfac409d7c9f636049ea7e593))
* **model-selector:** 补齐内部控件的按需样式依赖 ([8e5eaba](https://github.com/liunnn1994/sd-design/commit/8e5eabae16575e12dbb04f576746450b1c027912))
* **pagination:** 补齐页码跳转框的按需样式依赖 ([f7a68f9](https://github.com/liunnn1994/sd-design/commit/f7a68f9a1b08d206fb0ea06d64e35876fd50edd4))
* **progress:** 移除已废弃的文本计算注释代码 ([b5cba84](https://github.com/liunnn1994/sd-design/commit/b5cba84b72229d4329ebdaad9207bf93b9f58c39))
* **radio:** 移除未使用的插槽返回值绑定 ([cbdd239](https://github.com/liunnn1994/sd-design/commit/cbdd239a0f9bba100cb649e49044aae51cd86743))
* **regex-vis:** 补齐表达式输入和标志选项的按需样式 ([c518951](https://github.com/liunnn1994/sd-design/commit/c51895187ac1646408d2fa9d92ee34d448f92188))
* **rich-text-editor:** 补齐内置控件的按需样式依赖 ([297e445](https://github.com/liunnn1994/sd-design/commit/297e445be2ec06003b412399bbdf73fa72d96890))
* **secret:** 补齐省略文本与操作提示的按需样式 ([7c811dd](https://github.com/liunnn1994/sd-design/commit/7c811dd770fc82449ee1fdff6383611c853aa6af))
* **select:** 补齐下拉加载图标的按需样式 ([e4887be](https://github.com/liunnn1994/sd-design/commit/e4887be88a19e0f939d990e4ede23971e627dab2))
* **sender:** 补齐输入控件与操作提示的按需样式 ([39cba52](https://github.com/liunnn1994/sd-design/commit/39cba52e892a00f34613471f352ac07e2927a6b3))
* **shared:** 补齐文本省略样式并移除无用局部绑定 ([97ee025](https://github.com/liunnn1994/sd-design/commit/97ee025b5df4c47d51daf3fc27c0b50e35497463))
* **slider:** 修复把手放大样式并移除无用局部状态 ([83c1278](https://github.com/liunnn1994/sd-design/commit/83c127886b646f61a1d5c1769d2a3d5f4857b80e))
* **statistic:** 补齐动态数字布局的按需样式 ([057a0f3](https://github.com/liunnn1994/sd-design/commit/057a0f30e5cd22fb7d4e151f718488d10a34ef54))
* **steps:** 移除未使用的局部声明和废弃注释 ([16162d2](https://github.com/liunnn1994/sd-design/commit/16162d23da1e09d8e508ed85a1401ce9dfda741d))
* **table:** 更正总结行说明并移除废弃注释代码 ([1595c88](https://github.com/liunnn1994/sd-design/commit/1595c88740e300e142224fb1fd2608f48418514e))
* **tabs:** 补齐滚动面板样式并移除无用 Sass 导入 ([bd2d1c0](https://github.com/liunnn1994/sd-design/commit/bd2d1c0e61a43a8b234eccaa4f2fd605dc755cb9))
* **tag-group:** 补齐标签和弹层的按需样式依赖 ([8da2ed4](https://github.com/liunnn1994/sd-design/commit/8da2ed4457e334c2c7780da915ddd66694431c57))
* **tag:** 补齐省略文本和提示弹层的按需样式依赖 ([0c12802](https://github.com/liunnn1994/sd-design/commit/0c128025a951c01ae4b55bbbd84596139ea02359))
* **textarea:** 补齐只读提示样式并移除无用局部状态 ([a48dc0b](https://github.com/liunnn1994/sd-design/commit/a48dc0bf1f1a412dba18da4773be091bd5d2dcaf))
* **timeline:** 补齐幽灵节点的加载样式并移除废弃注释 ([12d2757](https://github.com/liunnn1994/sd-design/commit/12d27576bd2ae9ea74e65e593adf1ef3cde9eea4))
* **toolbar:** 补齐表单与操作控件的按需样式依赖 ([ff17b78](https://github.com/liunnn1994/sd-design/commit/ff17b785fe55ba5d315982e96f57b898818c5e1b))
* **tour:** 补齐引导导航按钮的按需样式依赖 ([afda42b](https://github.com/liunnn1994/sd-design/commit/afda42bc7d9c0a559a5082df15b9df9bb34400ca))
* **transfer:** 移除未使用的局部计数计算值 ([c835b58](https://github.com/liunnn1994/sd-design/commit/c835b5890ef63e51459dabb911bbb8491d60f084))
* **tree-select:** 补齐输入框和弹层的按需样式依赖 ([5fcd50b](https://github.com/liunnn1994/sd-design/commit/5fcd50b9f7a3c5b10d5fd1aca54dbae601af1d3b))
* **tree:** 修复节点负间距并清理废弃样式注释 ([eb65e25](https://github.com/liunnn1994/sd-design/commit/eb65e25014409b9cd02574761473ceb6863ad9b4))
* **typography:** 移除未使用的属性返回值绑定 ([62544c5](https://github.com/liunnn1994/sd-design/commit/62544c56ae9726446bea534493345cf9fe90dde5))
* **voice-glow:** 更正默认值和麦克风钩子的说明 ([00097af](https://github.com/liunnn1994/sd-design/commit/00097af1890efcc83048e8a3852f3a56b341f7ed))

## [5.8.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.2...web-vue-v5.8.3) (2026-10-04)


### Bug Fixes

* 🐛 修复 i18n 的问题 ([b5726dc](https://github.com/liunnn1994/sd-design/commit/b5726dc775cf2c9c7caeb01d586bbd82a893bdbf))
* 🐛 修复文档的间距问题 ([876dd1c](https://github.com/liunnn1994/sd-design/commit/876dd1c21ef17cdcd35fa315b53ed4a065b4b4b8))

## [5.8.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.1...web-vue-v5.8.2) (2026-10-04)


### Bug Fixes

* **auto-complete:** 修复下拉样式选择器失配导致主题配置无效 ([45bc41c](https://github.com/liunnn1994/sd-design/commit/45bc41c7bb3199dcd1fb30bd0ca6a0afbd69c6c1))
* **calendar:** 修复超过百条事件时跨日事件遗漏 ([50519f7](https://github.com/liunnn1994/sd-design/commit/50519f7a2bcfb6f400f8686a841f6a73844040c8))
* **checkbox:** 修复禁用项悬停时边框主题色失效 ([aa876cd](https://github.com/liunnn1994/sd-design/commit/aa876cdcdcbefd0e74c01c1caa7aa7ec947c111a))
* **qr-code:** 补齐按需入口的加载状态样式 ([d66c825](https://github.com/liunnn1994/sd-design/commit/d66c82566b7ab38acfbadb90a102c678422c5cd0))
* **select:** 修复无边框模式背景与边框样式失效 ([1d99cbf](https://github.com/liunnn1994/sd-design/commit/1d99cbfe5a357e0bab4014d40903ff8fcc607594))
* **sender:** 修复操作按钮主题颜色与禁用样式失效 ([fef5a16](https://github.com/liunnn1994/sd-design/commit/fef5a168e09a3289d244abf7213bb90a3ea98dd6))
* **switch:** 修复线型开关单侧自定义颜色时轨道透明 ([747af34](https://github.com/liunnn1994/sd-design/commit/747af3414377681faedce3176f527d76c101af17))
* **table:** 修复左对齐筛选图标打开时背景样式失效 ([231e4d7](https://github.com/liunnn1994/sd-design/commit/231e4d7a9bdf8e5eab1e6b3c5c95c9835e69caab))
* **tabs:** 修复首项间距与 RTL 样式及指示线动画失效 ([aa5ce84](https://github.com/liunnn1994/sd-design/commit/aa5ce84a56a7f66ec1ffe5e0639ec3901de1462a))
* **tag:** 修复灰色标签主题样式未生效 ([1619d15](https://github.com/liunnn1994/sd-design/commit/1619d15a349cd0f9d031ae933515df2df6f2c1f2))
* **tour:** 修复默认标题与描述间距主题配置失效 ([71a901a](https://github.com/liunnn1994/sd-design/commit/71a901ad17468aef1fb94d0f5c14d3eb841c8f09))
* **tree:** 修复非默认尺寸节点连接线错位 ([24970d4](https://github.com/liunnn1994/sd-design/commit/24970d485060d151bd0f4b2a72ee8130bc869213))
* **verification-code:** 补齐按需入口的输入格样式 ([b393d59](https://github.com/liunnn1994/sd-design/commit/b393d590a175744424f89b36ad74db37b9b72520))
* **web-vue:** 修复按需样式产物的依赖与入口缺失 ([b8916b6](https://github.com/liunnn1994/sd-design/commit/b8916b61124c648a49b138d17122675d81fd944a))
* **web-vue:** 补齐发布产物所需的运行时与类型依赖 ([fcfa408](https://github.com/liunnn1994/sd-design/commit/fcfa40886fa1f7dc4b34b45233b732bf4a3ac04a))

## [5.8.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.8.0...web-vue-v5.8.1) (2026-10-04)


### Bug Fixes

* 🐛 修复类型被覆盖的问题 ([bd295b7](https://github.com/liunnn1994/sd-design/commit/bd295b7deac13e5579096398d9b6b8e8384c94d9))

# [5.8.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.6...web-vue-v5.8.0) (2026-10-04)


### Bug Fixes

* **mcp:** 统一文档筛选口径、避免 gen 阻断 CI、消除内部类型名与 camelCase 漏检 ([9f88b18](https://github.com/liunnn1994/sd-design/commit/9f88b1814d32cf7d46e3e9eeff8d1fc5cdbbfe16))


### Features

* **mcp:** 只查文档分组名时一次返回全部公开导出变体 ([04faba9](https://github.com/liunnn1994/sd-design/commit/04faba9a0f662d014ef7484ac7cb820667c2340e))

## [5.7.6](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.5...web-vue-v5.7.6) (2026-10-04)


### Bug Fixes

* **typography:** 补上默认插槽的双语文档 ([9f4803e](https://github.com/liunnn1994/sd-design/commit/9f4803ee617e3cb691a7522182607ad164a085cc))

## [5.7.5](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.4...web-vue-v5.7.5) (2026-10-03)


### Bug Fixes

* **auto-import-resolver:** 解析组件导出时不再依赖「export 块必须在文件末尾」 ([5962f85](https://github.com/liunnn1994/sd-design/commit/5962f8559c6bfcef470bdd7312e87a273aee2ebd))
* **locale:** 缺键时回退到默认语言包，并把后增语言段改为可选 ([d5213d1](https://github.com/liunnn1994/sd-design/commit/d5213d1f3de4123d0557a42e4589f1a8cdc3da3e))
* **mcp:** 组件检索忽略分隔符，camelCase 属性名此前搜不到 ([7aee46d](https://github.com/liunnn1994/sd-design/commit/7aee46d471602ed18af85a479563c194bd3e433f))

## [5.7.4](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.3...web-vue-v5.7.4) (2026-10-03)


### Bug Fixes

* 移除会被打包发布但无人引用的组件内部导出 ([fa3f49d](https://github.com/liunnn1994/sd-design/commit/fa3f49ddc2d2c6d1c0bb6381573cfcd2e6993da3))

## [5.7.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.2...web-vue-v5.7.3) (2026-10-03)


### Bug Fixes

* **image:** 卸载时清理缩放数值提示的隐藏定时器 ([3e1eaaf](https://github.com/liunnn1994/sd-design/commit/3e1eaaf3269ae7c8f10198d40065e2c2a6cb9004))
* **model-selector:** 弹层标题改为走语言包，不再硬编码中文 ([6f07a6f](https://github.com/liunnn1994/sd-design/commit/6f07a6fb63a2b6eaba1d1eb255dc6b9ffd0381b9))

## [5.7.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.1...web-vue-v5.7.2) (2026-10-03)


### Bug Fixes

* **toolbar:** 内置按钮文案改为走语言包，不再硬编码中文 ([cf6f212](https://github.com/liunnn1994/sd-design/commit/cf6f212206a96120f84a6fb35ff7f26a6c75a71c))

## [5.7.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.7.0...web-vue-v5.7.1) (2026-10-03)


### Bug Fixes

* **utils:** 移除会被打包发布但全仓无人使用的工具函数 ([4ae5ff7](https://github.com/liunnn1994/sd-design/commit/4ae5ff728e9a68530066939203037bb7866099de))

# [5.7.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.8...web-vue-v5.7.0) (2026-10-03)


### Features

* **mcp:** 把事件声明改为类型式，使 MCP 能提取到组件事件 ([f64f38b](https://github.com/liunnn1994/sd-design/commit/f64f38bbb98ed833d78ca21232013b91d2ca6c5d))

## [5.6.8](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.7...web-vue-v5.6.8) (2026-10-03)


### Bug Fixes

* **mcp:** 修复 slot 注释取不到导致 MCP 里所有插槽丢失 ([3d1c8d7](https://github.com/liunnn1994/sd-design/commit/3d1c8d7002ef721334b29c930096ca780b540cb0))

## [5.6.7](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.6...web-vue-v5.6.7) (2026-10-03)


### Bug Fixes

* **mcp:** 按组件目录隔离 API 索引，并为缺失注释的组件补齐双语文档 ([661731c](https://github.com/liunnn1994/sd-design/commit/661731cca34512d304734f38204477e08599448a))

## [5.6.6](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.5...web-vue-v5.6.6) (2026-10-03)


### Bug Fixes

* **build:** 排除自动生成的发布日志并清理无用变量 ([d04fb34](https://github.com/liunnn1994/sd-design/commit/d04fb3486ee07f36833ebeb39627d4759509d309))
* **mcp:** 修复同名子组件互相覆盖，并暴露缺少注释导致的空 API ([7aa9747](https://github.com/liunnn1994/sd-design/commit/7aa9747e08146c69ebd37e9ccf1e9b44d33458d7))

## [5.6.5](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.4...web-vue-v5.6.5) (2026-10-03)


### Bug Fixes

* **time-picker:** 修复滚动定位动画未中断导致位置错乱 ([5c49a05](https://github.com/liunnn1994/sd-design/commit/5c49a0576ebe6e90925c9f1c503c9b967b9b8340))

## [5.6.4](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.3...web-vue-v5.6.4) (2026-10-03)


### Bug Fixes

* **calendar:** 移除未选择日期时的调试日志 ([1c02512](https://github.com/liunnn1994/sd-design/commit/1c02512842fb4023f67795c3cf4f1e950233c486))

## [5.6.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.2...web-vue-v5.6.3) (2026-10-03)


### Bug Fixes

* **components:** 补全 Scrollbar/ThemeProvider/Icon 的全局组件类型声明 ([9041e48](https://github.com/liunnn1994/sd-design/commit/9041e4863ea4af35ce8b985e48bed6c9902fc7fd))

## [5.6.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.1...web-vue-v5.6.2) (2026-10-03)


### Bug Fixes

* **notification:** 修复容器被外部移除后销毁时抛出异常 ([0d08f11](https://github.com/liunnn1994/sd-design/commit/0d08f11f35d9d773ff4af6639187e0ffde8f6ada))
* **popup:** 修复弹层锁定期间切换容器后旧容器样式未还原 ([07f42f2](https://github.com/liunnn1994/sd-design/commit/07f42f289d54318579779663cf64d6157b77ab27))
* **utils:** 修复滚动条宽度算成负数、季度格式解析抛异常和 isWindow 服务端渲染报错 ([bd251e6](https://github.com/liunnn1994/sd-design/commit/bd251e6bf64fb64eff9f8a34f6131aa1b6887493))

## [5.6.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.6.0...web-vue-v5.6.1) (2026-10-02)


### Bug Fixes

* **anchor:** 修复无效百分号锚点导致初始化异常 ([83d1dba](https://github.com/liunnn1994/sd-design/commit/83d1dbae4c7c8197be20cc8ff215c2c1899de10a))
* **bloom-menu:** 修复服务端渲染访问 window 导致异常 ([637540c](https://github.com/liunnn1994/sd-design/commit/637540c744a680e4c1a8ee4f0a26708b80c49814))
* **calendar:** 修复服务端渲染实时定时器泄漏 ([12a580e](https://github.com/liunnn1994/sd-design/commit/12a580e0cbcc57e50901d75b783c0f0deb2a2083))
* **config-provider:** 修复动态增删属性后全局配置优先级未更新 ([33cd935](https://github.com/liunnn1994/sd-design/commit/33cd935746464ffb0b10785b0f12c41fd8e84c70))
* **date:** 修复不同年份同周序号被判断为同一周 ([b578108](https://github.com/liunnn1994/sd-design/commit/b5781089e2071f889901ad600cf585ade6b569bb))
* **file-previewer:** 修复服务端渲染访问 document 导致异常 ([ab7a9eb](https://github.com/liunnn1994/sd-design/commit/ab7a9eb32a97c3f26f2dabecc2ea13a34d867ea1))
* **form:** 修复特殊表单标识导致滚动定位异常 ([0ab49d7](https://github.com/liunnn1994/sd-design/commit/0ab49d77a4077797512dbae8667ee1b3bfc82e21))
* **image:** 修复图片预览服务端渲染访问浏览器对象异常 ([eace502](https://github.com/liunnn1994/sd-design/commit/eace502d403ee6a8ceed0d6e4eff68f9eb036b70))
* **input:** 修复受控输入恢复内容后光标跳到末尾 ([2e9947b](https://github.com/liunnn1994/sd-design/commit/2e9947bd40d5c3124d4b2119add59091ee89b926))
* **modal:** 修复确认回调和弹窗生命周期边界问题 ([d3205ba](https://github.com/liunnn1994/sd-design/commit/d3205baa7c108e0ae128c827ebd7bce120995835))
* **number-flow:** 修复本地化数字渲染为 NaN 的问题 ([cb5f60d](https://github.com/liunnn1994/sd-design/commit/cb5f60d5ad3c208d2fa629e64ceed6ec7b5f34a9))
* **pagination:** 修复非受控页大小变化重复调整当前页 ([6593569](https://github.com/liunnn1994/sd-design/commit/659356969401dd23b9d5577c61e9f2393d97b142))
* **popconfirm:** 修复确认回调同步异常导致无法重试 ([7b7c0f7](https://github.com/liunnn1994/sd-design/commit/7b7c0f781196ac8b6d2febef4a1698e8de5179b4))
* **popup-manager:** 修复可见弹层卸载后层级记录未释放 ([4cfe95e](https://github.com/liunnn1994/sd-design/commit/4cfe95ee09cfcd110d3c79b8a52182fc440597de))
* **progress:** 修复渐变标识冲突和步骤状态显示异常 ([dc12000](https://github.com/liunnn1994/sd-design/commit/dc12000d201d4174cefc6a3127b2b89107823e76))
* **regex-vis:** 修复 Unicode 字符量词和范围被拆分的问题 ([9b34390](https://github.com/liunnn1994/sd-design/commit/9b3439014c494779e81152a1bb0a53eedc4998f0))
* **rich-text-editor:** 修复内联 HTML 片段导入失败的问题 ([83bf626](https://github.com/liunnn1994/sd-design/commit/83bf62636ae120235e6658700f1e8a17c3bef98b))
* **selectable-card:** 修复零值显示和受控勾选状态 ([3cbb02a](https://github.com/liunnn1994/sd-design/commit/3cbb02ab1a3806b80bb2681bbb48f471116af3a6))
* **select:** 修复字段映射变化后选项索引未更新 ([09b396e](https://github.com/liunnn1994/sd-design/commit/09b396eab567b784e2c26ea2f9946a1737c61df7))
* **slider:** 修复步进精度和最大值边界问题 ([a057127](https://github.com/liunnn1994/sd-design/commit/a057127d313f4715b4c9dc753859ac0822c879e1))
* **split:** 修复卸载后仍启动拖拽的问题 ([5ac9669](https://github.com/liunnn1994/sd-design/commit/5ac96692a6a22d76bebd0f7e6f71a0bdbdf86e14))
* **table:** 修复筛选、树形数据和固定列边界问题 ([0be0abb](https://github.com/liunnn1994/sd-design/commit/0be0abb56a847b1a79735e4bc257196b082c292d))
* **tabs:** 修复键盘关闭误切换和导航滚动跳动 ([49a1ece](https://github.com/liunnn1994/sd-design/commit/49a1eceffef5887fd6a8393edb3d975143d0155c))
* **tag:** 修复渐变颜色被错误解析为页面文字颜色 ([11f262f](https://github.com/liunnn1994/sd-design/commit/11f262f334cfb81fb9976ac9d2b786e7e2483149))
* **textarea:** 修复自适应高度配置变化后样式未更新 ([ef1da36](https://github.com/liunnn1994/sd-design/commit/ef1da36fb8f3ac6669309989ff050c285ca74fff))
* **time-picker:** 修复禁用时间、格式解析和清除事件问题 ([1344eb5](https://github.com/liunnn1994/sd-design/commit/1344eb5f2e2f013fa48aea072a8d689335d4aa6b))
* **timeline:** 修复动态幽灵节点插槽和连线状态 ([b334fc8](https://github.com/liunnn1994/sd-design/commit/b334fc8fa04261690421c0258c1eca557404e04f))
* **tour:** 修复服务端渲染、销毁时序和动态插槽问题 ([f55941b](https://github.com/liunnn1994/sd-design/commit/f55941bb2d6797204a89f9aceeae725a5f62832e))
* **transfer:** 修复禁用清空、全选状态和重复移除事件 ([e43fef9](https://github.com/liunnn1994/sd-design/commit/e43fef99188a4463a6b895fbba74211cfa501c04))
* **tree-select:** 修复零值搜索和筛选回调更新问题 ([2e852c5](https://github.com/liunnn1994/sd-design/commit/2e852c52312e15ade034e176d5473591c1cfacdb))
* **tree:** 修复零值键、隐藏节点焦点和重复勾选键问题 ([27a8827](https://github.com/liunnn1994/sd-design/commit/27a88279daa1be88114320e74d59db45b7fa47c3))
* **trigger:** 修复关闭和卸载时未取消延迟打开任务 ([8049ad0](https://github.com/liunnn1994/sd-design/commit/8049ad0105c4002df64c2ebdd6a5ca8d74744e3f))
* **upload:** 修复目录读取、禁用操作和预览资源释放问题 ([2e4780b](https://github.com/liunnn1994/sd-design/commit/2e4780b1e17370c1338a04f9a75f029d2e5f8c62))
* **utils:** 修复对象相等判断漏掉新增字段的问题 ([c4b81ad](https://github.com/liunnn1994/sd-design/commit/c4b81ad5ad19700f9ff15b8caa91ead4a7ce09d4))
* **verification-code:** 修复只读状态下粘贴和退格修改内容 ([7524dd5](https://github.com/liunnn1994/sd-design/commit/7524dd58fd1dcda2376b7c086462882e66da1bac))
* **virtual-list:** 修复横向定位和滚动结束误报到底的问题 ([86ee063](https://github.com/liunnn1994/sd-design/commit/86ee06381716f91da9b227ddd4b369cf676028a4))
* **voice-glow:** 修复生命周期和音量回调重复执行 ([682bcd1](https://github.com/liunnn1994/sd-design/commit/682bcd14f3b68dbd8633fb7f9e63d15eb5c01f1b))
* **watermark:** 修复服务端渲染访问浏览器对象异常 ([63664a4](https://github.com/liunnn1994/sd-design/commit/63664a4bb438ea0b552d10fb0ee80e2295e10af4))

# [5.6.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.5.0...web-vue-v5.6.0) (2026-10-02)

### Features

- 🆕 整体迁移到 ts ([56f2937](https://github.com/liunnn1994/sd-design/commit/56f2937b27511b093991f7464b965eed8c308264))

# [5.5.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.4.0...web-vue-v5.5.0) (2026-10-02)

### Features

- 🆕 新增 MarkdownRender 组件 ([a4ee870](https://github.com/liunnn1994/sd-design/commit/a4ee8702f734c28dc355e700b4d6bed15b638a8e))

# [5.4.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.3.0...web-vue-v5.4.0) (2026-09-29)

### Features

- 🆕 新增 voice glow 组件 ([e4718b3](https://github.com/liunnn1994/sd-design/commit/e4718b36774c293e95c79579ff1eef40cbafda8b))

# [5.3.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.2.1...web-vue-v5.3.0) (2026-09-29)

### Features

- 🆕 去掉浏览器自带的 :focus-visible 黑边 ([8ed2a23](https://github.com/liunnn1994/sd-design/commit/8ed2a23becd3e08e4980050c027701490266c8f5))
- 🆕 更新依赖 ([3c0c918](https://github.com/liunnn1994/sd-design/commit/3c0c918c19597bef7029c622454de7314fd33616))

## [5.2.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.2.0...web-vue-v5.2.1) (2026-09-29)

### Bug Fixes

- 🐛 修复表头没有对齐的问题 ([81a58d9](https://github.com/liunnn1994/sd-design/commit/81a58d98ac91d48b632f327ca9564085e4fde68e))

# [5.2.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.1.1...web-vue-v5.2.0) (2026-09-24)

### Features

- 🆕 model selector 新增分组展开收起功能 ([8d92a82](https://github.com/liunnn1994/sd-design/commit/8d92a824ad04afc2c87961843dde8147a5ca1ca6))
- 🆕 修复调整列宽的功能并添加到 configprovider 中 ([204d61d](https://github.com/liunnn1994/sd-design/commit/204d61df42ebb947ef0e1176593cdbc19d52b998))

## [5.1.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.1.0...web-vue-v5.1.1) (2026-09-24)

### Bug Fixes

- 🐛 修复 Avatar 在 flex 布局中被挤变形的问题 ([2873cde](https://github.com/liunnn1994/sd-design/commit/2873cdef2fe2ee3dc50c53febe599503bfec3744))

# [5.1.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v5.0.0...web-vue-v5.1.0) (2026-09-23)

### Features

- 🆕 dropdown 新增 header slot ([de31c5d](https://github.com/liunnn1994/sd-design/commit/de31c5d62332f12bcd683d0dc66d5725b71a9b5c))
- 🆕 优化间距样式 ([8703b49](https://github.com/liunnn1994/sd-design/commit/8703b498eb913a14cb04f3220da959549464ee8e))

# [5.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.7.2...web-vue-v5.0.0) (2026-09-22)

### Bug Fixes

- 🐛 修复深色模式文字颜色未跟随灰阶色板的问题 ([776bd4f](https://github.com/liunnn1994/sd-design/commit/776bd4f49fd62e6d96cf96bb07964081f2e7c40e))

### Features

- 🆕 tag 组件支持手动设置 tooltip ([8ca4f86](https://github.com/liunnn1994/sd-design/commit/8ca4f86ddd1ce1dbf5e373fef7ff7d5cd94defda))
- 🆕 上传组件新增跨标签页上传互斥功能 ([d66181c](https://github.com/liunnn1994/sd-design/commit/d66181c52739a391ae5751236759b945247167bd))
- 🆕 优化主题的使用，新增主题编辑器 ([e29d99e](https://github.com/liunnn1994/sd-design/commit/e29d99efab6cea882ea8a78b7e22ce30cb24e94b))
- 🆕 优化键盘选中的样式 ([0d83a39](https://github.com/liunnn1994/sd-design/commit/0d83a39da20313c2b4e24e414b089e3268017ebf))
- 🆕 移除 cjs 的支持 ([8514dcd](https://github.com/liunnn1994/sd-design/commit/8514dcd41d31d6580c5861b59a5fa835092492f1))

### BREAKING CHANGES

- 🧨 此版本后仅支持 esm

## [4.7.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.7.1...web-vue-v4.7.2) (2026-09-20)

### Bug Fixes

- 🐛 修复 radio group button 类型的时候宽度的问题 ([059a885](https://github.com/liunnn1994/sd-design/commit/059a885aad04758953ed5bb690a7ce077a573ef8))

## [4.7.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.7.0...web-vue-v4.7.1) (2026-09-18)

### Bug Fixes

- 🐛 修复尺寸存在小数的时候会意外触发tooltip的问题 ([197d8d5](https://github.com/liunnn1994/sd-design/commit/197d8d599342a1c43702a63ed41021c79aa1ab3f))

# [4.7.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.6.0...web-vue-v4.7.0) (2026-09-14)

### Bug Fixes

- 🐛 修正 selectable-card 测试对 medium 圆角令牌新值的断言 ([a74cc27](https://github.com/liunnn1994/sd-design/commit/a74cc27d3ff4596aa5ae5f089b3cbbd7de317a09))

### Features

- 🎨 按 Apple HIG 优化视觉设计令牌（圆角/阴影/字体栈） ([eb9f9e9](https://github.com/liunnn1994/sd-design/commit/eb9f9e97817fa574c287ae6bb995dbc36c980af6))

# [4.6.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.5...web-vue-v4.6.0) (2026-09-14)

### Features

- 🆕 使用更先进的面板组替换伸缩框组件 ([f947175](https://github.com/liunnn1994/sd-design/commit/f947175d5fbf1cf2c24afccfe1655fba777da3ba))

## [4.5.5](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.4...web-vue-v4.5.5) (2026-09-11)

### Bug Fixes

- **build:** 🐛 重命名 vue-tsc 3.x 输出的 .d.vue.ts 声明为 .d.ts ([5f8510f](https://github.com/liunnn1994/sd-design/commit/5f8510fc8301c3425443a3c79d0ccb64c362dee4))

## [4.5.4](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.3...web-vue-v4.5.4) (2026-09-11)

### Bug Fixes

- 🐛 修复高度被挤压的问题 ([a76646f](https://github.com/liunnn1994/sd-design/commit/a76646fadb9a3f9eaad0c0b051c9570763260be4))

## [4.5.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.2...web-vue-v4.5.3) (2026-09-10)

### Bug Fixes

- **build:** remove TypeScript deprecation suppression ([0de8cba](https://github.com/liunnn1994/sd-design/commit/0de8cba9b05b35db8ed48ed3f99dae458a842743))

## [4.5.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.1...web-vue-v4.5.2) (2026-09-10)

### Bug Fixes

- **build:** restore TNB TypeScript toolchain ([aff46dd](https://github.com/liunnn1994/sd-design/commit/aff46dd31591a0fdead4c393e2d669ebab0f2d2b))

## [4.5.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.5.0...web-vue-v4.5.1) (2026-09-10)

### Bug Fixes

- **affix:** update fixed position when offsets change ([317c938](https://github.com/liunnn1994/sd-design/commit/317c93823f2baa1f0f7b680272cf91e0af220c7f))
- **anchor:** synchronize scroll and link lifecycle ([abd2791](https://github.com/liunnn1994/sd-design/commit/abd27918634620a1366fba049a30db1a2160cc25))
- **auto-complete:** cover boundary and virtual list interactions ([3d677d2](https://github.com/liunnn1994/sd-design/commit/3d677d26713d358220367cf77f43485d23ec093b))
- **avatar:** refresh image text and group lifecycle state ([1d1fe66](https://github.com/liunnn1994/sd-design/commit/1d1fe669b0e4573bba8825aba9f5a9f29fcf91f3))
- **back-top:** refresh targets and cancel stale scrolling ([8e14356](https://github.com/liunnn1994/sd-design/commit/8e14356f2ad9146d033a078e0b12ddd77b4f4c02))
- **back-top:** use portable tween instance type ([3fd758f](https://github.com/liunnn1994/sd-design/commit/3fd758fc44b63e88d77ed9205105258f4583139d))
- **badge:** refresh slot positioning and respect custom content ([bcc900f](https://github.com/liunnn1994/sd-design/commit/bcc900f14d8eff05f0d176269c60d654309451f8))
- **basic-crud-table:** guard async results and refresh dynamic slots ([8c61f45](https://github.com/liunnn1994/sd-design/commit/8c61f4502829a0f3976a13b8854b8ef822b809c3))
- **bloom-menu:** respect rejected controlled open requests ([1bb1258](https://github.com/liunnn1994/sd-design/commit/1bb1258b3fb8847059c36b00e682d46ed3bf6a13))
- **border-beam:** reconcile motion preferences and dynamic geometry ([8885e8a](https://github.com/liunnn1994/sd-design/commit/8885e8a4da834c94f67b36d99d9236d9a5a5f9c3))
- **breadcrumb:** synchronize dynamic slots and route counts ([fa96c23](https://github.com/liunnn1994/sd-design/commit/fa96c23d7495a9217a04e1eb9a2230fd8d5f0496))
- **build:** restore standard TypeScript toolchain ([f92c864](https://github.com/liunnn1994/sd-design/commit/f92c864ed885ae0ad7ded17fdb0345401f4f449a))
- **button:** preserve attributes and react to tooltip slot changes ([5aabf31](https://github.com/liunnn1994/sd-design/commit/5aabf3154be5c9867f5d20a86b1953a05c2bf5c2))
- **calendar:** apply explicit locale to control labels ([003fdb5](https://github.com/liunnn1994/sd-design/commit/003fdb59125a11380c6618e8a7c41ac87474baa9))
- **calendar:** honor per-instance week start during navigation ([9fd96ef](https://github.com/liunnn1994/sd-design/commit/9fd96ef9fe8eb5294704a789d0054aa04b644d3d))
- **calendar:** isolate date formatting between locale instances ([3e84889](https://github.com/liunnn1994/sd-design/commit/3e84889c32835669a08cfd02398ba947c6a83065))
- **calendar:** keep cross-calendar moves independent of deletion ([d0aba5f](https://github.com/liunnn1994/sd-design/commit/d0aba5f474aedb92f726e9ea47f39dd53687e4c9))
- **calendar:** stabilize event updates and interaction lifecycles ([683a68d](https://github.com/liunnn1994/sd-design/commit/683a68d2c0ee019fbc240ff6d16e8eb49be52794))
- **calendar:** use ISO week numbers across locales ([28b3236](https://github.com/liunnn1994/sd-design/commit/28b32360128e445f6f039a48c900647d7623b5b3))
- **card:** restore child state and react to dynamic slots ([fd7dbc5](https://github.com/liunnn1994/sd-design/commit/fd7dbc5b0c88d5720d3c8d694a2b47b9d990440a))
- **carousel:** handle dynamic slides and playback boundaries ([5099802](https://github.com/liunnn1994/sd-design/commit/5099802f2e25af938f7d853cc6992d7c7786928e))
- **cascader:** guard async loads and clean up pending search ([67a2aa0](https://github.com/liunnn1994/sd-design/commit/67a2aa042df71351495089a9f35b92a9075c4f75))
- **cascader:** prevent collisions between hyphenated option paths ([c83aa6e](https://github.com/liunnn1994/sd-design/commit/c83aa6e2f085c3e9fa39731671430c5f83fc1582))
- **cascader:** react to virtual list configuration changes ([2f8c252](https://github.com/liunnn1994/sd-design/commit/2f8c252386f76402d547789d47e76b794dda19b4))
- **cascader:** rebuild dynamic indexes and guard parent selection ([a9cfd67](https://github.com/liunnn1994/sd-design/commit/a9cfd6792f1ceecc3ae10370ea5c327d3d337085))
- **cascader:** refresh lazy caches and match literal value keys ([e29b0c7](https://github.com/liunnn1994/sd-design/commit/e29b0c7bf119c87e27f2bb866449a97926607e86))
- **cascader:** respect disabled options during keyboard navigation ([8fcdb4c](https://github.com/liunnn1994/sd-design/commit/8fcdb4c970846cdb0ceb51f5f0b4862f368b9790))
- **cascader:** share lazy loading across mouse and keyboard navigation ([87af762](https://github.com/liunnn1994/sd-design/commit/87af762fc6393f5b5868b199b1bf7b1ad70a7da0))
- **checkbox:** restore controlled mixed state after activation ([aa0135b](https://github.com/liunnn1994/sd-design/commit/aa0135b25d2f22f329e82c54704d2c8cef5c8287))
- **collapse:** preserve nested keyboard controls and icon spacing ([2d35eb0](https://github.com/liunnn1994/sd-design/commit/2d35eb0a884303c80b92b25ab9fa99946415a1bf))
- **collapse:** synchronize dynamic content destruction ([c658035](https://github.com/liunnn1994/sd-design/commit/c65803581206e25d0d62d58e93a2aec331f075ce))
- **color-picker:** apply edits from the HEX8 alpha field ([c707c36](https://github.com/liunnn1994/sd-design/commit/c707c363818645b9e1408676023b49c8b1010d91))
- **color-picker:** clean up drags and enforce disabled state ([697930a](https://github.com/liunnn1994/sd-design/commit/697930a297f9951619ac769b0200971050c0f890))
- **color-picker:** honor readonly and controlled panel values ([eef2b56](https://github.com/liunnn1994/sd-design/commit/eef2b562adcaf5d5f8b213d5a5c1d85d2fc5eb3e))
- **comment:** render dynamically added slots ([30b3d7e](https://github.com/liunnn1994/sd-design/commit/30b3d7e755255da5da4e37b7311b8f144239454b))
- **config-provider:** inherit nested popup themes reactively ([2bada96](https://github.com/liunnn1994/sd-design/commit/2bada9600b9d7f3c8ded102a9d8bb556d1941b45))
- **config-provider:** preserve overlapping global theme ownership ([fa2d1b6](https://github.com/liunnn1994/sd-design/commit/fa2d1b64fe31325e503131106e9d2ab3dff5c494))
- **config-provider:** restore overwritten global theme tokens ([cedf7ec](https://github.com/liunnn1994/sd-design/commit/cedf7ecdc427b05393816b50b8999879a3964100))
- **config-provider:** restore theme when leaving global scope ([8cfb5a3](https://github.com/liunnn1994/sd-design/commit/8cfb5a3d2b1456846fb6df4e25078edbb4347c97))
- **copy:** preserve async payload and stop feedback after unmount ([323d13a](https://github.com/liunnn1994/sd-design/commit/323d13ac2509f4ae9ca5de5efcd9117f66fec8e7))
- **copy:** refresh accessible names when text slots change ([ca00c10](https://github.com/liunnn1994/sd-design/commit/ca00c1016e51df9009a12ac9e3a847e27621c0bd))
- **cropper:** align selection after replacement image renders ([c67f72e](https://github.com/liunnn1994/sd-design/commit/c67f72e78112ce94b6211a525ac2aca81dfb9613))
- **cropper:** cancel pending initialization after destroy ([6bfa1b6](https://github.com/liunnn1994/sd-design/commit/6bfa1b639d407dd3ea81168e050ddabb09f00dff))
- **cropper:** preserve controlled geometry during automatic fitting ([07ee755](https://github.com/liunnn1994/sd-design/commit/07ee755bfe51a4c9fc6e9b42520e705b97debbdb))
- **cropper:** react to runtime selection fitting changes ([cb5a665](https://github.com/liunnn1994/sd-design/commit/cb5a665c843f413da3685ec968c348d757939db5))
- **cropper:** restore child attributes when overrides are removed ([c8445e8](https://github.com/liunnn1994/sd-design/commit/c8445e82d2a56ade501581f8cff08a6e50d41a03))
- **date-picker:** align period validation with selectable cells ([3464d17](https://github.com/liunnn1994/sd-design/commit/3464d17c2fd4f0d9d5a37d30338ee1e6d0719c1b))
- **date-picker:** guard inline selection in readonly and disabled states ([3e7b4c5](https://github.com/liunnn1994/sd-design/commit/3e7b4c5883573ecfe9c17c4a412965beb78ddeee))
- **date-picker:** preserve epoch timestamps and verify popup lifecycle ([0cb2749](https://github.com/liunnn1994/sd-design/commit/0cb27497e0865bc3a07b31d0636760f4cad9b646))
- **date-picker:** preserve range editability and disabled endpoints ([dca6b4b](https://github.com/liunnn1994/sd-design/commit/dca6b4bc35f25cfdaee79a53753eada855295715))
- **date-picker:** protect locked endpoints across range operations ([c27fec9](https://github.com/liunnn1994/sd-design/commit/c27fec9608b714af24366350fbf1e7e57ba762c5))
- **date-picker:** reset pending selection on external value changes ([09b52b5](https://github.com/liunnn1994/sd-design/commit/09b52b5b4a189ccd0b63ed0adfbc889a36c352a2))
- **date-picker:** satisfy strict prop typing ([0f9433b](https://github.com/liunnn1994/sd-design/commit/0f9433bd44e465e96a27233f8961fe2d09a80035))
- **date-picker:** validate final sorted range endpoints ([f8428a3](https://github.com/liunnn1994/sd-design/commit/f8428a3905eb79542d8d763b22fd20f3fc156bad))
- **descriptions:** preserve data indexes in scoped slots ([c29cc6d](https://github.com/liunnn1994/sd-design/commit/c29cc6d65361067ae2b4b2412fd63c3b5b563ccc))
- **divider:** honor zero size and expose separator orientation ([4fe1f06](https://github.com/liunnn1994/sd-design/commit/4fe1f06962a700864a091e293d2175b828aee81d))
- **drawer:** handle confirmation errors and dynamic title slots ([3514a46](https://github.com/liunnn1994/sd-design/commit/3514a461031b781c4adeb0d4df4713b6078c215f))
- **drawer:** invalidate pending confirmation on external close ([fa46855](https://github.com/liunnn1994/sd-design/commit/fa46855649ce40f99aaa89d8a2509ac5fc0ff9dc))
- **drawer:** release popup stack entry on unmount ([24cea32](https://github.com/liunnn1994/sd-design/commit/24cea32e783a5aa238ff66df1587558e8201d981))
- **dropdown:** focus menu items after popup becomes visible ([dd3b9c4](https://github.com/liunnn1994/sd-design/commit/dd3b9c43fe8ae094d110546803a20a4ad0501b6a))
- **dropdown:** preserve keyboard input in editable menu content ([9c41f55](https://github.com/liunnn1994/sd-design/commit/9c41f55339ebded0a4f8646f280bb295f8281a3f))
- **dropdown:** refresh dynamic options and honor submenu disabled state ([7531416](https://github.com/liunnn1994/sd-design/commit/7531416cb51fa19fcafbf0e90e6c62495791b7d3))
- **ellipsis:** avoid duplicate clicks during lazy expansion ([fcf159b](https://github.com/liunnn1994/sd-design/commit/fcf159b774f802f6314b9035e4b2415cfd22ed22))
- **ellipsis:** make lazy expansion reachable by keyboard ([ef02f6d](https://github.com/liunnn1994/sd-design/commit/ef02f6d1c3fc69ca0d5a55a0495b5cf5918d9fd2))
- **ellipsis:** observe content changes and preserve nested keyboard input ([2862527](https://github.com/liunnn1994/sd-design/commit/28625277950d1b4d24f5ae521d009c8bb611400a))
- **ellipsis:** settle measurement waiters on fallback and unmount ([f080d61](https://github.com/liunnn1994/sd-design/commit/f080d61912109e0e9d8f369223255bfe9e69d409))
- **empty:** prefer local description slot over provider fallback ([2e6fd9b](https://github.com/liunnn1994/sd-design/commit/2e6fd9bad9c0402988ae82ea481189a669912532))
- **file-previewer:** cancel obsolete PDF loads and clear empty sources ([d79326c](https://github.com/liunnn1994/sd-design/commit/d79326cfb131d79be08c0eb58223c0ae93c6277f))
- **file-previewer:** handle media load and release popup on unmount ([52e83f7](https://github.com/liunnn1994/sd-design/commit/52e83f7611230b85e7ed97428b6eae34e33da9ff))
- **file-previewer:** ignore stale PDF page render requests ([4a4623c](https://github.com/liunnn1994/sd-design/commit/4a4623c36dbb9b3c4c9dd31b4dac7548870d16a1))
- **file-previewer:** react to custom content changes and ignore stale media ([3ea07d6](https://github.com/liunnn1994/sd-design/commit/3ea07d6b3c415f06a400155015985be7b626f68c))
- **file-previewer:** release PDF resources when leaving the preview ([a883274](https://github.com/liunnn1994/sd-design/commit/a883274c13a278fd3239043095735527921e505b))
- **file-previewer:** surface PDF page rendering errors safely ([8b7f9b1](https://github.com/liunnn1994/sd-design/commit/8b7f9b1500da43224ae8980fcae000451f5b2150))
- **form:** clear nested validation state when fields unmount ([7486bc6](https://github.com/liunnn1994/sd-design/commit/7486bc657013173503a4f90247f3610c192606f9))
- **form:** preserve mutable initial values across repeated resets ([f22596e](https://github.com/liunnn1994/sd-design/commit/f22596ed038134b4e99f153468dc3ce081169b2c))
- **form:** prevent stale validation from restoring cleared errors ([8b6f53e](https://github.com/liunnn1994/sd-design/commit/8b6f53ea07e54cff3e3cd40ccee347452c4d7097))
- **form:** report custom validator exceptions and allow retry ([eff6bff](https://github.com/liunnn1994/sd-design/commit/eff6bff3b5e2ba0a1de6b11831839ddd5e058c5d))
- **form:** retain field identity in asynchronous validation results ([7c4a422](https://github.com/liunnn1994/sd-design/commit/7c4a4222fca317df091a8e3645f30b0e54ec1ff2))
- **form:** submit the values captured before asynchronous validation ([460e7bb](https://github.com/liunnn1994/sd-design/commit/460e7bbcd8b5a6e71249f14946fcab9325649dcb))
- **form:** synchronize dynamic field registration and reset state ([91c06d6](https://github.com/liunnn1994/sd-design/commit/91c06d61878f18d1c5b73a8308c62b18b89cf338))
- **grid:** allow responsive offset and order to reset to zero ([ce06db2](https://github.com/liunnn1994/sd-design/commit/ce06db26b8b3fd9bc0ba48ebce6d09284f1afb8d))
- **grid:** count row gaps in collapsed item placement ([fb50473](https://github.com/liunnn1994/sd-design/commit/fb50473469c846cdd6bed1d2f240fb2a6a3cef6a))
- **grid:** honor plain div mode across column layout options ([e017fe8](https://github.com/liunnn1994/sd-design/commit/e017fe8bc16b23c9766f197daeed4bf755afbbce))
- **grid:** preserve numeric zero flex configuration ([678417b](https://github.com/liunnn1994/sd-design/commit/678417b54f9c110711978e3dcc6ff534a23094fc))
- **grid:** retain item identity during removal and reordering ([9ea3214](https://github.com/liunnn1994/sd-design/commit/9ea3214c9eb0e78ba68865b2776967ef6ea56510))
- **icon-component:** allow retry after iconfont script failure ([281184b](https://github.com/liunnn1994/sd-design/commit/281184b3cf01e477397958e3d3637939fa29643d))
- **icon-component:** preserve zero size and compose spin rotation ([ccfac08](https://github.com/liunnn1994/sd-design/commit/ccfac08227946b3fb39d84fd3a2d483f8cdbd6fe))
- **icon:** preserve zero size in generated components ([6b94a23](https://github.com/liunnn1994/sd-design/commit/6b94a231f9331ebb6511de40da152a70283c122c))
- **image:** clear removed sources and release unmounted previews ([e729c5b](https://github.com/liunnn1994/sd-design/commit/e729c5b03fcda872276f531b6e19fd866df23b9f))
- **image:** end interrupted preview drags during image cleanup ([b3f49b9](https://github.com/liunnn1994/sd-design/commit/b3f49b981753eb4941e0326d0c99670c5c9ba5f8))
- **image:** keep explicit preview sources separate from child registrations ([f982968](https://github.com/liunnn1994/sd-design/commit/f982968e16a91efe908960a4a64e62d31d09bc53))
- **image:** keep preview group child identities unique ([8f4d325](https://github.com/liunnn1994/sd-design/commit/8f4d325fc59ed73d9064fdcaa4560edd4f0f8277))
- **image:** preserve group order when child sources change ([cc3fa0c](https://github.com/liunnn1994/sd-design/commit/cc3fa0c3840afe12530369cc4ee41c0b145acc33))
- **image:** refresh preview keyboard listeners on configuration changes ([d91e8eb](https://github.com/liunnn1994/sd-design/commit/d91e8ebf65b132c399a301732dceeda461ae485e))
- **image:** suppress clicks on disabled preview actions ([d019a7e](https://github.com/liunnn1994/sd-design/commit/d019a7ea3eae12d5b662111ef5eecc61f1f32df9))
- **input-mask:** derive completion from callback results ([5c0b2f7](https://github.com/liunnn1994/sd-design/commit/5c0b2f7ebe96d91bc9a0f473211df9870f4c8772))
- **input-mask:** preserve complete placeholder graphemes ([c253713](https://github.com/liunnn1994/sd-design/commit/c253713d64b5b32b96e531335168cb1629fbdb62))
- **input-mask:** strip old placeholders before mask changes ([104145f](https://github.com/liunnn1994/sd-design/commit/104145fda4fc7bb056ca1e91b35789eeb1c69280))
- **input-mask:** treat placeholder-only masks as empty ([bf74c3c](https://github.com/liunnn1994/sd-design/commit/bf74c3c717733ea3dcf5bde6f2cfe08637640ca5))
- **input-number:** apply precision directly to decimal strings ([9d4b3f2](https://github.com/liunnn1994/sd-design/commit/9d4b3f20ea4ed74b8d560f901c2fe719183e86cc))
- **input-number:** compare string values against exact numeric bounds ([cdeff7c](https://github.com/liunnn1994/sd-design/commit/cdeff7c0e961d93115bd2046a5caa511000f7668))
- **input-number:** expose numeric and formatted accessible values ([3b9fa45](https://github.com/liunnn1994/sd-design/commit/3b9fa453b1490aa5e7317e5d538d1dacaca2f141))
- **input-number:** preserve controlled decimal strings and change identity ([fa5c8eb](https://github.com/liunnn1994/sd-design/commit/fa5c8eb72d99562495055d4df6088c363d492090))
- **input-number:** preserve decimal digits during string mode stepping ([7f54fe2](https://github.com/liunnn1994/sd-design/commit/7f54fe27cf332ee14586de54ad343d7d5b4aa489))
- **input-number:** preserve explicit bounds after precision rounding ([ba3a4a5](https://github.com/liunnn1994/sd-design/commit/ba3a4a5d4a33cd00037ca04662d34c47c20d632f))
- **input-number:** refresh display when formatting callbacks change ([2271603](https://github.com/liunnn1994/sd-design/commit/2271603a7fc820e75d3d6c4ac3d3f20f48da5ee0))
- **input-number:** restore clearing commits and step availability ([65eb5e0](https://github.com/liunnn1994/sd-design/commit/65eb5e0fa5533381d79e77a9f083ed5422cbdfc1))
- **input-number:** retain scientific notation step precision ([5a2be3a](https://github.com/liunnn1994/sd-design/commit/5a2be3a9a8d87da5922cd4a1cb6eb9c2ef65db5e))
- **input-number:** synchronize rounded boundaries and clamp initial steps ([b139d6c](https://github.com/liunnn1994/sd-design/commit/b139d6c1b7c4c167bd484c35f8faf9c9d505debe))
- **input-tag:** enforce unique values for mapped object tags ([a69bb5c](https://github.com/liunnn1994/sd-design/commit/a69bb5c4ba350fa7b0ccde99a90a49136668b675))
- **input-tag:** honor effective closability for all removal paths ([44ba5b6](https://github.com/liunnn1994/sd-design/commit/44ba5b6a623ce762049e7f91d6c7a503d02dd8e6))
- **input-tag:** synchronize initial drafts and preserve layout focus ([c347a78](https://github.com/liunnn1994/sd-design/commit/c347a78c348a5e200f84ae05b28c2db0f41beba6))
- **input:** compare committed changes against the editing baseline ([d072b1f](https://github.com/liunnn1994/sd-design/commit/d072b1f73bd0771a96bf8304ce2287a0a8d3bec0))
- **input:** emit the accepted value after length truncation ([b428f8f](https://github.com/liunnn1994/sd-design/commit/b428f8f60314c5a5956d763a9bd0cb1b4739fcc8))
- **input:** prevent searches from disabled input icons ([1ba26e0](https://github.com/liunnn1994/sd-design/commit/1ba26e05d09f70c36e6b77a04b23126324680caa))
- **json-form:** block prototype traversal in form paths ([2ef18e0](https://github.com/liunnn1994/sd-design/commit/2ef18e029de8f1daa11629a0a001cfc42c6b9a77))
- **json-form:** decode pointer escapes for field validation ([8f073d7](https://github.com/liunnn1994/sd-design/commit/8f073d763d45c081fdf4e70db641f5e87cb773ad))
- **json-form:** forward component slots by their actual names ([c88e3b7](https://github.com/liunnn1994/sd-design/commit/c88e3b7766c6fc24beda24f19be965b573b4c15e))
- **json-form:** preserve explicit empty placeholder overrides ([bb233ff](https://github.com/liunnn1994/sd-design/commit/bb233ffcf57b1d5dcb989be2895bd1c8d5208aeb))
- **json-form:** preserve literal pointer keys in validation and reset ([02c439d](https://github.com/liunnn1994/sd-design/commit/02c439d9a18f2abd4740964d22cd73afdf57bac6))
- **kv-list:** preserve spaces and focus during list editing ([6cea742](https://github.com/liunnn1994/sd-design/commit/6cea742bb8293b4166cd7c2d3435ad956759fef0))
- **layout:** reset sider responsive and hover state on toggle ([15b428d](https://github.com/liunnn1994/sd-design/commit/15b428d9301898082f46490e90ad87c2794824a1))
- **menu:** react to breakpoint changes ([6f888b6](https://github.com/liunnn1994/sd-design/commit/6f888b6a8146f969ffebaa54550a181ca446e410))
- **menu:** refresh overflow after content changes ([d735e39](https://github.com/liunnn1994/sd-design/commit/d735e39ea974fda92d948825584212c66a40347d))
- **message:** clear stale message ids ([96cdc89](https://github.com/liunnn1994/sd-design/commit/96cdc89d2c2353558b9770688bb19ec2ebba9329))
- **modal:** clean up active drag listeners ([ad2a86b](https://github.com/liunnn1994/sd-design/commit/ad2a86b86549d9c2132357c13e1b75f5927eb505))
- **notification:** expose remove in plugin API ([c343b81](https://github.com/liunnn1994/sd-design/commit/c343b81464899771e1ddfbbebc4c8e0b4e3c90f1))
- **page-header:** refresh dynamic slot classes ([52d4ac5](https://github.com/liunnn1994/sd-design/commit/52d4ac56ad73cc06b57dade56414104907219e77))
- **pagination:** honor configured auto adjust ([989d108](https://github.com/liunnn1994/sd-design/commit/989d10858e44d09198a0534ff5ad7779a2bc2913))
- **progress:** restore animation and reactive rendering ([92f28b7](https://github.com/liunnn1994/sd-design/commit/92f28b79e0513b095b9927e0d6cd9e335513617a))
- **qr-code:** ignore stale async renders ([6f99d49](https://github.com/liunnn1994/sd-design/commit/6f99d497e10fd18a4df8afe1dc83780f9cf9e755))
- **rate:** correct radio selection semantics ([a82fcef](https://github.com/liunnn1994/sd-design/commit/a82fcef128d232bf6f21573f80414e79b776980d))
- **release:** run package builds with TypeScript 5 ([85ecef9](https://github.com/liunnn1994/sd-design/commit/85ecef9bd4f83576ccdff7a6f70fcb970e1493f0))
- **resize-box:** clean up active drag on unmount ([6e15532](https://github.com/liunnn1994/sd-design/commit/6e15532a4b544e533c4cb19d4afb268fe6fae538))
- **result:** export status type ([6df771f](https://github.com/liunnn1994/sd-design/commit/6df771f5b47254a10f341558b915c03119a38dd5))
- **secret:** localize toggle tooltip ([92eb17e](https://github.com/liunnn1994/sd-design/commit/92eb17ea8bab6f692b4668e8791267bb95a91e36))
- **select:** honor form disabled clear state ([1b020a5](https://github.com/liunnn1994/sd-design/commit/1b020a5426331ac34c27f3d7b04d1025f594739d))
- **select:** scroll active option into view ([4c323ef](https://github.com/liunnn1994/sd-design/commit/4c323ef068e44f2fae3f014135fff6801f40ffa6))
- **skeleton:** render rows in one list ([62216c9](https://github.com/liunnn1994/sd-design/commit/62216c9bdef67e98c44c94ffe3daa731c66e05ef))
- **slider:** clean up drag state and zero values ([a6d3fb3](https://github.com/liunnn1994/sd-design/commit/a6d3fb31175252620534a5b98a997de0f92454d2))
- **spin:** expose active busy state ([5614da2](https://github.com/liunnn1994/sd-design/commit/5614da2251e480346a7c6673192af795d9e2ea30))
- **split:** clean up active resize listeners ([387856e](https://github.com/liunnn1994/sd-design/commit/387856e5807630eb7d637e1e2203a87f63a01a34))
- **statistic:** restart updated countdown ([85540b5](https://github.com/liunnn1994/sd-design/commit/85540b5ec3a2b949c090a54f408b6c263362c500))
- **steps:** expose disabled semantics ([f44a82a](https://github.com/liunnn1994/sd-design/commit/f44a82aef81c363342bc4d8f3837c8b63697606a))
- **switch:** announce loading state ([066df55](https://github.com/liunnn1994/sd-design/commit/066df55bcc939e2c7ecb59f3e56674c7f4cfd2bb))
- **table:** support keyboard sorting ([90b20a3](https://github.com/liunnn1994/sd-design/commit/90b20a3a5b81e37c38e3fdd484b5e50801bb37d3))
- **tabs:** make nav controls accessible ([d7aa8b5](https://github.com/liunnn1994/sd-design/commit/d7aa8b55448472d16159c916443922b62598802c))
- **tag-group:** focus overflow counter ([1f0c290](https://github.com/liunnn1994/sd-design/commit/1f0c290ad38ad701c6c72c19bfc1db71a9acd8f0))
- **textarea:** react to native attrs ([c70e9d0](https://github.com/liunnn1994/sd-design/commit/c70e9d048d72e791717d603f159ee6c30f58f3fd))
- **toolbar:** avoid duplicate enter actions ([a585230](https://github.com/liunnn1994/sd-design/commit/a585230725d6798e91700802f724013e28105a7a))
- **tooltip:** show help on keyboard focus ([5f2043e](https://github.com/liunnn1994/sd-design/commit/5f2043ef033f69f64a66d6a4a899a52c408c7736))
- **tour:** preserve arrow keys in editors ([9655c61](https://github.com/liunnn1994/sd-design/commit/9655c61efdad0ab8e2405baf1c5220a669794dc1))
- **transfer:** restore keyboard move controls ([ed645a3](https://github.com/liunnn1994/sd-design/commit/ed645a37955c6ae7f3df0e65c01e43ebc6f67c3b))
- **tree-select:** describe tree popup semantics ([3dbc4a6](https://github.com/liunnn1994/sd-design/commit/3dbc4a6530a9819818dccf41641aac75310e668f))
- **tree:** recover tab stop after data changes ([dfb80c2](https://github.com/liunnn1994/sd-design/commit/dfb80c2771ef8cd997f19e6a4046375dd6c8ff30))
- **trigger:** sync scroll listener lifecycle ([e4aa14b](https://github.com/liunnn1994/sd-design/commit/e4aa14b7f8abc38c40e493a39a68677735f615ac))
- **typography:** preserve IME editing ([fe4c9ce](https://github.com/liunnn1994/sd-design/commit/fe4c9cedfd96c9d96e405612bfa07c97fe32317a))
- **upload:** enable keyboard file actions ([1a096df](https://github.com/liunnn1994/sd-design/commit/1a096df79d870a5a6448b3ebcc5e2283ce66b863))
- **utils:** cancel debounced work on unmount ([ec891df](https://github.com/liunnn1994/sd-design/commit/ec891dfbfeef6bdd055a2e40865bc910b3b1673a))
- **verification-code:** react to length changes ([1ea2c1b](https://github.com/liunnn1994/sd-design/commit/1ea2c1b773142af9f2f0f8237d69384aa08cd9b5))
- **watermark:** ignore stale image renders ([aedd50d](https://github.com/liunnn1994/sd-design/commit/aedd50da99fa3663e52e6b1ef678935cd6d32220))

# [4.5.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.3...web-vue-v4.5.0) (2026-09-09)

### Features

- 🆕 优化 tab 切换卡顿的问题 ([0b797c6](https://github.com/liunnn1994/sd-design/commit/0b797c605ec974ff530261a73009da14019161cc))

## [4.4.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.2...web-vue-v4.4.3) (2026-09-09)

### Bug Fixes

- 🐛 empty ConfigProvider 自定义分支透传 attrs ([44d8612](https://github.com/liunnn1994/sd-design/commit/44d86128263445df306cbde05350a636453b267b))

## [4.4.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.1...web-vue-v4.4.2) (2026-09-08)

### Bug Fixes

- 🐛 gen-icons faceBook 命名归一化；更新审计台账 ([f6c9e0e](https://github.com/liunnn1994/sd-design/commit/f6c9e0e58f3114dc1db0a6b9367a5bf7d91327b7))
- 🐛 修复 grid/ellipsis 审计问题 ([c1b71af](https://github.com/liunnn1994/sd-design/commit/c1b71af2d7f4c9db58594d9ebfa3c0004a67107c))
- 🐛 修复 transfer/upload/tree-select 审计问题 ([3d24680](https://github.com/liunnn1994/sd-design/commit/3d246807c1ce09c4655d9184a043bec11e7dbff1))
- 🐛 修复交互工具审计问题（resize-box/split/slider/spin/cropper/copy/border-beam/typography/bloom-menu） ([c49ceb2](https://github.com/liunnn1994/sd-design/commit/c49ceb21246c1c6a9f4531449026f9ce55f066a7))
- 🐛 修复反馈弹层审计问题（modal/drawer/popconfirm/notification/message） ([a36346f](https://github.com/liunnn1994/sd-design/commit/a36346fdb7d64c1f2a7edc7a7d57865fdfc90b4a))
- 🐛 修复基础配置审计问题（model-selector/empty/config-provider/color-picker/file-previewer/global-config/icon） ([e5c6c31](https://github.com/liunnn1994/sd-design/commit/e5c6c317c19e5bbe1b70afbe6f5b6eed192f0106))
- 🐛 修复布局导航审计问题（watermark/qr-code/skeleton/result/layout/anchor/breadcrumb/pagination/carousel） ([535e33b](https://github.com/liunnn1994/sd-design/commit/535e33b900f99bdb36b0911f1dc208f3d061d8d8))
- 🐛 修复弹层触发审计问题（tour/trigger/popover/dropdown） ([99ed53f](https://github.com/liunnn1994/sd-design/commit/99ed53fbfde72c607fc98bc30e1a699e534aa129))
- 🐛 修复数据展示审计问题（avatar/badge/tag/list/comment/kv-list/statistic/timeline/number-flow/page-header） ([8f294db](https://github.com/liunnn1994/sd-design/commit/8f294dbd33633d183ca6687eb283e15ba22701c6))
- 🐛 修复数据展示审计问题（image/table/calendar） ([65d9937](https://github.com/liunnn1994/sd-design/commit/65d9937f0e037aa61ad805fc7114aeb8df0ee34f))
- 🐛 修复表单审计问题（form/json-form） ([4084c50](https://github.com/liunnn1994/sd-design/commit/4084c50d7ebb5f2737c8af480a96730666b9df2c))
- 🐛 修复输入类组件审计问题 ([b34c570](https://github.com/liunnn1994/sd-design/commit/b34c570b0cbad98e4feb35cdb0fcd6f319d817a0))
- 🐛 修复选择类组件审计问题（select/cascader/auto-complete/mention） ([256104b](https://github.com/liunnn1994/sd-design/commit/256104befd0ce7d3449a9f858ddcd3401b0dd079))
- 🐛 稳定 CI 下的测试断言（popover/split/radio/ellipsis/table/date-picker） ([b0dbcf3](https://github.com/liunnn1994/sd-design/commit/b0dbcf36b71fe5abf13cdde32c5d21b470d1b63a))

## [4.4.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.4.0...web-vue-v4.4.1) (2026-09-07)

### Bug Fixes

- 🐛 button 点击守卫未使用 mergedDisabled ([061e9fe](https://github.com/liunnn1994/sd-design/commit/061e9fe1e40a596d99814d9aff3bbeb5ffdc9c49))
- 🐛 icongen 重新生成时保留受版本控制的 icon **test** 目录 ([2aff61f](https://github.com/liunnn1994/sd-design/commit/2aff61f25f04aac29ee9b7761082b133a29eda41))
- 🐛 table Td/Th 组件丢失透传的事件监听 ([95045f8](https://github.com/liunnn1994/sd-design/commit/95045f8ff0b0335c71ef0414f7af86d3f1c4105a))
- 🐛 theme-provider 卸载时释放弹层栈 zIndex ([a6201aa](https://github.com/liunnn1994/sd-design/commit/a6201aadc6b6121ddd4d7861830ea2333dfeb402))
- 🐛 tree onDragOver 判断 draggable 时遗漏 .value ([c5509b8](https://github.com/liunnn1994/sd-design/commit/c5509b8aff57a44f735507490288647c2ec8c55c))
- 🐛 upload 文件类型判断使用最后一个扩展名 ([6cc2a65](https://github.com/liunnn1994/sd-design/commit/6cc2a65a04d896ea13fd8b63692605a1dce3345b))
- 🐛 修复 date-picker 范围选择器头部操作误判 isDateOrWeek ([47c9b60](https://github.com/liunnn1994/sd-design/commit/47c9b600c089e908c1b459d8cc114ffb3861f3b8))

# [4.4.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.3.1...web-vue-v4.4.0) (2026-09-01)

### Bug Fixes

- 🐛 修复容器不可点击的问题 ([b1c7af2](https://github.com/liunnn1994/sd-design/commit/b1c7af2065b73db463057c13d51836b719d502ad))

### Features

- 🆕 新增正则可视化组件 ([ebe6901](https://github.com/liunnn1994/sd-design/commit/ebe6901a49f15a17944ab9ac65d35cba19758efc))
- 🆕 根据设计规范优化组件 ([522d2ac](https://github.com/liunnn1994/sd-design/commit/522d2ac961626718ffd75b900c51003b8d248cbf))

## [4.3.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.3.0...web-vue-v4.3.1) (2026-08-28)

### Bug Fixes

- 🐛 修复报错 TS18048 ([b4c221a](https://github.com/liunnn1994/sd-design/commit/b4c221a31bf7800e81a12489804a4cc1c2b00aca))

# [4.3.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.2.0...web-vue-v4.3.0) (2026-08-27)

### Features

- 🆕 新增 clamp 组件并且所有涉及到内容裁剪的组件底层都切换为 vue-clamp ([ebdf802](https://github.com/liunnn1994/sd-design/commit/ebdf80274cf5457160791b0292864c4e4aded655))

# [4.2.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.1.0...web-vue-v4.2.0) (2026-08-19)

### Bug Fixes

- 🐛 修复错误的类型 ([7ce3d69](https://github.com/liunnn1994/sd-design/commit/7ce3d695c4e94e51a35775959d42e1afeea31d7d))
- 🐛 修复错误的类型推断 ([fb2432b](https://github.com/liunnn1994/sd-design/commit/fb2432b1598d5722c0679a8af3dd5f311166cafb))

### Features

- 🆕 新增 BloomMenu 组件 ([1f44584](https://github.com/liunnn1994/sd-design/commit/1f445841c1fc9a63e2d249cd90bd7f6929fdb206))

# [4.1.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v4.0.0...web-vue-v4.1.0) (2026-08-13)

### Features

- 🆕 Badge和Statistic使用新的动画组件 ([a99934d](https://github.com/liunnn1994/sd-design/commit/a99934dc68cd2bb49ad7b5a4b72cf3c0b8941ec6))
- 🆕 新增数字动效组件 ([0867813](https://github.com/liunnn1994/sd-design/commit/0867813ecb257e69715d7791e3119c48e44750f7))

# [4.0.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.30.0...web-vue-v4.0.0) (2026-08-13)

### Bug Fixes

- 🐛 preserve spin root attributes ([fed2b5f](https://github.com/liunnn1994/sd-design/commit/fed2b5f37657b50f39435e3ac4f9dd83347b08fd))
- 🐛 修复 grid 示例以及样式错误 ([c81d9f1](https://github.com/liunnn1994/sd-design/commit/c81d9f13d1e36e8542fd169d065ca3c7958890eb))
- 🐛 修复 select 传入 class 时丢失 sd-select 类名 ([22d835e](https://github.com/liunnn1994/sd-design/commit/22d835e1759830b189b8c846d18864118db3b03a))
- 🐛 修复 slider 组件中 tooltip 位置错误的问题 ([c4ade36](https://github.com/liunnn1994/sd-design/commit/c4ade36cf163f68a6502dcf70a4079be29753b8e))
- 🐛 修复 upload 组件 ([95852e8](https://github.com/liunnn1994/sd-design/commit/95852e8a46169271230a7312af08367851113597))
- **cascader:** avoid transition root warning ([4d7bc80](https://github.com/liunnn1994/sd-design/commit/4d7bc808dcabd134a039a7f73a0b51b20ee097b9))
- **docs:** mount type enhancer without hydration ([ea25389](https://github.com/liunnn1994/sd-design/commit/ea253891f3d19ad464e60cd29e509333e36a3959))
- **icon:** export icon font props type ([e9fee10](https://github.com/liunnn1994/sd-design/commit/e9fee10ddc9806b8a0025336876b901f8c3683ba))
- **menu:** avoid forwarding overflow bindings ([c334f12](https://github.com/liunnn1994/sd-design/commit/c334f12cd7dca5580810d31138474e9002c99bf3))
- **timeline:** preserve spinProps size override for pending dot ([f324f11](https://github.com/liunnn1994/sd-design/commit/f324f1186216b6dfa038e9f264c905886c00bef2))
- **tree:** keep switcher hidden for plain leaves in node-switcher ([8173e7e](https://github.com/liunnn1994/sd-design/commit/8173e7e5c9af9d632c4a2e917551dbfb89ac599d))
- **tree:** widen node-switcher computed types to VNodeChild ([62a2a03](https://github.com/liunnn1994/sd-design/commit/62a2a03aca69f5b1d67e3a85b44c8c471c7b1e74))
- **typography:** capture all operation nodes in ellipsis measure ([50d410b](https://github.com/liunnn1994/sd-design/commit/50d410bec24098d4347d00dbb7bac95a38312413))
- 修复 OverflowList 示例宽度控制 ([2227863](https://github.com/liunnn1994/sd-design/commit/2227863daec3282f4ffef314bc0d0f5d2d6ca493))
- 修复 Popconfirm 异步关闭示例 ([dd137e0](https://github.com/liunnn1994/sd-design/commit/dd137e08a479429c5bcf3c0974a11d0a7bb7fa63))
- 修复 Radio 非受控交互 ([bba3e64](https://github.com/liunnn1994/sd-design/commit/bba3e64e47269c47f31b9f30f82d6d1e88be7dfa))
- 修复 Slider 百分比精度警告 ([dd724b7](https://github.com/liunnn1994/sd-design/commit/dd724b7aabe04fd86d843081c5b8367e191fafeb))
- 修复 Space 子组件重复挂载 ([ff3e3ce](https://github.com/liunnn1994/sd-design/commit/ff3e3ce40c990da7b3c5242a031e4b5a3c03ae16))
- 修复 TagGroup 示例连续拖拽 ([34be853](https://github.com/liunnn1994/sd-design/commit/34be8536f697a726b532d3d8eb0c707c5001808b))
- 修复 Upload 列表过渡警告 ([12eff88](https://github.com/liunnn1994/sd-design/commit/12eff88e804af6a45583456ec4be5d612fa4f6a7))
- 修复时间选择器当前时间文案 ([da675c0](https://github.com/liunnn1994/sd-design/commit/da675c0469d95010232dd25d4d4aea6bfc73177c))
- 修复输入示例失焦 ([47bba36](https://github.com/liunnn1994/sd-design/commit/47bba369713fb57de54bfa736cdb724765efa8f0))

### Features

- 🆕 tooltip 组件新增鼠标穿透功能 ([f739e78](https://github.com/liunnn1994/sd-design/commit/f739e7831cdad4dd81cab8b0abd7af3b02ac8784))
- 🆕 移除废弃的 overflow-list 组件 ([ca1ad0d](https://github.com/liunnn1994/sd-design/commit/ca1ad0d54bb827203a47057f1e6e13c5d521d780))
- 🆕 避免文本超出范围 ([899c450](https://github.com/liunnn1994/sd-design/commit/899c450c0df37069b632dbd7f20a571c03c489a2))

### BREAKING CHANGES

- 🧨 OverflowList 现已不可用

# [3.30.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.29.0...web-vue-v3.30.0) (2026-08-07)

### Bug Fixes

- 🐛 修复 ts 报错 ([7346a3e](https://github.com/liunnn1994/sd-design/commit/7346a3e8e62cfde46fdbecbc03c7e031f3d6095b))

### Features

- 🆕 JsonForm 添加 inputMask 支持 ([58b2c41](https://github.com/liunnn1994/sd-design/commit/58b2c41fcce6cd7b3b82995501314cf398247bbb))

# [3.29.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.28.0...web-vue-v3.29.0) (2026-08-06)

### Features

- 🆕 crud 组件新增 action_middle slot ([7553a9d](https://github.com/liunnn1994/sd-design/commit/7553a9d0d599213544ff7867c377cd4cd31c5ab7))
- 🆕 新增开始按钮的显隐 ([6d8c12d](https://github.com/liunnn1994/sd-design/commit/6d8c12de93835bd9ecd2bfa1c9d55659a69540c4))

# [3.28.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.27.0...web-vue-v3.28.0) (2026-08-06)

### Bug Fixes

- 🐛 修复错误的样式 ([2798b88](https://github.com/liunnn1994/sd-design/commit/2798b88d313fb75461f1f1a2331e2951c2f327dd))

### Features

- 🆕 新增 InputMask 组件 ([bafc2ea](https://github.com/liunnn1994/sd-design/commit/bafc2ea04a3ae966c1a8ffdf7d2f00e2d8cd5a1d))
- 🆕 给crud的按钮/link添加props ([54b3fc3](https://github.com/liunnn1994/sd-design/commit/54b3fc36363079685ed5ac36a765f06cb4f587f2))

# [3.27.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.26.0...web-vue-v3.27.0) (2026-08-05)

### Features

- 🆕 新增思考球组件 ([f046d1e](https://github.com/liunnn1994/sd-design/commit/f046d1e9317d0a5dded6212efdb933077862a384))
- 🆕 移除不再维护的语言，仅保留简体中文和英文 ([67c63d3](https://github.com/liunnn1994/sd-design/commit/67c63d379f5a8aeeba461665b6403b6e9908a19d))

# [3.26.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.25.0...web-vue-v3.26.0) (2026-07-30)

### Features

- 🆕 更新 mcp，支持 `2026-07-28` 协议并兼容旧版握手 ([7c85920](https://github.com/liunnn1994/sd-design/commit/7c85920aa50302452238cefc132d325b40a1df48))

# [3.25.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.24.1...web-vue-v3.25.0) (2026-07-30)

### Features

- 🆕 模型选择器组件新增自定义触发器功能 ([db7265c](https://github.com/liunnn1994/sd-design/commit/db7265ceef65566b08452788867120878eb8c305))

## [3.24.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.24.0...web-vue-v3.24.1) (2026-07-30)

### Bug Fixes

- 🐛 修复深色模式没有适配的问题 ([e55a0ba](https://github.com/liunnn1994/sd-design/commit/e55a0ba9dafc8e3bb724614b62cd119f7ba4b262))

# [3.24.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.23.0...web-vue-v3.24.0) (2026-07-29)

### Bug Fixes

- 🐛 修复富文本编辑器潜在的性能问题 ([86560da](https://github.com/liunnn1994/sd-design/commit/86560da938ccd265d08b0b48f9de21d348005d5a))
- 🐛 由于 recorder-core 的类型都是 any，在这添加一个兜底的类型避免警告 ([0a60ee3](https://github.com/liunnn1994/sd-design/commit/0a60ee37b5ceddd185655b28f737a5067d722e93))

### Features

- 🆕 新增模型选择组件 ([c267ad8](https://github.com/liunnn1994/sd-design/commit/c267ad866fd7b024830dfe8c4275c11cb58eac52))

# [3.23.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.3...web-vue-v3.23.0) (2026-07-29)

### Features

- 🆕 使用 recorder-core 替换自封装的逻辑 ([2997598](https://github.com/liunnn1994/sd-design/commit/2997598412a40da4324dd80b6eeb8c78daf3fc98))

## [3.22.3](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.2...web-vue-v3.22.3) (2026-07-29)

### Bug Fixes

- 🐛 修复卡死渲染进程的问题 ([de3f9cc](https://github.com/liunnn1994/sd-design/commit/de3f9cc787338442e1acb3659387b3d9de018295))

## [3.22.2](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.1...web-vue-v3.22.2) (2026-07-29)

### Bug Fixes

- 🐛 修复 AudioWorklet 互斥的问题 ([e35a8cd](https://github.com/liunnn1994/sd-design/commit/e35a8cd341531912580507a7c7a22836ab2335e3))

## [3.22.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.22.0...web-vue-v3.22.1) (2026-07-29)

### Bug Fixes

- 🐛 修复 AudioContext 没有复用导致卡死的问题 ([3493b78](https://github.com/liunnn1994/sd-design/commit/3493b788d9baa3c8d3089170503ca39f20d08764))

# [3.22.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.21.0...web-vue-v3.22.0) (2026-07-28)

### Features

- 🆕 为下拉组件添加 ellipsis 支持 ([6e57eab](https://github.com/liunnn1994/sd-design/commit/6e57eaba60693b7f2091bbd989a0162b697ab9d3))

# [3.21.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.20.0...web-vue-v3.21.0) (2026-07-28)

### Features

- 🆕 Cascader、TimePicker、ColorPicker、DatePicker 全系列添加自定义元素功能 ([e39d9c2](https://github.com/liunnn1994/sd-design/commit/e39d9c241ecc55e82b2955ceda74491ff0c84a72))
- 🆕 移除package.json中的版本号，由tag决定版本 ([832310c](https://github.com/liunnn1994/sd-design/commit/832310c41d38c39196be161cf156cb6e61acf01f))

# [3.20.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.19.0...web-vue-v3.20.0) (2026-07-28)

### Features

- 🆕 spin 添加 delay 参数 ([35b4c32](https://github.com/liunnn1994/sd-design/commit/35b4c32398cfe98610c6d86524a7f9fe5e963748))
- 🆕 不再支持浏览器自带的语音识别，改为语音采集 ([57f04c5](https://github.com/liunnn1994/sd-design/commit/57f04c5dc53399fefe23f51e5c0889bb49f10b71))
- 🆕 新增定义 suffix 位置的功能 ([3c37fa5](https://github.com/liunnn1994/sd-design/commit/3c37fa5c5ec75b702eee7c6e02cae4157c01796a))

# [3.19.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.18.0...web-vue-v3.19.0) (2026-07-27)

### Bug Fixes

- 🐛 修复 sender 构建 dts 时的 TS2883 错误 ([f1d5759](https://github.com/liunnn1994/sd-design/commit/f1d57591c9ee49a641e4cf341d3f34afe0a28daa))

### Features

- 🆕 sender 词槽模式使用组件库的富文本编辑器 ([44f4d5d](https://github.com/liunnn1994/sd-design/commit/44f4d5dce7f1bec01179b6220bcd6962cc507a46))
- 🆕 新增 sender 组件 ([21ebb9a](https://github.com/liunnn1994/sd-design/commit/21ebb9a4dd7fa72f9229c312c8b3f93c9086fc66))
- 🆕 新增fit-width属性 ([6684697](https://github.com/liunnn1994/sd-design/commit/6684697fc9964cf4c6c4c03d940993be2610b7ce))
- 🆕 新增富文本编辑器 ([5844f8b](https://github.com/liunnn1994/sd-design/commit/5844f8be3c81b43bdbcad38d4f1ade016a8aba3a))

# [3.18.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.17.0...web-vue-v3.18.0) (2026-07-24)

### Features

- 🆕 a2ui协议更新到 0.9.1 ([d987ff0](https://github.com/liunnn1994/sd-design/commit/d987ff02fa613c9bb5b351b264c1f10a7eacfddc))
- 🆕 悬浮组件底层改为 floating-ui 实现 ([e0f0ee8](https://github.com/liunnn1994/sd-design/commit/e0f0ee8d8d4ed83997d8a3c92c2bf62e94192da3))

# [3.17.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.16.1...web-vue-v3.17.0) (2026-07-23)

### Bug Fixes

- 🐛 修复 ts 报错 ([306a21d](https://github.com/liunnn1994/sd-design/commit/306a21db3aa375ae67284975ed254167881ba459))
- 🐛 修复下拉没有数据的时候错误的展现形式 ([f01f59a](https://github.com/liunnn1994/sd-design/commit/f01f59aa7773025cf267c173b68ce2c46148b4b0))

### Features

- 🆕 按钮组件添加屏幕阅读器兼容 ([d978d9a](https://github.com/liunnn1994/sd-design/commit/d978d9aab9237d0a85bfa8368c015f399d66264a))
- 🆕 添加 kv-list 组件 ([aae5a79](https://github.com/liunnn1994/sd-design/commit/aae5a79b92d222c59a92ba1cdaf5e641d5b58057))

## [3.16.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.16.0...web-vue-v3.16.1) (2026-07-20)

### Bug Fixes

- 🐛 修复 crudTable 中没有读取全局配置的问题 ([0274010](https://github.com/liunnn1994/sd-design/commit/0274010224e9d42ea027e5eafb68ad9f8881adf6))
- 🐛 修复页码选择可清空的bug ([23b480c](https://github.com/liunnn1994/sd-design/commit/23b480c58f17e8ec68a1288c65d9d06d3c6951d7))

# [3.16.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.15.0...web-vue-v3.16.0) (2026-07-20)

### Bug Fixes

- 🐛 修复错误的组件引用 ([bb97a05](https://github.com/liunnn1994/sd-design/commit/bb97a05a57d49cba38af62670f22bd51dfa66e08))

### Features

- 🆕 crud table 添加 fullheight 参数 ([48b39dc](https://github.com/liunnn1994/sd-design/commit/48b39dc2fd125f096ded118c006337d538525052))
- 🆕 为 colorPicker 添加全局配置 ([bbad681](https://github.com/liunnn1994/sd-design/commit/bbad6819541ff9a3db09f2a4af0680887d3f6f26))

# [3.15.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.14.0...web-vue-v3.15.0) (2026-07-18)

### Bug Fixes

- 🐛 修复 resize-box padding 测试与 ResizeObserver 的竞态 ([88e260b](https://github.com/liunnn1994/sd-design/commit/88e260bcb78e88fdd0ad60aa086b3858ee0cd4c6))

### Features

- 🆕 完善 a11y ([308c01a](https://github.com/liunnn1994/sd-design/commit/308c01a0482ee26a1de407270e75e812c9c1db34))
- 🆕 新增 demo，修复测试用例 ([44cab60](https://github.com/liunnn1994/sd-design/commit/44cab607bff12f6e1ef67d9396c82c201291b836))
- 🆕 新增基础增删改查组件 ([832d622](https://github.com/liunnn1994/sd-design/commit/832d622511e854f1ac74010fd5d58701fd832dce))

# [3.14.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.13.0...web-vue-v3.14.0) (2026-07-18)

### Bug Fixes

- 🐛 修复 Button fragment 根导致的 attrs 丢失与 ResizeObserver 崩溃 ([57823ed](https://github.com/liunnn1994/sd-design/commit/57823ed652a90d1eb415d2b91aa1e26dc0be47f0))

### Features

- 🆕 优化动画效果以及性能 ([d0f821c](https://github.com/liunnn1994/sd-design/commit/d0f821c41eda87bf72f387c39d56ddb624b1f7b4))
- 🆕 新增 a11y 支持 ([5d60d33](https://github.com/liunnn1994/sd-design/commit/5d60d332ecb7b86397e5599213611ac4d45310f4))
- 🆕 根据苹果设计原则优化按钮 ([abbc1ba](https://github.com/liunnn1994/sd-design/commit/abbc1badab9064b93614ebbb72c6d028dd525b31))

# [3.13.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.12.0...web-vue-v3.13.0) (2026-07-16)

### Features

- 🆕 按钮添加 tooltip ([e8785b9](https://github.com/liunnn1994/sd-design/commit/e8785b95e7009139f62ec2605e8ba35416a83e21))
- 🆕 操作型组件添加 readonly ([930bd7d](https://github.com/liunnn1994/sd-design/commit/930bd7d0c39d11084c6a5bed1a571894c69fce00))
- 🆕 更新 scrollbar 样式，添加系统级样式 ([94e8404](https://github.com/liunnn1994/sd-design/commit/94e8404b6a6fa14af280787d562381bdf141998e))
- 🆕 给 card 和 tabs 添加 fullHeight 属性 ([d7430b4](https://github.com/liunnn1994/sd-design/commit/d7430b4376056eaf13fe7860cd78f4de845b9e66))

# [3.12.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.11.0...web-vue-v3.12.0) (2026-07-15)

### Features

- 🆕 autoHideSuspend 默认设置为 false ([8ead4b5](https://github.com/liunnn1994/sd-design/commit/8ead4b5aa0ec8f44fdc383fde2699effd73a8703))

# [3.11.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.10.0...web-vue-v3.11.0) (2026-07-15)

### Features

- 🆕 新增可选择卡片组件 ([83a7113](https://github.com/liunnn1994/sd-design/commit/83a7113f253692e17fcbf900ffdd2a5a4cd70693))

# [3.10.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.9.0...web-vue-v3.10.0) (2026-07-14)

### Features

- 🆕 tree 组件添加隐藏 switcher 的参数 ([9d11b28](https://github.com/liunnn1994/sd-design/commit/9d11b288c94251753dbc17344ddaa0b12dbd6a53))
- 🆕 使用 pdfjs 渲染 pdf ([da3ceab](https://github.com/liunnn1994/sd-design/commit/da3ceabe84c10c928a817fb619a4c1e0ec97abd1))
- 🆕 新增 mcp ([c931d96](https://github.com/liunnn1994/sd-design/commit/c931d96442429a423213f78e55a6cbe4f889d971))

# [3.9.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.8.0...web-vue-v3.9.0) (2026-07-13)

### Features

- 🆕 sd-design 添加前缀后缀功能 ([03001b5](https://github.com/liunnn1994/sd-design/commit/03001b53f2db9764413d7899eea0b3455faf53fb))

# [3.8.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.7.1...web-vue-v3.8.0) (2026-07-10)

### Bug Fixes

- 🐛 修复文件预览里嵌套图片时的错误 ([4783782](https://github.com/liunnn1994/sd-design/commit/4783782ed1191ec1eddb0d06c08a0ed536f05322))

### Features

- 🆕 测试用例全部从单元测试转换为真实的e2e测试 ([49821ea](https://github.com/liunnn1994/sd-design/commit/49821ea1ec3a2af6c6774f8b6f90d56fbe44c576))

## [3.7.1](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.7.0...web-vue-v3.7.1) (2026-07-09)

### Bug Fixes

- 🐛 修复错误的 responsive 计算 ([7a020b4](https://github.com/liunnn1994/sd-design/commit/7a020b4bbaee73451ede2c7d623dd1ca4d8eefcd))

# [3.7.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.6.0...web-vue-v3.7.0) (2026-07-09)

### Features

- 🆕 移除历史兼容层，统一使用 v-model ([7bf0921](https://github.com/liunnn1994/sd-design/commit/7bf09218f7b68dacfeeabb3a0e7ce6fe38c40fb8))

# [3.6.0](https://github.com/liunnn1994/sd-design/compare/web-vue-v3.5.0...web-vue-v3.6.0) (2026-07-08)

### Bug Fixes

- 🐛 修复 trigger 嵌套的时候无法关闭的问题 ([dffee59](https://github.com/liunnn1994/sd-design/commit/dffee5943a76b609cba8e82a02dbbe8d08447e1f))
- 🐛 修复错误的 Vue runtime 引用，会导致在线编辑中的 vue 实例引用不是一个，触发意外错误 ([41bf83a](https://github.com/liunnn1994/sd-design/commit/41bf83ae61cdb452853f32f8cf95fc0afc2cf7c0))

### Features

- 🆕 使用Image组件预览图片，videojs预览音视频 ([14735ee](https://github.com/liunnn1994/sd-design/commit/14735ee3a881bbd7be71890d1b8ea01a31817712))

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
