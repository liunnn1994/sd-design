```yaml
meta:
  type: Component
  category: Data Display
title: Collapse
description: The content area that can be collapsed/expanded.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/accordion.md

@import ./**demo**/nested.md

@import ./**demo**/border-less.md

@import ./**demo**/extra.md

@import ./**demo**/expand-icon.md

@import ./**demo**/custom.md

@import ./**demo**/icon-position.md

@import ./**demo**/destroy.md

## API

### `<collapse>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| active-key **(v-model)** | The `key` of the currently expanded panel | `(string \| number)[]` | `-` |  |
| default-active-key | The `key` of the panel expanded by default (uncontrolled mode) | `(string \| number)[]` | `[]` |  |
| accordion | Whether to enable accordion mode | `boolean` | `false` |  |
| show-expand-icon | Whether to show the expand icon | `boolean` | `-` | 2.33.0 |
| expand-icon-position | The location where the expand icon is displayed | `'left' \| 'right'` | `'left'` |  |
| bordered | Whether to show the border | `boolean` | `true` |  |
| destroy-on-hide | Whether to destroy content when hidden | `boolean` | `false` | 2.27.0 |

### `<collapse>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Emitted when the expanded panel changes | activeKey: `(string \| number)[]`<br>ev: `Event` |

### `<collapse-item>` Props

| Attribute        | Description                            | Type      | Default | version |
| ---------------- | -------------------------------------- | --------- | :-----: | :------ |
| header           | The title of the panel                 | `string`  |   `-`   |         |
| disabled         | Whether to disable                     | `boolean` | `false` |         |
| show-expand-icon | Whether to show the expand icon        | `boolean` | `true`  |         |
| destroy-on-hide  | Whether to destroy content when hidden | `boolean` | `false` | 2.27.0  |

### `<collapse-item>` Slots

| Slot Name | Description | Parameters | version |
| --- | --- | --- | :-- |
| extra | Extra Content | - |  |
| expand-icon | Expand icon | active: `boolean`<br>disabled: `boolean`<br>position: `'left' \| 'right'` | 2.33.0 |
| header | The title of the panel | - |  |

## FAQ

### The `key` attribute of `<CollapseItem>` components is required

In the `<Collapse>` component, each `<CollapseItem>` needs to specify a unique `key` attribute, and the `key` corresponding to the value in `activeKey`.
