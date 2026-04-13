```yaml
meta:
  type: Component
  category: Navigation
title: PageHeader
description: The page header is located at the top of the page container and serves as a content overview and guide page-level operations. Including breadcrumbs, titles, etc.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/breadcrumb.md

@import ./**demo**/transparent.md

@import ./**demo**/content.md

## API

### `<page-header>` Props

| Attribute | Description                     | Type      | Default |
| --------- | ------------------------------- | --------- | :-----: |
| title     | Main title                      | `string`  |   `-`   |
| subtitle  | Subtitle                        | `string`  |   `-`   |
| show-back | Whether to show the back button | `boolean` | `true`  |

### `<page-header>` Events

| Event Name | Description                             | Parameters     |
| ---------- | --------------------------------------- | -------------- |
| back       | Emitted when the back button is clicked | event: `Event` |

### `<page-header>` Slots

| Slot Name  | Description   | Parameters | version |
| ---------- | ------------- | ---------- | :------ |
| breadcrumb | Breadcrumb    | -          |         |
| back-icon  | Back icon     | -          | 2.36.0  |
| title      | Main title    | -          |         |
| subtitle   | Subtitle      | -          |         |
| extra      | Extra content | -          |         |
