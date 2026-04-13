```yaml
meta:
  type: Component
  category: Data Entry
title: Checkbox
description: In a set of data, the user can select one or more data through the check box.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/control.md

@import ./**demo**/disabled.md

@import ./**demo**/group.md

@import ./**demo**/options.md

@import ./**demo**/limit.md

@import ./**demo**/all.md

@import ./**demo**/layout.md

@import ./**demo**/custom.md

## API

### `<checkbox>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| model-value **(v-model)** | Value | `boolean \| Array<string \| number \| boolean>` | `-` |
| default-checked | Whether checked by default (uncontrolled state) | `boolean` | `false` |
| value | The `value` of the option | `string\|number\|boolean` | `-` |
| disabled | Whether to disable | `boolean` | `false` |
| indeterminate | Whether it is half-selected | `boolean` | `false` |

### `<checkbox>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Trigger when the value changes | value: `boolean \| (string \| number \| boolean)[]`<br>ev: `Event` |

### `<checkbox>` Slots

| Slot Name | Description     | Parameters                                | version |
| --------- | --------------- | ----------------------------------------- | :------ |
| checkbox  | Custom checkbox | checked: `boolean`<br>disabled: `boolean` | 2.18.0  |

### `<checkbox-group>` Props

| Attribute | Description | Type | Default | version |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | Value | `Array<string \| number \| boolean>` | `-` |  |
| default-value | Default value (uncontrolled state) | `Array<string \| number \| boolean>` | `[]` |  |
| max | Support the maximum number of selections | `number` | `-` | 2.36.0 |
| options | Options | `Array<string \| number \| CheckboxOption>` | `-` | 2.27.0 |
| direction | Arrangement direction of checkboxes | `Direction` | `'horizontal'` |  |
| disabled | Whether to disable | `boolean` | `false` |  |

### `<checkbox-group>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Trigger when the value changes | value: `(string \| number \| boolean)[]`<br>ev: `Event` |

### `<checkbox-group>` Slots

| Slot Name | Description            | Parameters                                | version |
| --------- | ---------------------- | ----------------------------------------- | :------ |
| checkbox  | Custom checkbox        | checked: `boolean`<br>disabled: `boolean` | 2.27.0  |
| label     | checkbox label content | data: `CheckboxOption`                    | 2.27.0  |

### CheckboxOption

| Name          | Description                 | Type               | Default |
| ------------- | --------------------------- | ------------------ | :-----: |
| label         | label content               | `RenderContent`    |   `-`   |
| value         | The `value` of the option   | `string \| number` |   `-`   |
| disabled      | Whether to disable          | `boolean`          | `false` |
| indeterminate | Whether it is half-selected | `boolean`          | `false` |
