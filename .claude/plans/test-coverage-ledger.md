# Test Coverage Sweep Ledger — 组件维度 e2e 覆盖扫描

Goal: per-component scan → fill coverage gaps → run tests → fix → per-component commits → push → gh watch pipeline until release success.

Environment facts:
- Spec location: `packages/web-vue/components/<comp>/__test__/*.cy.ts` (index.cy.ts + demo.cy.ts)
- Run one component: `pnpm exec cypress run --component --browser chrome --quiet --spec "components/<comp>/__test__/*.cy.ts"` (from packages/web-vue, ~35s)
- NEVER run 2 cypress runs concurrently (deadlock). Windows: judge from √/× lines, browser may hang after tests.
- oxlint: use `.to.equal(true)`, never `.to.be.true`.
- cy.clock breaks Tooltip/Trigger hide animation.
- Commit convention: `test: 🧪 <中文描述>` / `fix: 🐛 <中文描述>`, lint-staged runs oxlint on staged files.
- Pipeline on push to main: typecheck → affected specs → cypress → build → semantic-release (test-only commits = "no release" but pipeline green).

## Worklist (status: todo | analyzing | running | fixing | done | no-change)

Total components: ~97 real ones (+ internal dirs _hooks/_components/_utils/style skipped).
DROPPED: chat-composer, header-list (empty skeleton dirs, no source ever committed — verified via git log & repo-wide grep).

Batch 1 ✅ committed (chat-composer✗dropped, header-list✗dropped, icon✅, theme-provider✅+fix, tree✅+fix, table✅+fixes, form✅, date-picker✅+fix, select✅, upload✅+fix)
Batch 2 ✅ committed (auto-complete, basic-crud-table, cascader, color-picker, config-provider, file-previewer, icon-component, input, input-number, input-tag)
Batch 3 ✅ committed (affix, alert, anchor, avatar, back-top, badge, bloom-menu, border-beam, breadcrumb, button + fix: button mergedDisabled click guard)
Batch 4 (analysis running): calendar, card, carousel, checkbox, clamp, collapse, comment, copy, cropper, divider
Batch 4: todo
Batch 5: todo
Batch 6: todo
Batch 7: todo
Batch 8: todo
Batch 9: todo
Batch 10: todo

## Component bug fixes committed
- tree base-node.vue:428 dragOver guard missing .value → fixed
- theme-provider popup-manager z-index leak on unmount → fixed
- date-picker use-range-header-value.ts:178 missing .value → fixed
- upload upload-list-item.vue:139 extension split('.')[1] → pop() → fixed
- table table-td.vue + table-th.vue: inheritAttrs:false without v-bind=$attrs dropped cell/header event listeners → fixed

## Reported (not fixed — needs product decision)
- table change event 3rd arg emits TableDataWithRaw wrappers instead of raw TableData (doc mismatch)
- select getValueFromValueKeys maps unknown keys to '' with fallbackOption:false
- auto-complete strict filter broken for string data; group options render as selectable
- color-picker trigger input typing broken (keepControl reverts); clear emits twice
- input-number invalid text lingers; Number('Infinity') accepted
- cascader-panel options watch not deep; expandTrigger/ellipsis provided non-reactive
- icon rotate+spin conflict (CSS animation overrides inline transform)
- input-password visibility prop semantics inverted vs JSDoc (inherited from arco)
- basic-crud-table: edit event on detail failure; delete event before API success; params spread order
Baseline runs done (all green, no changes needed yet): alert, anchor, avatar, back-top, badge, bloom-menu, border-beam, breadcrumb, calendar, card, carousel, checkbox, clamp, collapse, comment, copy, cropper, divider, drawer, dropdown, ellipsis, empty, grid, image, input-mask, kv-list, layout, link, list, menu, message, modal, model-selector, notification, number-flow, page-header, pagination, popconfirm, popover, qr-code, radio, regex-vis, resize-box, result, rich-text-editor, scrollbar, secret, selectable-card, sender, skeleton, slider, space, spin, split, statistic

## Per-component results

- icon: 0→12 tests (render/classes/svg attrs/size/rotate/spin/install/re-export), all pass. Reported (not fixed): rotate ignored while spin (CSS animation overrides inline transform); faceBook naming inconsistency. → commit test: 🧪 icon
- theme-provider: 0→12 tests, all pass. BUG FOUND (popup-manager z-index leak on unmount, config-provider/theme-provider.vue usePopupManager without cleanup) — fix pending. → commit test: 🧪 theme-provider (+fix)
- form: +19 tests (exposed validate/resetFields/clearValidate/setFields/validateField, submit events, layout/classes, disabled, rules priority, asterisk/slots/tooltip/hideLabel/noStyle/labelAttrs), all pass (22 index). Reported: scrollToFirstError typed Boolean but object used; FormItemInfo.validate type wrong; dead code wrapper-col-flex/touchedFields. → commit test: 🧪 form
- tree: +31 tests; fixed 3 wrong test expectations (checkAll/selectAll include leaf b; tabindex on inner input). FIXED component bug base-node.vue:428 onDragOver used `!draggable` instead of `!draggable.value`. All pass (43 index). → commits fix: 🐛 tree + test: 🧪 tree
- select: +23 tests; fixed 4 wrong expectations (dropdown stays in DOM hidden — assert not.be.visible; exceedLimit emits (value, ev); filter test math error). All pass (46 index). Reported: getValueFromValueKeys maps unknown keys to '' (fallbackOption:false); SelectProps interface stale. → commit test: 🧪 select
- table: +37 tests written; run in progress.
- date-picker: +32 tests written; not yet run. BUG FOUND (use-range-header-value.ts:178 missing .value on isDateOrWeek) — fix pending. Note: its unmountOnClose test may hit the after-leave environment issue (relax if needed).
- upload: +17 tests written; not yet run. BUG FOUND (upload-list-item.vue:139 extension split('.')[1] → should be pop()) — fix pending.
