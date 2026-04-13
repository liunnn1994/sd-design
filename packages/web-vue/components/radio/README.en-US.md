```yaml
meta:
  type: Component
  category: Data Entry
title: Radio
description: In a set of related and mutually exclusive data, the user can only select one option.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/control.md

@import ./**demo**/group.md

@import ./**demo**/options.md

@import ./**demo**/direction.md

@import ./**demo**/button.md

@import ./**demo**/size.md

@import ./**demo**/layout.md

@import ./**demo**/custom.md

## API

### `<radio>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| model-value **(v-model)** | Value | `string \| number \| boolean` | `-` |
| default-checked | Whether checked by default (uncontrolled state) | `boolean` | `false` |
| value | The `value` of the option | `string \| number \| boolean` | `true` |
| type | Radio type | `'radio' \| 'button'` | `'radio'` |
| disabled | Whether to disable | `boolean` | `false` |

### `<radio>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Trigger when the value changes | value: `string \| number \| boolean`<br>ev: `Event` |

### `<radio>` Slots

| Slot Name | Description  | Parameters                                | version |
| --------- | ------------ | ----------------------------------------- | :------ |
| radio     | Custom radio | checked: `boolean`<br>disabled: `boolean` | 2.18.0  |

### `<radio-group>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | Value | `string \| number \| boolean` | `-` |  |
| default-value | Default value (uncontrolled state) | `string \| number \| boolean` | `''` |  |
| type | Types of radio group | `'radio' \| 'button'` | `'radio'` |  |
| size | The size of the radio group | `'mini' \| 'small' \| 'medium' \| 'large'` | `-` |  |
| options | Options | `Array<string \| number \| RadioOption>` | `-` | 2.27.0 |
| direction | The direction of the radio group | `'horizontal' \| 'vertical'` | `'horizontal'` |  |
| disabled | Whether to disable | `boolean` | `false` |  |

### `<radio-group>` Events

| Event Name | Description                    | Parameters                           |
| ---------- | ------------------------------ | ------------------------------------ |
| change     | Trigger when the value changes | value: `string \| number \| boolean` |

### `<radio-group>` Slots

| Slot Name | Description         | Parameters                                | version |
| --------- | ------------------- | ----------------------------------------- | :------ |
| radio     | Custom radio        | checked: `boolean`<br>disabled: `boolean` | 2.27.0  |
| label     | radio label content | data: `RadioOption`                       | 2.27.0  |

### RadioOption

| Name     | Description               | Type               | Default |
| -------- | ------------------------- | ------------------ | :-----: |
| label    | label content             | `RenderContent`    |   `-`   |
| value    | The `value` of the option | `string \| number` |   `-`   |
| disabled | Whether to disable        | `boolean`          | `false` |
