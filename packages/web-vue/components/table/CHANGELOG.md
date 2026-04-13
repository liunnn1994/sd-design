```yaml
changelog: true
```

## 2.57.0

`2025-03-10`

### 🐛 BugFix

- Fix fixed column background style issue in dark mode ([#3398](https://github.com/liunnn1994/sd-design/pull/3398))

## 2.55.3

`2024-06-07`

### 🆕 Feature

- colum added the minWidth attribute ([#3157](https://github.com/liunnn1994/sd-design/pull/3157))

### 🐛 BugFix

- fix table sticky-header failure with scrollbar ([#3170](https://github.com/liunnn1994/sd-design/pull/3170))
- Restore default style when table dynamically switches row-selection ([#3155](https://github.com/liunnn1994/sd-design/pull/3155))

## 2.54.4

`2024-02-02`

### 🐛 BugFix

- fix virtual table list not displaying empty state ([#2949](https://github.com/liunnn1994/sd-design/pull/2949))

## 2.54.2

`2024-01-11`

### 🐛 BugFix

- Fix the problem of `span-method` reporting an error after exceeding the number of rows and columns ([#2914](https://github.com/liunnn1994/sd-design/pull/2914))

## 2.51.0

`2023-09-01`

### 🆕 Feature

- Support displaying empty subtrees ([#2673](https://github.com/liunnn1994/sd-design/pull/2673))

## 2.49.2

`2023-07-28`

### 🐛 BugFix

- Fix the problem of turning on the adjustment of column width in the fixed column ([#2598](https://github.com/liunnn1994/sd-design/pull/2598))
- fix drag issue in tree table ([#2503](https://github.com/liunnn1994/sd-design/pull/2503))

## 2.49.0

`2023-07-21`

### 🐛 BugFix

- Fix the wrong parameter of rowClass function record ([#2570](https://github.com/liunnn1994/sd-design/pull/2570))

## 2.48.1

`2023-07-14`

### 🐛 BugFix

- Fix the wrong outgoing parameter in the `summary-span-method` attribute ([#2552](https://github.com/liunnn1994/sd-design/pull/2552))
- fix the bug of merging cells in subtrees ([#2540](https://github.com/liunnn1994/sd-design/pull/2540))

## 2.48.0

`2023-06-30`

### 🆕 Feature

- Added mouse in and out events for cells ([#2489](https://github.com/liunnn1994/sd-design/pull/2489))

### 🐛 BugFix

- add headerCell down to adjust column width highlight ([#2519](https://github.com/liunnn1994/sd-design/pull/2519))

## 2.46.1

`2023-05-26`

### 💎 Enhancement

- Add table right-click and double-click events ([#2452](https://github.com/liunnn1994/sd-design/pull/2452))

## 2.46.0

`2023-05-12`

### 🐛 BugFix

- Fix the problem that when the dataIndex is in the path format, the sorting and summary column functions do not take effect ([#2413](https://github.com/liunnn1994/sd-design/pull/2413))

## 2.45.1

`2023-04-14`

### 💅 Style

- Fix the problem of displaying the horizontal scroll bar under the virtual list ([#2337](https://github.com/liunnn1994/sd-design/pull/2337))

## 2.41.1

`2023-01-06`

### 🐛 BugFix

- Fix the problem that the width error may appear after the browser is zoomed when `scroll` is turned on ([#2028](https://github.com/liunnn1994/sd-design/pull/2028))

## 2.41.0

`2022-12-30`

### 🐛 BugFix

- Fix the problem that there is no shadow when only the `operations` column is fixed ([#1938](https://github.com/liunnn1994/sd-design/pull/1938))

## 2.40.0

`2022-12-09`

### 🆕 Feature

- The change event increases the current data parameter ([#1893](https://github.com/liunnn1994/sd-design/pull/1893))

## 2.39.2

`2022-12-02`

### 🐛 BugFix

- Fix the problem that thead will have a vertical scroll bar in some cases ([#1913](https://github.com/liunnn1994/sd-design/pull/1913))

## 2.38.3

`2022-11-11`

### 🐛 BugFix

- Fixed an issue where a warning would appear when customizing table elements in some scenarios

## 2.38.2

`2022-11-09`

### 🐛 BugFix

- Fix row selector state error ([#1849](https://github.com/liunnn1994/sd-design/pull/1849))

## 2.38.1

`2022-11-04`

### 🐛 BugFix

- fix param when rowClass as function ([#1812](https://github.com/liunnn1994/sd-design/pull/1812))

## 2.38.0

`2022-10-28`

### 💅 Style

- Fix stripe style issue in dark mode ([#1795](https://github.com/liunnn1994/sd-design/pull/1795))

## 2.38.0-beta.1

`2022-10-14`

### 💅 Style

- Fixed the problem that summary row height was compressed when both summary row and scroll were enabled in the table ([#1733](https://github.com/liunnn1994/sd-design/pull/1733))

## 2.37.4

`2022-09-30`

### 🐛 BugFix

- Fix default sorter&filters not working under template usage ([#1707](https://github.com/liunnn1994/sd-design/pull/1707))

## 2.37.3

`2022-09-23`

### 🐛 BugFix

- Fix the problem that the tooltip does not display after the content changes ([#1662](https://github.com/liunnn1994/sd-design/pull/1662))

### 🆎 TypeScript

- fix TableRowSelection type definition ([#1667](https://github.com/liunnn1994/sd-design/pull/1667))

## 2.37.2

`2022-09-21`

### 🐛 BugFix

- Fixed the virtual scroll bar style error caused by maxHeight in the scroll property ([#1655](https://github.com/liunnn1994/sd-design/pull/1655))

## 2.36.0

`2022-09-02`

### 🆕 Feature

- Add custom class name related prop ([#1580](https://github.com/liunnn1994/sd-design/pull/1580))

### 💎 Enhancement

- type of extension key ([#1580](https://github.com/liunnn1994/sd-design/pull/1580))

## 2.35.0

`2022-08-12`

### 💅 Style

- adjust zIndex of a fixed col ([#1479](https://github.com/liunnn1994/sd-design/pull/1479))

## 2.34.0

`2022-07-29`

### 💎 Enhancement

- columns support reactive type updates ([#1470](https://github.com/liunnn1994/sd-design/pull/1470))
- rowClass supports values of function types ([#1453](https://github.com/liunnn1994/sd-design/pull/1453))

## 2.33.1

`2022-07-22`

### 💎 Enhancement

- Selected rows can be displayed when selected-keys are set individually ([#1440](https://github.com/liunnn1994/sd-design/pull/1440))

## 2.32.1

`2022-07-01`

### 🐛 BugFix

- Fixed the problem that the text prompt did not follow the content update ([#1373](https://github.com/liunnn1994/sd-design/pull/1373))

## 2.32.0

`2022-06-24`

### 🆕 Feature

- TableRowSelection adds the onlyCurrent property to change the default state of the table to maintain the selection state of all paging ([#1334](https://github.com/liunnn1994/sd-design/pull/1334))

### 💎 Enhancement

- The style added by the cellStyle class attribute is moved to the td element to solve the background color problem in some scenes ([#1334](https://github.com/liunnn1994/sd-design/pull/1334))

## 2.31.0

`2022-06-17`

### 🆕 Feature

- Add new component methods, see the documentation for details ([#1304](https://github.com/liunnn1994/sd-design/pull/1304))
- The slot defined by titleSlotName adds the column parameter ([#1304](https://github.com/liunnn1994/sd-design/pull/1304))

## 2.30.2

`2022-06-11`

### 🐛 BugFix

- Fix the problem that the header is centered when align='left' ([#1278](https://github.com/liunnn1994/sd-design/pull/1278))

### 💎 Enhancement

- Indent no longer shows when there is no expand button ([#1278](https://github.com/liunnn1994/sd-design/pull/1278))

## 2.30.0

`2022-06-10`

### ⚠️ Important Attention

- Due to functional requirements, `sd-table-cell` has been changed to flex layout, and the `sd-table-td-content` wrapper layer has been added outside the table content. If you have custom styles, please pay attention to the changes in the DOM structure ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))

### 🆕 Feature

- Added `sticky-header` header ceiling function ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))
- Added `summaryCellStyle` property to table column configuration ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))

### 🐛 BugFix

- Fixed the problem of incorrect text omission in tree data ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))
- Fix the problem of using grouped headers and fixed columns at the same time ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))

### 💎 Enhancement

- Supports the simultaneous use of virtual lists and fixed columns ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))

### 💅 Style

- Fix horizontal scroll shadow issue ([#1248](https://github.com/liunnn1994/sd-design/pull/1248))

## 2.29.0

`2022-05-27`

### 🆕 Feature

- Line selectors add non-strict mode support (cascading control) ([#1202](https://github.com/liunnn1994/sd-design/pull/1202))
- Column properties add headerCellStyle and bodyCellStyle ([#1202](https://github.com/liunnn1994/sd-design/pull/1202))

## 2.28.0

`2022-05-20`

### 🆕 Feature

- `expand` and `select` events add record parameter ([#1178](https://github.com/liunnn1994/sd-design/pull/1178))
- Added `columnResize` event ([#1178](https://github.com/liunnn1994/sd-design/pull/1178))

## 2.27.0

`2022-05-13`

### 💅 Style

- Fixed the problem of vertical scroll bar when there are fixed columns ([#1124](https://github.com/liunnn1994/sd-design/pull/1124))

### 🆎 TypeScript

- Use VNodeChild instead of VNode in the interface to support a wider range of types ([#1118](https://github.com/liunnn1994/sd-design/pull/1118))

## 2.26.0

`2022-04-29`

### 🆕 Feature

- Column configuration adds tooltip attribute ([#1065](https://github.com/liunnn1994/sd-design/pull/1065))
- Add thead, th slots, tr, td slots add outgoing data ([#1065](https://github.com/liunnn1994/sd-design/pull/1065))

### 💎 Enhancement

- The table-column dynamic modification order does not need to manually specify the index ([#1065](https://github.com/liunnn1994/sd-design/pull/1065))

## 2.25.1

`2022-04-27`

### 🐛 BugFix

- Fix the problem of wrong format of outgoing record parameter in extended line in `2.25.0` version ([#1047](https://github.com/liunnn1994/sd-design/pull/1047))

### 💅 Style

- Added internal table class names, fixed styling issues used with `descriptions` component ([#1053](https://github.com/liunnn1994/sd-design/pull/1053))

## 2.25.0

`2022-04-22`

### 🆕 Feature

- Add row selector and expand row two-way binding properties ([#1023](https://github.com/liunnn1994/sd-design/pull/1023))
- Add a second param `rowKey` to the `select` event ([#999](https://github.com/liunnn1994/sd-design/pull/999))

### 💎 Enhancement

- The `record` parameter of custom cell rendering supports modification ([#1023](https://github.com/liunnn1994/sd-design/pull/1023))

## 2.24.0

`2022-04-15`

### 💎 Enhancement

- When titleSlotName exists in the columns attribute, it will be used first ([#969](https://github.com/liunnn1994/sd-design/pull/969))

### 🆎 TypeScript

- `TableColumn` interface name is changed to `TableColumnData` ([#983](https://github.com/liunnn1994/sd-design/pull/983))

## 2.23.0

`2022-04-08`

### 💎 Enhancement

- In horizontal scrolling mode, if the data is empty, the header will display a scroll bar ([#948](https://github.com/liunnn1994/sd-design/pull/948))

### 🆕 Feature

- Add titleSlotName to the columns attribute and slotName to the filterable attribute ([#948](https://github.com/liunnn1994/sd-design/pull/948))
- table-column adds filter-content, filter-content slot ([#948](https://github.com/liunnn1994/sd-design/pull/948))
- Added summary-cell slot ([#948](https://github.com/liunnn1994/sd-design/pull/948))

## 2.22.1

`2022-04-02`

### 🐛 BugFix

- Fix virtual list and scrolling used together ([#926](https://github.com/liunnn1994/sd-design/pull/926))

## 2.22.0

`2022-04-01`

### 🆕 Feature

- Added `selectAll` method ([#920](https://github.com/liunnn1994/sd-design/pull/920))

### 🐛 BugFix

- Fix the problem of wrong virtual list width in some cases ([#920](https://github.com/liunnn1994/sd-design/pull/920))

## 2.21.0

`2022-03-25`

### 🆕 Feature

- Add summary prop ([#877](https://github.com/liunnn1994/sd-design/pull/877))

## 2.20.2

`2022-03-24`

### 🐛 BugFix

- Fixed the problem that the `table-column` component caused continuous updating when writing object parameters directly in the template ([#861](https://github.com/liunnn1994/sd-design/pull/861))
- Fix the problem that there is no column data when there is only one `table-column` ([#861](https://github.com/liunnn1994/sd-design/pull/861))
- Fix the sorting problem of `table-column`, which can be solved by the `index` parameter ([#861](https://github.com/liunnn1994/sd-design/pull/861))

## 2.20.0

`2022-03-18`

### 🆕 Feature

- Use Context to refactor components, `table-colum` supports secondary encapsulation ([#845](https://github.com/liunnn1994/sd-design/pull/845))
- scroll property adds `maxHeight`, `minWidth` properties ([#845](https://github.com/liunnn1994/sd-design/pull/845))

### 💅 Style

- Fixed the problem that the header text could not be centered after sorting was enabled ([#845](https://github.com/liunnn1994/sd-design/pull/845))

## 2.19.0

`2022-03-11`

### ⚠️ Important Attention

- Modify the outgoing data of the sorting function sorter to enhance the usage ([#810](https://github.com/liunnn1994/sd-design/pull/810))

## 2.18.0

`2022-03-04`

### 🆕 Feature

- Scroll mode supports setting height percentage ([#780](https://github.com/liunnn1994/sd-design/pull/780))
- The column data adds the slotName property to allow specifying a rendering slot ([#780](https://github.com/liunnn1994/sd-design/pull/780))
- Added `pagination-left` and `pagination-right` slots ([#780](https://github.com/liunnn1994/sd-design/pull/780))

## 2.18.0-beta.2

`2022-02-25`

### 🆕 Feature

- Added `span-all` attribute ([#735](https://github.com/liunnn1994/sd-design/pull/735))

### 🐛 BugFix

- Fix the problem that v-for cannot render when table-column is nested ([#734](https://github.com/liunnn1994/sd-design/pull/734))

## 2.18.0-beta.1

`2022-02-18`

### 💎 Enhancement

- Does not show pagination when the data is empty ([#684](https://github.com/liunnn1994/sd-design/pull/684))

## 2.16.2

`2022-01-24`

### 🐛 BugFix

- Fix the problem of preventing bubbling and causing lazy loading to fail ([#641](https://github.com/liunnn1994/sd-design/pull/641))
- **table:** fix the problem that empty rows are displayed after deletion when expanding rows

## 2.16.0

`2022-01-21`

### 💎 Enhancement

- Internal buttons no longer fire `row-click` events ([#630](https://github.com/liunnn1994/sd-design/pull/630))

### 🆕 Feature

- Add support for drag and drop sorting (experimental) ([#619](https://github.com/liunnn1994/sd-design/pull/619))
- Add support for resizing column widths (experimental) ([#619](https://github.com/liunnn1994/sd-design/pull/619))
- Added `tbody`, `tr`, `td` slots ([#619](https://github.com/liunnn1994/sd-design/pull/619))

## 2.15.0

`2022-01-14`

### 🆕 Feature

- `sortable.sorter` adds boolean type to support server-side sorting ([#575](https://github.com/liunnn1994/sd-design/pull/575))

## 2.14.2

`2022-01-10`

### 🐛 BugFix

- Fix the problem that the table content exceeds the container, causing the border not to be displayed in some cases ([#536](https://github.com/liunnn1994/sd-design/pull/536))

## 2.14.0

`2022-01-07`

### 🆕 Feature

- Add hideExpandButtonOnEmpty property ([#520](https://github.com/liunnn1994/sd-design/pull/520))

### 🐛 BugFix

- fix x-axis resize issue ([#519](https://github.com/liunnn1994/sd-design/pull/519))
- Fix the problem that the width of the expanded row is incorrectly set when there are fixed columns ([#519](https://github.com/liunnn1994/sd-design/pull/519))
- Fix the problem that the checkbox selection all is set incorrectly when there are subtrees ([#519](https://github.com/liunnn1994/sd-design/pull/519))

## 2.13.0

`2021-12-31`

### 🆕 Feature

- Added `loadMore` property to support sub-slacker loading ([#485](https://github.com/liunnn1994/sd-design/pull/485))
- Add `filterIconAlignLeft` property ([#485](https://github.com/liunnn1994/sd-design/pull/485))
- Added `change` event to get processed data ([#485](https://github.com/liunnn1994/sd-design/pull/485))

### 🐛 BugFix

- Fix the problem of invalid `sortOrder` emptying ([#478](https://github.com/liunnn1994/sd-design/pull/478))
- Fix the issue that the `expand-icon` slot does not take effect in the subtree ([#478](https://github.com/liunnn1994/sd-design/pull/478))
- Fix the problem that the shadow of the fixed column does not display when the table size changes dynamically ([#478](https://github.com/liunnn1994/sd-design/pull/478))

## 2.12.0

`2021-12-24`

### 💅 Style

- Fix the problem of extra border on the last row in table scroll mode ([#456](https://github.com/liunnn1994/sd-design/pull/456))

## 2.11.0

`2021-12-17`

### 🆕 Feature

- `columns` added cellStyle property ([#411](https://github.com/liunnn1994/sd-design/pull/411))

### 🐛 BugFix

- Fix the problem of inconsistent width between the header and the main body caused by the change of the table size in the fixed column mode ([#410](https://github.com/liunnn1994/sd-design/pull/410))

## 2.10.0

`2021-12-10`

### 🆕 Feature

- Add span-method prop ([#360](https://github.com/liunnn1994/sd-design/pull/360))

## 2.9.0

`2021-12-03`

### 🐛 BugFix

- Fix the problem that the tree expand button triggers form submission ([#321](https://github.com/liunnn1994/sd-design/pull/321))

## 2.7.0

`2021-11-26`

### 🆕 Feature

- Add `footer` slot ([#266](https://github.com/liunnn1994/sd-design/pull/266))
- In normal mode, the scroll bar will be turned on when the table width is larger than the container ([#266](https://github.com/liunnn1994/sd-design/pull/266))

## 2.6.1

`2021-11-24`

### 💎 Enhancement

- Do not scroll when data is empty ([#245](https://github.com/liunnn1994/sd-design/pull/245))

### 🐛 BugFix

- Fix the issue that the expand row button triggers form submission ([#210](https://github.com/liunnn1994/sd-design/pull/210))

## 2.3.0

`2021-11-12`

### 🐛 BugFix

- Fix the problem that `<table-column>` is wrong in the header of the grouping table ([#151](https://github.com/liunnn1994/sd-design/pull/151))

## 2.2.0

`2021-11-10`

### 🆕 Feature

- Add `row-key` prop ([#128](https://github.com/liunnn1994/sd-design/pull/128))
- Add `expandedRowRender` and `icon` props in `expandable` ([#128](https://github.com/liunnn1994/sd-design/pull/128))
- Add `expand-icon` and `expand-row` slots ([#128](https://github.com/liunnn1994/sd-design/pull/128))

### 🐛 BugFix

- Fix the problem that the table operation items in the header grouping are occupied incorrectly ([#127](https://github.com/liunnn1994/sd-design/pull/127))

## 2.1.0

`2021-11-05`

### 🆕 Feature

- Add the `#title` slot in `table-column` ([#95](https://github.com/liunnn1994/sd-design/pull/95))

### 🐛 BugFix

- Fix the issue that `#column` slot cannot support Fragment ([#83](https://github.com/liunnn1994/sd-design/pull/83))
- Fix the problem that `scroll.x` does not take effect when used alone ([#83](https://github.com/liunnn1994/sd-design/pull/83))

## 2.0.3

`2021-10-29`

### 🐛 BugFix

- Fix the display of scroll bar in `scroll` mode, causing cell misalignment ([#29](https://github.com/liunnn1994/sd-design/pull/29))
