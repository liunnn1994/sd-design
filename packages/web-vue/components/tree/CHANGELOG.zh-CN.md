```yaml
changelog: true
```

## 2.56.0

`2024-07-26`

### 🐛 问题修复

- 修复树折叠动画不生效问题 ([#3234](https://github.com/liunnn1994/sd-design/pull/3234))

## 2.55.1

`2024-03-29`

### 💅 样式更新

- 修复 scrollHeight 计算异常问题 ([#3044](https://github.com/liunnn1994/sd-design/pull/3044))

## 2.55.0

`2024-03-15`

### 🆕 新增功能

- `title` 插槽新增 `title` 参数 ([#3024](https://github.com/liunnn1994/sd-design/pull/3024))

## 2.54.6

`2024-03-01`

### 🐛 问题修复

- 解决无效的属性名称控制台警告问题 ([#2995](https://github.com/liunnn1994/sd-design/pull/2995))

## 2.54.3

`2024-01-19`

## 2.45.0

`2023-04-07`

### 🆕 新增功能

- 树节点增加 data-level 和 data-key 数据属性 ([#2192](https://github.com/liunnn1994/sd-design/pull/2192))

## 2.44.2

`2023-03-17`

### 🐛 问题修复

- 调整 select 和 update:selectedKeys, check 和 update:checkedKeys 的触发顺序 ([#2228](https://github.com/liunnn1994/sd-design/pull/2228))

## 2.34.0

`2022-07-29`

### 🆕 新增功能

- 给 slot 添加节点状态信息 ([#1469](https://github.com/liunnn1994/sd-design/pull/1469))

## 2.33.0

`2022-07-08`

### 🐛 问题修复

- 修复子树展开动画中为处理过滤数据的问题 ([#1397](https://github.com/liunnn1994/sd-design/pull/1397))
- 修复设置 defaultExpandSelected 失效的问题 ([#1362](https://github.com/liunnn1994/sd-design/pull/1362))

## 2.32.0

`2022-06-24`

### 🐛 问题修复

- 修复点击半选状态的节点显示错误的问题 ([#1331](https://github.com/liunnn1994/sd-design/pull/1331))

## 2.27.0

`2022-05-13`

### 🆕 新增功能

- `checkable` 支持函数格式 ([#1119](https://github.com/liunnn1994/sd-design/pull/1119))
- `seleable` 支持函数格式 ([#1119](https://github.com/liunnn1994/sd-design/pull/1119))
- 新增属性 `actionOnNodeClick`，可用于开启点击节点触发展开 ([#1119](https://github.com/liunnn1994/sd-design/pull/1119))

### 🐛 问题修复

- 修复当 key 为 number 的时候，expandAll 失败的问题 ([#1113](https://github.com/liunnn1994/sd-design/pull/1113))

## 2.25.0

`2022-04-22`

### 💎 功能优化

- 调用方法操作单个节点的时候在回调参数重增加目标节点信息 ([#1021](https://github.com/liunnn1994/sd-design/pull/1021))

## 2.24.0

`2022-04-15`

### 🆎 类型修正

- `FieldNames` 修改为 `TreeFieldNames` ([#977](https://github.com/liunnn1994/sd-design/pull/977))

## 2.21.0

`2022-03-25`

### 🆕 新增功能

- 新增配置项 `onlyCheckLeaf` ([#876](https://github.com/liunnn1994/sd-design/pull/876))
- 支持关闭展开时的动效 ([#867](https://github.com/liunnn1994/sd-design/pull/867))

### 💅 样式更新

- 修复连接线显示错乱的问题 ([#865](https://github.com/liunnn1994/sd-design/pull/865))

### 🆎 类型修正

- 增加 filednames 的自定义 icon 功能 ([#848](https://github.com/liunnn1994/sd-design/pull/848))

## 2.20.1

`2022-03-21`

### 🐛 问题修复

- 修复新版本中展开事件名称错误的问题 ([#853](https://github.com/liunnn1994/sd-design/pull/853))

## 2.20.0

`2022-03-18`

### 🆕 新增功能

- 添加树的实例方法 ([#837](https://github.com/liunnn1994/sd-design/pull/837))

## 2.19.0

`2022-03-11`

### 🆕 新增功能

- 支持设置半选节点 ([#809](https://github.com/liunnn1994/sd-design/pull/809))
- 实例上新增可调用的方法: `getCheckedNodes` `getSelectedNodes` `getExpandedNodes` `getHalfCheckedNodes` ([#809](https://github.com/liunnn1994/sd-design/pull/809))

### 🐛 问题修复

- 修复当节点找不到的时候组件渲染出错的问题 ([#800](https://github.com/liunnn1994/sd-design/pull/800))

## 2.18.0-beta.2

`2022-02-25`

### 🆕 新增功能

- 新增插槽 `icon` 用于全局定制节点图标 ([#710](https://github.com/liunnn1994/sd-design/pull/710))

## 2.9.0

`2021-12-03`

### 🆕 新增功能

- 新增属性 `default-expand-selected` `default-expand-checked` `auto-expand-parent` ([#322](https://github.com/liunnn1994/sd-design/pull/322))

## 2.8.0

`2021-12-01`

### 🐛 问题修复

- 动态加载节点后更新勾选状态 ([#206](https://github.com/liunnn1994/sd-design/pull/206))

## 2.7.0

`2021-11-26`

### 💅 样式更新

- 让树节点的内容垂直居中 ([#260](https://github.com/liunnn1994/sd-design/pull/260))

## 2.4.0

`2021-11-17`

### 🆕 新增功能

- `key` 支持 `number` 类型 ([#169](https://github.com/liunnn1994/sd-design/pull/169))

## 2.3.0

`2021-11-12`

### 🐛 问题修复

- 修复设置 `default-checked-keys` 无效的问题 ([#131](https://github.com/liunnn1994/sd-design/pull/131))
