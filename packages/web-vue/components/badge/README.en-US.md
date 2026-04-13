```yaml
meta:
  type: Component
  category: Data Display
title: Badge
description: Badge normally appears in the upper right corner of the icon or text to prompt important information.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/alone.md

@import ./**demo**/dot.md

@import ./**demo**/text.md

@import ./**demo**/max.md

@import ./**demo**/status.md

@import ./**demo**/color.md

## API

### `<badge>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| text | Set the display text of the status dot | `string` | `-` |
| dot | Whether to display a red dot instead of `count` | `boolean` | `false` |
| dot-style | Customize badge dot style | `object` | `-` |
| max-count | Max count to show. If count is larger than this value, it will be displayed as `${maxCount}+` | `number` | `99` |
| offset | Set offset of the badge dot | `number[]` | `[]` |
| color | Customize dot color | `ColorType \| string` | `-` |
| status | Badge status | `'normal' \| 'processing' \| 'success' \| 'warning' \| 'danger'` | `-` |
| count | Number to show in badge | `number` | `-` |
