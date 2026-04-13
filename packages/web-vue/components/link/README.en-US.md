```yaml
meta:
  type: Component
  category: Common
title: Link
description: The basic style of the link.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/status.md

@import ./**demo**/hoverable.md

@import ./**demo**/icon.md

@import ./**demo**/loading.md

## API

### `<link>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| href | Link address | `string` | `-` |  |
| status | Link status | `'normal' \| 'warning' \| 'success' \| 'danger'` | `'normal'` |  |
| hoverable | Whether to hide background when hover | `boolean` | `true` | 2.7.0 |
| icon | icon | `boolean` | `false` | 2.7.0 |
| loading | Whether the link is in the loading state | `boolean` | `false` | 2.37.0 |
| disabled | Whether the link is disabled | `boolean` | `false` |  |

### `<link>` Events

| Event Name | Description                      | Parameters       |
| ---------- | -------------------------------- | ---------------- |
| click      | Emitted when the link is clicked | ev: `MouseEvent` |
