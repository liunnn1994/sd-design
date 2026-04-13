```yaml
meta:
  type: Component
  category: Data Entry
title: Input
description: Basic form components have been expanded on the basis of native controls and can be used in combination.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/status.md

@import ./**demo**/size.md

@import ./**demo**/prefix.md

@import ./**demo**/prepend.md

@import ./**demo**/word-limit.md

@import ./**demo**/group.md

@import ./**demo**/search.md

@import ./**demo**/search-button.md

@import ./**demo**/search-loading.md

@import ./**demo**/password.md

## API

### `<input>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | Value | `string` | `-` |  |
| default-value | Default value (uncontrolled state) | `string` | `''` |  |
| size | Input size | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| allow-clear | Whether to allow the input to be cleared | `boolean` | `false` |  |
| disabled | Whether to disable | `boolean` | `false` |  |
| readonly | Whether it is read-only | `boolean` | `false` |  |
| error | Whether it is an error state | `boolean` | `false` |  |
| placeholder | Prompt text | `string` | `-` |  |
| max-length | Enter the maximum length of the value, the errorOnly attribute was added in version 2.12.0 | `number \| { length: number; errorOnly?: boolean }` | `0` |  |
| show-word-limit | Whether to display word count | `boolean` | `false` |  |
| word-length | Calculation method of word length | `(value: string) => number` | `-` |  |
| word-slice | Character interception method, used together with wordLength | `(value: string, maxLength: number) => string` | `-` | 2.12.0 |
| input-attrs | Attributes of inner input elements | `object` | `-` | 2.27.0 |
| prepend | Prepend | `string` | `-` | 2.57.0 |
| append | Append | `string` | `-` | 2.57.0 |

### `<input>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| input | Triggered when the user enters | value: `string`<br>ev: `Event` |
| change | Only triggered when the input box is out of focus or when you press Enter | value: `string`<br>ev: `Event` |
| press-enter | Triggered when the user presses enter | ev: `KeyboardEvent` |
| clear | Triggered when the user clicks the clear button | ev: `MouseEvent` |
| focus | Triggered when the input box gets focus | ev: `FocusEvent` |
| blur | Triggered when the input box loses focus | ev: `FocusEvent` |

### `<input>` Methods

| Method | Description                   | Parameters | Return |
| ------ | ----------------------------- | ---------- | :----: |
| focus  | Make the input box focus      | -          |   -    |
| blur   | Make the input box lose focus | -          |   -    |

### `<input>` Slots

| Slot Name | Description | Parameters |
| --------- | ----------- | ---------- |
| append    | Append      | -          |
| prepend   | Prepend     | -          |
| suffix    | Suffix      | -          |
| prefix    | Prefix      | -          |

### `<input-password>` Props

| Attribute                | Description                     | Type      | Default |
| ------------------------ | ------------------------------- | --------- | :-----: |
| visibility **(v-model)** | Whether is visible              | `boolean` |   `-`   |
| default-visibility       | Default visibility              | `boolean` | `true`  |
| invisible-button         | Whether to show visible buttons | `boolean` | `true`  |

### `<input-password>` Events

| Event Name        | Description                      | Parameters         |
| ----------------- | -------------------------------- | ------------------ |
| visibility-change | Callback when visibility changes | visible: `boolean` |

### `<input-search>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| search-button | Whether it is the rear button mode | `boolean` | `false` |  |
| loading | Whether it is loading state | `boolean` | `false` |  |
| disabled | Whether to disable | `boolean` | `false` |  |
| size | Input size | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| button-text | The text of the search button will replace the original icon after use | `string` | `-` | 2.16.0 |
| button-props | Button props | `ButtonProps` | `-` |  |

### `<input-search>` Events

| Event Name | Description                                 | Parameters                          |
| ---------- | ------------------------------------------- | ----------------------------------- |
| search     | Triggered when the search button is clicked | value: `string`<br>ev: `MouseEvent` |
