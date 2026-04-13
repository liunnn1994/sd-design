```yaml
changelog: true
```

## 2.56.3

`2024-10-25`

### 🐛 BugFix

- fix custom empty slot not working in some cases ([#3315](https://github.com/liunnn1994/sd-design/pull/3315))

## 2.54.0

`2023-12-15`

### 💎 Enhancement

- Modifying `multiple` and `pathMode` will trigger changes in the binding value ([#2867](https://github.com/liunnn1994/sd-design/pull/2867))

## 2.51.1

`2023-09-08`

### 🐛 BugFix

- fix empty state in Cascader Virtual list ([#2686](https://github.com/liunnn1994/sd-design/pull/2686))

## 2.49.0

`2023-07-21`

### 🆕 Feature

- Add virtual list support ([#2577](https://github.com/liunnn1994/sd-design/pull/2577))

## 2.46.0

`2023-05-12`

### 🆕 Feature

- support full path search ([#2363](https://github.com/liunnn1994/sd-design/pull/2363))

## 2.45.1

`2023-04-14`

### 🐛 BugFix

- Fix the abnormal display of search results when the width of the control is short ([#2326](https://github.com/liunnn1994/sd-design/pull/2326))

## 2.40.0

`2022-12-09`

## 2.38.0-beta.2

`2022-10-21`

### 💎 Enhancement

- When the submenus are all disabled when optimizing multi-selection, the parent prohibits the selection ([#1771](https://github.com/liunnn1994/sd-design/pull/1771))

## 2.34.1

`2022-08-05`

### 💅 Style

- Fix style issue when dropdown panel is empty ([#1483](https://github.com/liunnn1994/sd-design/pull/1483))

## 2.33.1

`2022-07-22`

### 🐛 BugFix

- Fixed the wrong position of the horizontal scroll bar of the search drop-down menu ([#1438](https://github.com/liunnn1994/sd-design/pull/1438))
- Fix the problem that the cursor cannot be used after inputting content in search mode ([#1438](https://github.com/liunnn1994/sd-design/pull/1438))

## 2.29.1

`2022-06-02`

### 🐛 BugFix

- Fix the problem that the value of the number type fails to match ([#1230](https://github.com/liunnn1994/sd-design/pull/1230))

### 💎 Enhancement

- cascader-panel adds keyboard events ([#1230](https://github.com/liunnn1994/sd-design/pull/1230))

## 2.29.0

`2022-05-27`

### ⚠️ Important Attention

- Exposed parameter changed from CascaderOptionInfo to CascaderOption. Internal data is no longer included, user data is not affected ([#1201](https://github.com/liunnn1994/sd-design/pull/1201))

### 🆕 Feature

- Option value supports object format, add `value-key` attribute ([#1201](https://github.com/liunnn1994/sd-design/pull/1201))
- Add the `fallback` attribute to customize the display of options that do not exist ([#1201](https://github.com/liunnn1994/sd-design/pull/1201))
- Add the `expand-child` property to expand the submenu ([#1201](https://github.com/liunnn1994/sd-design/pull/1201))

### 💎 Enhancement

- Optimize submenu expansion logic and keyboard events ([#1201](https://github.com/liunnn1994/sd-design/pull/1201))

## 2.28.0

`2022-05-20`

### 🐛 BugFix

- Fix the problem that the multi-selection state is displayed incorrectly in the case of lazy loading ([#1177](https://github.com/liunnn1994/sd-design/pull/1177))
- Fix the problem that the lazy loading function is called multiple times when the selection box is clicked ([#1177](https://github.com/liunnn1994/sd-design/pull/1177))

## 2.25.2

`2022-04-27`

### 💅 Style

- Fixed the width of the search drop-down menu when it was blank ([#1056](https://github.com/liunnn1994/sd-design/pull/1056))

## 2.24.0

`2022-04-15`

### 🐛 BugFix

- Fix the problem that the half-selected state of the checkbox is displayed incorrectly ([#963](https://github.com/liunnn1994/sd-design/pull/963))

## 2.23.0

`2022-04-08`

### 🆕 Feature

- add empty slot ([#952](https://github.com/liunnn1994/sd-design/pull/952))

### 🐛 BugFix

- Fix the problem that lazy loaded isLeaf is invalid in version 2.22.0 ([#952](https://github.com/liunnn1994/sd-design/pull/952))
- Fixed an issue where the options property could not trigger an update in some cases ([#952](https://github.com/liunnn1994/sd-design/pull/952))

## 2.22.0

`2022-04-01`

### 🆕 Feature

- Added `field-names` attribute to allow custom fields ([#912](https://github.com/liunnn1994/sd-design/pull/912))

## 2.20.0

`2022-03-18`

### 🆕 Feature

- Add `cascader-panel` component ([#842](https://github.com/liunnn1994/sd-design/pull/842))

### 🐛 BugFix

- Fix the problem that the selected path of the drop-down menu may not match the current value ([#843](https://github.com/liunnn1994/sd-design/pull/843))

## 2.18.0

`2022-03-04`

### 🆕 Feature

- Added `#option`, `#label` slots ([#781](https://github.com/liunnn1994/sd-design/pull/781))

## 2.18.0-beta.2

`2022-02-25`

### 🆕 Feature

- Added `search-delay` property and defaulted to `500ms` ([#729](https://github.com/liunnn1994/sd-design/pull/729))
- Add the `search-option-only-label` attribute and modify the default display path label of the options in the search drop-down menu ([#729](https://github.com/liunnn1994/sd-design/pull/729))

### 🐛 BugFix

- Fix the problem that the selection box display is not updated after the option is updated ([#727](https://github.com/liunnn1994/sd-design/pull/727))

## 2.18.0-beta.1

`2022-02-18`

### 🐛 BugFix

- Fixed an issue where disabled items could still be selected via radio selectors in strict mode ([#701](https://github.com/liunnn1994/sd-design/pull/701))
- Fixed an issue where search results in strict mode did not include path options ([#701](https://github.com/liunnn1994/sd-design/pull/701))

## 2.16.0

`2022-01-21`

### 🐛 BugFix

- Fixed an issue where the search could not be selected in `check-strictly` mode ([#627](https://github.com/liunnn1994/sd-design/pull/627))

## 2.15.0

`2022-01-14`

### 🆕 Feature

- Add loading prop ([#558](https://github.com/liunnn1994/sd-design/pull/558))

## 2.13.0

`2021-12-31`

### 🆕 Feature

- Added `load-more` attribute to support lazy loading of data ([#476](https://github.com/liunnn1994/sd-design/pull/476))

## 2.11.0

`2021-12-17`

### 🐛 BugFix

- Fix the problem that the level totalLevel is calculated incorrectly ([#399](https://github.com/liunnn1994/sd-design/pull/399))

## 2.10.1

`2021-12-14`

### 🐛 BugFix

- Fix the problem of counting errors when there is an empty sub-menu in multi-select mode ([#388](https://github.com/liunnn1994/sd-design/pull/388))

## 2.10.0

`2021-12-10`

### 💎 Enhancement

- When the input box is editable, clicking will not close the drop-down menu ([#348](https://github.com/liunnn1994/sd-design/pull/348))

### 🆕 Feature

- Add checkStrictly prop ([#349](https://github.com/liunnn1994/sd-design/pull/349))

## 2.8.0

`2021-12-01`

### 🆕 Feature

- Add support for `tagProps` ([#307](https://github.com/liunnn1994/sd-design/pull/307))

### 💅 Style

- Remove the option to select the bold effect ([#308](https://github.com/liunnn1994/sd-design/pull/308))

## 2.6.0

`2021-11-19`

### 🆕 Feature

- Add `trigger-props` property ([#197](https://github.com/liunnn1994/sd-design/pull/197))

## 2.5.0

`2021-11-18`

### ⚠️ Important Attention

- Move the custom rendering of `options.label` added in 2.4.0 to `options.render` ([#183](https://github.com/liunnn1994/sd-design/pull/183))

## 2.4.0

`2021-11-17`

### 🆕 Feature

- Add `options.value` number type and `options.label` custom rendering support ([#176](https://github.com/liunnn1994/sd-design/pull/176))

### 🐛 BugFix

- Fix the problem that the search input box cannot be scrolled ([#175](https://github.com/liunnn1994/sd-design/pull/175))
