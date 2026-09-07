# Graph Report - sd-design  (2026-09-07)

## Corpus Check
- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 233 nodes · 205 edges · 74 communities (17 shown, 57 thin omitted)
- Extraction: 1% EXTRACTED · 99% INFERRED · 0% AMBIGUOUS · INFERRED: 202 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f3a4881`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DemoBlock component
- Form Component Doc
- upgrade-style-architecture
- Generated Demo Components
- Tooltip
- simplify-build-tooling-remove-sd-vue-scripts change
- menu component
- migrate-generated-demos-to-script-setup-tailwind
- overdrive skill
- Table Component
- Astro Config (sd-vue-docs)
- polish skill
- quieter skill
- typeset skill
- Popconfirm Component Doc
- sync-vendor.mjs
- SdThemeConfig
- Astro Runtime (Starlight + MDX)
- Tabs Component
- LLMs.txt Standard
- SdDesignResolver
- Netlify docs deploy
- OpenSpec CLI
- Astro/Starlight
- build-dts.mjs
- CascaderOption
- CascaderPanel
- Cascader Naive UI Migration
- SelectView
- Trigger
- Virtual List Migration Guide
- ColorPicker Migration
- Progress Component
- Rate Component
- Result Component
- Spin
- Split
- Steps
- Switch
- Switch Component
- Tabs
- Tag Component
- Timeline
- Timeline Component
- Transfer
- Typography Component
- Upload
- Upload Component
- VerificationCode
- VerificationCode Component
- Watermark
- Watermark Component
- cropperjs
- RangePicker
- ShortcutType
- DescriptionsItem
- Docs Index
- Getting Started
- icongen
- Jest
- jsongen (Metadata Generator)
- Link Component Doc
- release-auto-import-resolver workflow
- Result Component Doc
- Root Directory
- OverlayScrollbars
- Select Arco Design Migration
- Select Naive UI Migration
- SelectOptionData
- VirtualListProps
- Skeleton Component Doc
- Space Component Doc
- Vite
- web-vue-build-migration spec

## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- `Migrate Generated Demos to Script Setup + Tailwind` --modifies--> `Generated Demo Components`  [INFERRED]
   →   _Bridges community 10 → community 3_
- `Form Component Doc` --uses--> `DemoBlock component`  [INFERRED]
   →   _Bridges community 1 → community 0_
- `Ellipsis Component Docs` --uses--> `DemoBlock component`  [INFERRED]
   →   _Bridges community 6 → community 0_

## Import Cycles
- None detected.

## Communities (74 total, 57 thin omitted)

### Community 0 - "DemoBlock component"
Cohesion: 0.11
Nodes (21): anchor component, anchor-link component, Anchor Component Docs, back-top component, BackTop Component Docs, calendar component, Calendar Event System, Calendar Component Docs (+13 more)

### Community 1 - "Form Component Doc"
Cohesion: 0.13
Nodes (21): Component Size System, Empty Component Doc, FieldRule type, form component, form-item component, Form Component Doc, useFormItem composable, useFormItem Hook (+13 more)

### Community 2 - "upgrade-style-architecture"
Cohesion: 0.15
Nodes (19): ConfigProvider theme object, CSS variable fallback strategy, css-variable-token-system spec, docs-theme-editor spec, fix-local-theme design, fix-local-theme implementation baseline, fix-local-theme-implementation, fix-local-theme tasks (+11 more)

### Community 3 - "Generated Demo Components"
Cohesion: 0.23
Nodes (16): Alert Component Documentation, Avatar Component Documentation, Badge Component Documentation, Breadcrumb Component Documentation, Button Component Documentation, Card Component Documentation, Carousel Component Documentation, Checkbox Component Documentation (+8 more)

### Community 4 - "Tooltip"
Cohesion: 0.20
Nodes (12): Table, Tag, Tooltip, Tree, TreeSelect, Typography, Arco Design Migration, Controlled/Uncontrolled Pattern (+4 more)

### Community 5 - "simplify-build-tooling-remove-sd-vue-scripts change"
Cohesion: 0.27
Nodes (10): component-library-tooling capability, docs-tooling-simplification capability, migrate-web-vue-to-vite-plus design, migrate-web-vue-to-vite-plus proposal, migrate-web-vue-to-vite-plus tasks, packages/sd-vue-scripts, simplify-build-tooling-remove-sd-vue-scripts change, simplify-build-tooling tasks (+2 more)

### Community 6 - "menu component"
Cohesion: 0.24
Nodes (10): ellipsis component, Ellipsis Component Docs, Layout Component Docs, layout component, layout-header component, layout-sider component, Menu Component Docs, menu component (+2 more)

### Community 7 - "migrate-generated-demos-to-script-setup-tailwind"
Cohesion: 0.28
Nodes (9): DemoEditor REPL preview, generated-demo-source-conventions spec, interactive-doc-examples spec (modified), migrate-generated-demos design, migrate-generated-demos-to-script-setup-tailwind, migrate-generated-demos tasks, script setup lang=ts convention, shared demo Tailwind stylesheet (+1 more)

### Community 8 - "overdrive skill"
Cohesion: 0.22
Nodes (9): browser automation iteration (overdrive), context-appropriate ambition assessment, frontend-design skill dependency (overdrive), performance rules (overdrive), progressive enhancement (overdrive), propose before building (overdrive), overdrive skill, overdrive technical toolkit (+1 more)

### Community 9 - "Table Component"
Cohesion: 0.29
Nodes (8): Radio Component, TableColumnData, Table Component, Naive UI Compatibility Aliases, TreeSelect Component, Tree Component, TreeNodeData, VirtualListProps (Tree)

### Community 10 - "Astro Config (sd-vue-docs)"
Cohesion: 0.25
Nodes (8): Generated Demo Source Conventions Spec, Migrate Generated Demos to Script Setup + Tailwind, sd-vue-docs, Astro Config (sd-vue-docs), Generated Docs Sidebar, LLMs Documentation Integration, LLMs.txt Documentation Page, Tailwind CSS Setup

### Community 11 - "polish skill"
Cohesion: 0.29
Nodes (7): polish checklist, polish dimensions, final verification (polish), frontend-design skill dependency (polish), interaction states checklist, pre-polish assessment, polish skill

### Community 12 - "quieter skill"
Cohesion: 0.40
Nodes (5): frontend-design skill dependency (quieter), intensity source assessment, quieter design philosophy, quieter refinement dimensions, quieter skill

### Community 13 - "typeset skill"
Cohesion: 0.40
Nodes (5): typography assessment dimensions, frontend-design skill dependency (typeset), typography improvement dimensions, typography sizing strategy, typeset skill

### Community 14 - "Popconfirm Component Doc"
Cohesion: 0.50
Nodes (4): Image Component Doc, Popconfirm Component Doc, Popover Component Doc, Trigger Component

### Community 15 - "sync-vendor.mjs"
Cohesion: 0.67
Nodes (3): Build Artifacts (es, dist, json), Public Vendor Resources, sync-vendor.mjs

### Community 16 - "SdThemeConfig"
Cohesion: 0.67
Nodes (3): CSS Variables Convention, SdThemeConfig, ThemeProvider

## Knowledge Gaps
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 15 inferred relationships involving `Generated Demo Components` (e.g. with `Migrate Generated Demos to Script Setup + Tailwind` and `Alert Component Documentation`) actually correct?**
  _`Generated Demo Components` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `Form Component Doc` (e.g. with `Component Size System` and `DemoBlock component`) actually correct?**
  _`Form Component Doc` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `DemoBlock Component` (e.g. with `Alert Component Documentation` and `Avatar Component Documentation`) actually correct?**
  _`DemoBlock Component` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `DemoBlock component` (e.g. with `Anchor Component Docs` and `BackTop Component Docs`) actually correct?**
  _`DemoBlock component` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `upgrade-style-architecture` (e.g. with `fix-local-theme-implementation` and `ConfigProvider theme object`) actually correct?**
  _`upgrade-style-architecture` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `DemoBlock component` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Should `Form Component Doc` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._