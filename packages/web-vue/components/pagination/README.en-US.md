```yaml
meta:
  type: Component
  category: Navigation
title: Pagination
description: Use paging to control the amount of information in a single page, and page jumps can also be performed.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/ellipsis.md

@import ./**demo**/page-size.md

@import ./**demo**/jumper.md

@import ./**demo**/size.md

@import ./**demo**/simple.md

@import ./**demo**/total.md

@import ./**demo**/all.md

@import ./**demo**/custom.md

## API

### `<pagination>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| total **(required)** | Total number of data | `number` | `-` |  |
| current **(v-model)** | Current page number | `number` | `-` |  |
| default-current | The default number of pages (uncontrolled state) | `number` | `1` |  |
| page-size **(v-model)** | Number of data items displayed per page | `number` | `-` |  |
| default-page-size | The number of data items displayed per page by default (uncontrolled state) | `number` | `10` |  |
| disabled | Whether to disable | `boolean` | `false` |  |
| hide-on-single-page | Whether to hide pagination when single page | `boolean` | `false` |  |
| simple | Whether it is simple mode | `boolean` | `false` |  |
| show-total | Whether to display the total number of data | `boolean` | `false` |  |
| show-more | Whether to show more buttons | `boolean` | `false` |  |
| show-jumper | Whether to show jump | `boolean` | `false` |  |
| show-page-size | Whether to display the data number selector | `boolean` | `false` |  |
| page-size-options | Selection list of data number selector | `number[]` | `[10, 20, 30, 40, 50]` |  |
| page-size-props | Props of data number selector | `SelectProps` | `-` |  |
| size | The size of the page selector | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| page-item-style | The style of the paging button | `CSSProperties` | `-` |  |
| active-page-item-style | The style of the current paging button | `CSSProperties` | `-` |  |
| base-size | Calculate and display the number of omitted bases. Display the omitted number as `baseSize + 2 * bufferSize` | `number` | `6` |  |
| buffer-size | When the ellipsis is displayed, the number of page numbers displayed on the left and right of the current page number | `number` | `2` |  |
| auto-adjust | Whether to adjust the page number when changing the number of data | `boolean` | `true` | 2.34.0 |

### `<pagination>` Events

| Event Name       | Description                                     | Parameters         |
| ---------------- | ----------------------------------------------- | ------------------ |
| change           | Triggered when page number changes              | current: `number`  |
| page-size-change | Triggered when the number of data items changes | pageSize: `number` |

### `<pagination>` Slots

| Slot Name | Description | Parameters | version |
| --- | --- | --- | :-- |
| total | Total | total: `number` | 2.9.0 |
| page-item-ellipsis | Page item (ellipsis) | - | 2.9.0 |
| page-item-step | Page item (step) | type: `'previous'\|'next'`The type of page item step | 2.9.0 |
| page-item | Page item | page: `number`The page number of the paging button | 2.9.0 |
