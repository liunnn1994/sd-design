```yaml
meta:
  type: Component
  category: Data Entry
title: InputNumber
description: Only input boxes in numeric format are allowed.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/mode.md

@import ./**demo**/size.md

@import ./**demo**/precision.md

@import ./**demo**/prefix.md

@import ./**demo**/step-icon.md

@import ./**demo**/format.md

@import ./**demo**/model.md

## API

### `<input-number>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | Value | `number` | `-` |  |
| default-value | Default value (uncontrolled mode) | `number` | `-` |  |
| mode | Mode (`embed`: button embedded mode, `button`: left and right button mode) | `'embed' \| 'button'` | `'embed'` |  |
| precision | Precision | `number` | `-` |  |
| step | Number change step | `number` | `1` |  |
| disabled | Whether to disable | `boolean` | `false` |  |
| error | Whether it is an error state | `boolean` | `false` |  |
| max | Max | `number` | `Infinity` |  |
| min | Min | `number` | `-Infinity` |  |
| formatter | Define the display value of the input | `func` | `-` |  |
| parser | Convert from `formatter` to number, and use with `formatter` | `func` | `-` |  |
| placeholder | Input prompt text | `string` | `-` |  |
| hide-button | Whether to hide the button | `boolean` | `false` |  |
| size | Input size | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| allow-clear | Whether to allow the input to be cleared | `boolean` | `false` |  |
| model-event | Trigger event for `v-model` | `'change' \| 'input'` | `'change'` |  |
| read-only | Readonly | `boolean` | `false` | 2.33.1 |
| input-attrs | Attributes of inner input elements | `object` | `-` | 2.52.0 |

### `<input-number>` Events

| Event Name | Description | Parameters | version |
| --- | --- | --- | :-- |
| change | Triggered when the value changes | value: `number \| undefined`<br>ev: `Event` |  |
| focus | Triggered when the input gets focus | ev: `FocusEvent` |  |
| blur | Triggered when the input box loses focus | ev: `FocusEvent` |  |
| clear | Triggered when the user clicks the clear button | ev: `Event` | 2.23.0 |
| input | Triggered on input | value: `number \| undefined`<br>inputValue: `string`<br>ev: `Event` | 2.27.0 |
| keydown | Triggered on keydown | ev: `MouseEvent` | 2.56.0 |

### `<input-number>` Methods

| Method | Description                   | Parameters | Return |
| ------ | ----------------------------- | ---------- | :----: |
| focus  | Make the input box focus      | -          |   -    |
| blur   | Make the input box lose focus | -          |   -    |

### `<input-number>` Slots

| Slot Name | Description | Parameters |
| --------- | ----------- | ---------- |
| minus     | Minus       | -          |
| plus      | Plus        | -          |
| append    | Append      | -          |
| prepend   | Prepend     | -          |
| suffix    | Suffix      | -          |
| prefix    | Prefix      | -          |
